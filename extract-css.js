import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, 'src');
const STYLES_DIR = path.join(SRC_DIR, 'styles');

// Các thư mục cần xử lý
const targetDirs = ['components', 'context', 'pages', 'components/UI'];

// Hàm chuyển đổi camelCase sang kebab-case
const camelToKebab = (str) => str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

// Hàm kiểm tra xem ObjectExpression có tĩnh hoàn toàn không
const isStaticStyleObject = (objectExpression) => {
    for (const prop of objectExpression.properties) {
        if (!t.isObjectProperty(prop)) return false; // Không hỗ trợ SpreadElement
        if (!t.isIdentifier(prop.key) && !t.isStringLiteral(prop.key)) return false;
        
        const value = prop.value;
        if (!t.isStringLiteral(value) && !t.isNumericLiteral(value) && !t.isBooleanLiteral(value)) {
            return false; // Chứa biến động, template literal có expression, function call, v.v.
        }
    }
    return true;
};

const processFile = (filePath) => {
    console.log(`Đang xử lý: ${filePath}`);
    const code = fs.readFileSync(filePath, 'utf-8');
    
    let ast;
    try {
        ast = parse(code, {
            sourceType: 'module',
            plugins: ['jsx']
        });
    } catch (err) {
        console.error(`Lỗi parse file ${filePath}:`, err.message);
        return;
    }

    let cssContent = '';
    let styleCounter = 1;
    const fileName = path.basename(filePath, '.jsx');
    const relPath = path.relative(SRC_DIR, path.dirname(filePath)); // VD: pages hoặc components/UI
    
    let hasChanges = false;
    let hasStyleImport = false;

    // Traverse the AST
    traverse(ast, {
        // 1. Xử lý thẻ <style> bên trong JSX
        JSXElement(path) {
            const openingElement = path.node.openingElement;
            if (t.isJSXIdentifier(openingElement.name, { name: 'style' })) {
                // Thường thẻ <style> chứa JSXExpressionContainer với TemplateLiteral
                // Ví dụ: <style>{` .class { color: red } `}</style>
                const children = path.node.children;
                if (children.length === 1 && t.isJSXExpressionContainer(children[0])) {
                    const expression = children[0].expression;
                    if (t.isTemplateLiteral(expression) && expression.expressions.length === 0) {
                        cssContent += expression.quasis[0].value.raw + '\n';
                        path.remove();
                        hasChanges = true;
                    } else if (t.isStringLiteral(expression)) {
                        cssContent += expression.value + '\n';
                        path.remove();
                        hasChanges = true;
                    }
                }
            }
        },
        
        // 2. Xử lý thuộc tính style={{...}}
        JSXAttribute(pathNode) {
            if (t.isJSXIdentifier(pathNode.node.name, { name: 'style' })) {
                const value = pathNode.node.value;
                if (t.isJSXExpressionContainer(value) && t.isObjectExpression(value.expression)) {
                    const objExpr = value.expression;
                    
                    if (isStaticStyleObject(objExpr)) {
                        const className = `${fileName}-style-${styleCounter++}`;
                        let cssRule = `.${className} {\n`;
                        
                        objExpr.properties.forEach(prop => {
                            const keyName = t.isIdentifier(prop.key) ? prop.key.name : prop.key.value;
                            const cssPropName = camelToKebab(keyName);
                            let cssValue = prop.value.value;
                            
                            if (typeof cssValue === 'number' && keyName !== 'opacity' && keyName !== 'fontWeight' && keyName !== 'zIndex' && keyName !== 'flex') {
                                cssValue = `${cssValue}px`; // Thêm px cho các giá trị số
                            }
                            
                            cssRule += `  ${cssPropName}: ${cssValue};\n`;
                        });
                        
                        cssRule += `}\n\n`;
                        cssContent += cssRule;
                        
                        // Cập nhật existing className
                        const parentOpeningElement = pathNode.parentPath.node;
                        const existingClassNameAttrIndex = parentOpeningElement.attributes.findIndex(
                            attr => t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name, { name: 'className' }) && attr !== pathNode.node
                        );
                        
                        if (existingClassNameAttrIndex !== -1) {
                            const existingClassNameAttr = parentOpeningElement.attributes[existingClassNameAttrIndex];
                            // Cập nhật className cũ
                            if (t.isStringLiteral(existingClassNameAttr.value)) {
                                existingClassNameAttr.value.value += ` ${className}`;
                                pathNode.remove();
                            } else if (t.isJSXExpressionContainer(existingClassNameAttr.value)) {
                                const expr = existingClassNameAttr.value.expression;
                                if (t.isTemplateLiteral(expr)) {
                                    expr.quasis[expr.quasis.length - 1].value.raw += ` ${className}`;
                                } else {
                                    existingClassNameAttr.value.expression = t.templateLiteral(
                                        [
                                            t.templateElement({ raw: '', cooked: '' }),
                                            t.templateElement({ raw: ` ${className}`, cooked: ` ${className}` }, true)
                                        ],
                                        [expr]
                                    );
                                }
                                pathNode.remove();
                            } else {
                                // Gỡ bỏ node style hiện tại, thêm classname mới
                                pathNode.replaceWith(
                                    t.jsxAttribute(
                                        t.jsxIdentifier('className'),
                                        t.stringLiteral(className)
                                    )
                                );
                            }
                        } else {
                            // Không có className, đổi trực tiếp style -> className
                            pathNode.replaceWith(
                                t.jsxAttribute(
                                    t.jsxIdentifier('className'),
                                    t.stringLiteral(className)
                                )
                            );
                        }
                        
                        hasChanges = true;
                    }
                }
            }
        },
        
        // Kiểm tra xem đã có import CSS chưa
        ImportDeclaration(pathNode) {
            const source = pathNode.node.source.value;
            if (source.endsWith('.css')) {
                if (source.includes(`${fileName}.css`)) {
                    hasStyleImport = true;
                }
            }
        }
    });

    if (hasChanges && cssContent.trim() !== '') {
        // 1. Lưu file CSS
        const outCssDir = path.join(STYLES_DIR, relPath);
        if (!fs.existsSync(outCssDir)) {
            fs.mkdirSync(outCssDir, { recursive: true });
        }
        
        const outCssPath = path.join(outCssDir, `${fileName}.css`);
        
        fs.writeFileSync(outCssPath, cssContent);
        console.log(`-> Tạo file CSS: ${outCssPath}`);
        
        // 2. Thêm import vào đầu file JSX nếu chưa có
        if (!hasStyleImport) {
            let relativeCssPath = path.relative(path.dirname(filePath), outCssPath).replace(/\\/g, '/');
            if (!relativeCssPath.startsWith('.')) {
                relativeCssPath = `./${relativeCssPath}`;
            }
            
            const importDecl = t.importDeclaration(
                [],
                t.stringLiteral(relativeCssPath)
            );
            
            ast.program.body.unshift(importDecl);
        }
        
        // 3. Generate code từ AST
        const output = generate(ast, { retainLines: false, retainFunctionParens: true, comments: true }, code);
        
        fs.writeFileSync(filePath, output.code);
        console.log(`-> Đã cập nhật file: ${filePath}`);
    }
};

const walkDir = (dir) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
};

const main = () => {
    for (const relDir of targetDirs) {
        const dirPath = path.join(SRC_DIR, relDir);
        walkDir(dirPath);
    }
    console.log("Hoàn tất trích xuất CSS.");
};

main();
