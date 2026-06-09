import React, { createContext, useState, useContext } from 'react';

// Khởi tạo Context
const AuthContext = createContext();

// Component Provider để bọc ngoài ứng dụng
export const AuthProvider = ({ children }) => {
    // Trạng thái vai trò hiện tại. Mặc định là 'teacher' để đảm bảo an toàn (ít quyền nhất)
    // Các giá trị hợp lệ: 'admin', 'manager', 'sales', 'teacher'
    const [currentRole, setCurrentRole] = useState('teacher');

    // Hàm thay đổi vai trò (Dùng cho tính năng Giả lập ở Topbar)
    const changeRole = (role) => {
        setCurrentRole(role);
        // Trong thực tế, bạn có thể thêm logic lưu vào localStorage hoặc gọi API ở đây
    };

    return (
        <AuthContext.Provider value={{ currentRole, changeRole }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom Hook để các Component khác dễ dàng lấy dữ liệu phân quyền
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
    }
    return context;
};