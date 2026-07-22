import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import { useData } from '../context/DataContext';
import '../styles/pages/PayrollManagement.css';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
});

function PayrollManagement() {
    const { addNotification } = useNotification();
    const { teachers, tas, classes, customers } = useData() || {};

    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [payrolls, setPayrolls] = useState([]);
    // THÊM DÒNG NÀY ĐỂ KÍCH HOẠT MENU CHI TIẾT TRÊN DI ĐỘNG:
    const [viewingPayroll, setViewingPayroll] = useState(null);

    // STATE LỌC TRẠNG THÁI (Đồng bộ với Học viên)
    const [statusFilter, setStatusFilter] = useState('all');

    // LOGIC PHÂN TRANG (PAGINATION)
    const [currentPage, setCurrentPage] = useState(1);
    const [inputPage, setInputPage] = useState("1");
    const rowsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
        setInputPage("1");
    }, [searchTerm, activeTab, statusFilter, payrolls.length]);
    
    const [staffSuggestions, setStaffSuggestions] = useState([]);
    const [isLoadingStaff, setIsLoadingStaff] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [calculatedTotal, setCalculatedTotal] = useState(0);

    const initialForm = {
        id: null,
        staffName: '',
        role: 'teacher',
        courseName: '',
        sessionsCount: '',
        currency: 'VNĐ',
        baseSalary: '',
        adjustments: [
            { type: 'Không', amount: '' }
        ],
        paymentDate: new Date().toISOString().split('T')[0],
        notes: '',
        status: 'Đã thanh toán'
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        const fetchPayrolls = async () => {
            try {
                const res = await api.get('/payroll');
                setPayrolls(res.data || []);
            } catch (err) {
                console.error("Lỗi tải dữ liệu lương: ", err);
            }
        };
        fetchPayrolls();
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!formData.role) return;
            setIsLoadingStaff(true);
            try {
                const res = await api.get(`/users/suggestions?role=${formData.role}`);
                setStaffSuggestions(res.data || []);
            } catch (err) {
                console.error("Lỗi lấy danh sách nhân sự", err);
            } finally {
                setIsLoadingStaff(false);
            }
        };
        fetchSuggestions();
    }, [formData.role]);

    const filteredClassSuggestions = useMemo(() => {
        if (!formData.staffName || !classes) return [];
        const nameLower = formData.staffName.toLowerCase().trim();

        return classes.filter(c => {
            if (formData.role === 'teacher') return c.teacher && c.teacher.toLowerCase().includes(nameLower);
            if (formData.role === 'ta') return c.ta && c.ta.toLowerCase().includes(nameLower);
            return false;
        }).map(c => c.classCode);
    }, [formData.staffName, formData.role, classes]);

    useEffect(() => {
        const calcTotal = async () => {
            setIsCalculating(true);
            try {
                const payload = {
                    baseSalary: parseInt(formData.baseSalary) || 0,
                    adjustments: formData.adjustments.map(adj => ({
                        type: adj.type,
                        amount: parseInt(adj.amount) || 0
                    }))
                };
                const res = await api.post('/payroll/calculate', payload);
                setCalculatedTotal(res.data.finalAmount || 0);
            } catch (error) {
                console.error("Lỗi tính lương: ", error);
                setCalculatedTotal(0);
            } finally {
                setIsCalculating(false);
            }
        };
        calcTotal();
    }, [formData.baseSalary, formData.adjustments]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'role') {
                updated.staffName = '';
                updated.courseName = '';
            }
            return updated;
        });
    };

    const handleAdjChange = (index, field, value) => {
        const updatedAdjustments = [...formData.adjustments];
        updatedAdjustments[index][field] = value;
        if (field === 'type' && value === 'Không') {
            updatedAdjustments[index].amount = '';
        }
        setFormData({ ...formData, adjustments: updatedAdjustments });
    };

    const addAdjRow = () => {
        setFormData({
            ...formData,
            adjustments: [...formData.adjustments, { type: 'Không', amount: '' }]
        });
    };

    const removeAdjRow = (index) => {
        const updatedAdjustments = formData.adjustments.filter((_, i) => i !== index);
        setFormData({ ...formData, adjustments: updatedAdjustments });
    };

    const getControlClassName = (type) => {
        if (type === 'Thưởng') return 'control-thuong';
        if (type === 'Phạt') return 'control-phat';
        if (type === 'Phụ cấp thêm') return 'control-them';
        if (type === 'Tăng lương') return 'control-tang';
        return '';
    };

    const openAddModal = () => {
        setFormData(initialForm);
        setIsEditing(false);
        setShowModal(true);
    };

    const openEditModal = (record) => {
        const adjustments = (record.adjustments && record.adjustments.length > 0)
            ? record.adjustments
            : [{ type: 'Không', amount: '' }];

        setFormData({
            ...record,
            courseName: record.courseName || '',
            sessionsCount: record.sessionsCount || '',
            currency: record.currency || 'VNĐ',
            baseSalary: record.baseSalary || '',
            notes: record.notes || '',
            adjustments: adjustments
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const finalTotal = calculatedTotal;

            // Gửi dữ liệu sạch lên API, không dùng JSON.stringify
            const payload = {
                id: formData.id,
                staffName: formData.staffName.trim(),
                role: formData.role,
                courseName: formData.courseName,
                sessionsCount: parseInt(formData.sessionsCount) || null,
                baseSalary: parseInt(formData.baseSalary) || 0,
                currency: formData.currency,
                amount: finalTotal,
                paymentDate: formData.paymentDate,
                status: formData.status,
                notes: formData.notes,
                adjustments: formData.adjustments.map(adj => ({
                    type: adj.type,
                    amount: parseInt(adj.amount) || 0
                }))
            };

            if (isEditing) {
                const res = await api.put(`/payroll/${formData.id}`, payload);
                setPayrolls(payrolls.map(p => p.id === formData.id ? res.data : p));
                addNotification('Sửa Hóa Đơn', `Đã cập nhật hóa đơn lương của ${formData.staffName}`, 'warning', 'payroll');
            } else {
                const res = await api.post('/payroll', payload);
                setPayrolls([res.data, ...payrolls]);
                addNotification('Thanh toán lương', `Đã ghi nhận phiếu lương mới cho ${formData.staffName}`, 'success', 'payroll');
            }
            setShowModal(false);
        } catch (error) {
            console.error(error);
            addNotification('Lỗi', 'Không thể lưu hóa đơn lương.', 'error');
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn hóa đơn trả lương của ${name} không?`)) {
            try {
                await api.delete(`/payroll/${id}`);
                setPayrolls(payrolls.filter(p => p.id !== id));
                addNotification('Xóa Hóa Đơn', `Đã xóa hóa đơn lương của ${name}`, 'error', 'payroll');
            } catch (error) {
                addNotification('Lỗi', 'Xóa hóa đơn thất bại.', 'error');
            }
        }
    };

    // SỬA LỖI TAB SALE: Bắt cả trường hợp role là 'sale' hoặc 'sales'
    const filteredPayrolls = payrolls.filter(p => {
        const pRole = p.role ? p.role.toLowerCase() : '';
        const matchTab = activeTab === 'all' || pRole === activeTab || (activeTab === 'sales' && pRole === 'sale');
        
        const matchSearch = p.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.notes?.toLowerCase().includes(searchTerm.toLowerCase());
            
        // Áp dụng thêm bộ lọc trạng thái (Thẻ KPI)
        const matchStatus = statusFilter === 'all' || p.status === statusFilter;
        
        return matchTab && matchSearch && matchStatus;
    });

    // Tính toán dữ liệu hiển thị cho trang hiện tại
    const totalPages = Math.ceil(filteredPayrolls.length / rowsPerPage) || 1;
    const indexOfLastPayroll = currentPage * rowsPerPage;
    const indexOfFirstPayroll = indexOfLastPayroll - rowsPerPage;
    const currentPayrolls = filteredPayrolls.slice(indexOfFirstPayroll, indexOfLastPayroll);

    // Các hàm điều hướng trang
    const goToFirstPage = () => { setCurrentPage(1); setInputPage("1"); };
    const goToLastPage = () => { setCurrentPage(totalPages); setInputPage(totalPages.toString()); };
    const goToPrevPage = () => { if (currentPage > 1) { setCurrentPage(currentPage - 1); setInputPage((currentPage - 1).toString()); } };
    const goToNextPage = () => { if (currentPage < totalPages) { setCurrentPage(currentPage + 1); setInputPage((currentPage + 1).toString()); } };

    const handlePageInput = (e) => setInputPage(e.target.value);
    const handlePageSubmit = (e) => {
        if (e.key === 'Enter' || e.type === 'blur') {
            let page = parseInt(inputPage, 10);
            if (isNaN(page) || page < 1) page = 1;
            if (page > totalPages) page = totalPages;
            setCurrentPage(page);
            setInputPage(page.toString());
        }
    };

    // Tính toán tiền cho Thẻ KPI
    const totalAll = payrolls.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPaid = payrolls.filter(p => p.status === 'Đã thanh toán').reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPending = payrolls.filter(p => p.status === 'Chờ duyệt').reduce((sum, p) => sum + (p.amount || 0), 0);

    return (
        <div className="payroll-container">
            <div className="payroll-kpi-grid">
                {/* THẺ 1: TOÀN BỘ */}
                <div className="payroll-kpi-card" onClick={() => setStatusFilter('all')} style={{ cursor: 'pointer', border: statusFilter === 'all' ? '2px solid var(--primary)' : '1px solid transparent' }}>
                    <div className="payroll-kpi-info">
                        <span>Tổng chi (Toàn bộ)</span>
                        <strong style={{ color: 'var(--primary)' }}>{totalAll.toLocaleString('vi-VN')} đ</strong>
                    </div>
                    <div className="payroll-kpi-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                        <i className="fa-solid fa-file-invoice-dollar"></i>
                    </div>
                </div>
                {/* THẺ 2: ĐÃ THANH TOÁN */}
                <div className="payroll-kpi-card" onClick={() => setStatusFilter('Đã thanh toán')} style={{ cursor: 'pointer', border: statusFilter === 'Đã thanh toán' ? '2px solid var(--success)' : '1px solid transparent' }}>
                    <div className="payroll-kpi-info">
                        <span>Đã thanh toán</span>
                        <strong style={{ color: 'var(--success)' }}>{totalPaid.toLocaleString('vi-VN')} đ</strong>
                    </div>
                    <div className="payroll-kpi-icon" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
                        <i className="fa-solid fa-check-circle"></i>
                    </div>
                </div>
                {/* THẺ 3: CHỜ DUYỆT */}
                <div className="payroll-kpi-card" onClick={() => setStatusFilter('Chờ duyệt')} style={{ cursor: 'pointer', border: statusFilter === 'Chờ duyệt' ? '2px solid #d97706' : '1px solid transparent' }}>
                    <div className="payroll-kpi-info">
                        <span>Đang chờ duyệt</span>
                        <strong style={{ color: '#d97706' }}>{totalPending.toLocaleString('vi-VN')} đ</strong>
                    </div>
                    <div className="payroll-kpi-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                        <i className="fa-solid fa-hourglass-half"></i>
                    </div>
                </div>
                {/* THẺ 4: TẠO MỚI */}
                <div className="payroll-kpi-card" style={{ cursor: 'pointer', backgroundColor: 'var(--primary)', color: 'white' }} onClick={openAddModal}>
                    <div className="payroll-kpi-info">
                        <span style={{ color: 'rgba(255,255,255,0.8)' }}>Quản lý chi phí</span>
                        <strong style={{ color: 'white' }}>Tạo hóa đơn mới</strong>
                    </div>
                    <div className="payroll-kpi-icon" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                        <i className="fa-solid fa-plus"></i>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
                    {/* TIÊU ĐỀ THU NHỎ & ĐỔI MÀU XANH PRIMARY */}
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>
                        <i className="fa-solid fa-file-invoice-dollar" style={{ marginRight: '8px' }}></i>
                        Danh sách Hóa đơn Thanh toán
                    </h3>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="🔍 Tìm nhân sự, khóa học..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '280px' }}
                    />
                </div>

                <div className="payroll-tabs">
                    <button className={`payroll-tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>Tất cả</button>
                    <button className={`payroll-tab-btn ${activeTab === 'teacher' ? 'active' : ''}`} onClick={() => setActiveTab('teacher')}>Giáo viên</button>
                    <button className={`payroll-tab-btn ${activeTab === 'ta' ? 'active' : ''}`} onClick={() => setActiveTab('ta')}>Trợ giảng</button>
                    {/* ĐỔI TÊN TAB THÀNH "SALE" */}
                    <button className={`payroll-tab-btn ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => setActiveTab('sales')}>Sale</button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="modal-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-app)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                <th className="col-code" style={{ padding: '16px' }}>MÃ / NGÀY</th>
                                <th className="col-info" style={{ padding: '16px' }}>THÔNG TIN LÀM VIỆC</th>
                                <th className="col-optional" style={{ padding: '16px' }}>CHI TIẾT LƯƠNG</th>
                                <th className="col-amount" style={{ padding: '16px' }}>SỐ TIỀN</th>
                                <th className="col-optional" style={{ padding: '16px' }}>TRẠNG THÁI</th>
                                <th className="col-optional" style={{ padding: '16px', textAlign: 'center' }}>THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentPayrolls.length === 0 && (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Chưa có bản ghi thanh toán lương nào.</td></tr>
                            )}
                            {currentPayrolls.map((p) => (
                                <tr 
                                    key={p.id} 
                                    className="payroll-row-clickable"
                                    onClick={() => setViewingPayroll(p)} 
                                    style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'white' }}
                                >
                                    <td className="col-code" style={{ padding: '16px' }}>
                                        <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.85rem' }}>#PR-{p.id.toString().slice(-4)}</strong>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(p.paymentDate).toLocaleDateString('vi-VN')}</span>
                                    </td>

                                    <td className="col-info" style={{ padding: '16px' }}>
                                        <strong style={{ display: 'block', color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '2px' }}>{p.staffName}</strong>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Vị trí: {p.role === 'teacher' ? 'Giáo viên' : p.role === 'ta' ? 'Trợ giảng' : 'Sale'}</span>
                                        {p.courseName && <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Khóa: {p.courseName}</span>}
                                    </td>

                                    <td className="col-optional" style={{ padding: '16px' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                            Cứng: <strong style={{ color: '#475569' }}>{(parseInt(p.baseSalary) || 0).toLocaleString('vi-VN')} đ</strong>
                                        </div>
                                        <div className="adj-badge-list">
                                            {p.adjustments && p.adjustments.map((adj, i) => (
                                                adj.type !== 'Không' && (
                                                    <div key={i} className={`adj-badge adj-${adj.type === 'Thưởng' ? 'thuong' : adj.type === 'Phạt' ? 'phat' : adj.type === 'Tăng lương' ? 'tang' : 'them'}`}>
                                                        {adj.type}: {adj.type === 'Phạt' ? '-' : '+'}{(parseInt(adj.amount) || 0).toLocaleString('vi-VN')} đ
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </td>

                                    <td className="col-amount" style={{ padding: '16px', fontWeight: '800', color: 'var(--success)', fontSize: '1rem' }}>
                                        {(p.amount || 0).toLocaleString('vi-VN')} <span style={{fontSize: '0.75rem'}}>{p.currency || 'đ'}</span>
                                    </td>

                                    <td className="col-optional" style={{ padding: '16px' }}>
                                        <span className={`status-badge ${p.status === 'Đã thanh toán' ? 'status-paid' : 'status-pending'}`}>
                                            {p.status}
                                        </span>
                                    </td>

                                    <td className="col-optional" style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button className="payroll-action-btn btn-edit" onClick={(e) => { e.stopPropagation(); openEditModal(p); }} title="Sửa"><i className="fa-solid fa-pen"></i></button>
                                            <button className="payroll-action-btn btn-delete" onClick={(e) => { e.stopPropagation(); handleDelete(p.id, p.staffName); }} title="Xóa"><i className="fa-solid fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* THANH ĐIỀU HƯỚNG PHÂN TRANG */}
                {filteredPayrolls.length > rowsPerPage && (
                    <div className="Payroll-pagination">
                        <button onClick={goToFirstPage} disabled={currentPage === 1} title="Trang đầu">
                            <i className="fa-solid fa-angles-left"></i>
                        </button>
                        <button onClick={goToPrevPage} disabled={currentPage === 1} title="Trang trước">
                            <i className="fa-solid fa-angle-left"></i>
                        </button>
                        
                        <div className="Payroll-pagination-info">
                            Trang 
                            <input 
                                type="number" 
                                className="Payroll-pagination-input"
                                value={inputPage} 
                                onChange={handlePageInput} 
                                onBlur={handlePageSubmit} 
                                onKeyDown={handlePageSubmit} 
                                min="1"
                                max={totalPages}
                            /> 
                            / {totalPages}
                        </div>

                        <button onClick={goToNextPage} disabled={currentPage === totalPages} title="Trang sau">
                            <i className="fa-solid fa-angle-right"></i>
                        </button>
                        <button onClick={goToLastPage} disabled={currentPage === totalPages} title="Trang cuối">
                            <i className="fa-solid fa-angles-right"></i>
                        </button>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="payroll-modal-overlay">
                    <div className="payroll-modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, color: 'var(--primary)', fontWeight: '800' }}>
                                <i className="fa-solid fa-file-signature" style={{ marginRight: '8px' }}></i>
                                {isEditing ? 'Chỉnh sửa hóa đơn trả lương' : 'Tạo hóa đơn trả lương'}
                            </h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--text-muted)', cursor: 'pointer' }}>✖</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <datalist id="filtered-staff-list">
                                {staffSuggestions.map((name, idx) => (
                                    <option key={idx} value={name} />
                                ))}
                            </datalist>

                            <datalist id="filtered-class-list">
                                {filteredClassSuggestions.map((code, idx) => (
                                    <option key={idx} value={code} />
                                ))}
                            </datalist>

                            <div className="payroll-form-grid">
                                <div className="payroll-form-group">
                                    <label className="payroll-form-label">Bộ phận / Vị trí (*)</label>
                                    <select className="form-control" name="role" value={formData.role} onChange={handleInputChange}>
                                        <option value="teacher">Giáo viên</option>
                                        <option value="ta">Trợ giảng</option>
                                        <option value="sales">Chuyên viên Sale</option>
                                        <option value="other">Khác</option>
                                    </select>
                                </div>
                                <div className="payroll-form-group">
                                    <label className="payroll-form-label">Tên nhân sự (*) {isLoadingStaff && <i className="fa-solid fa-spinner fa-spin" style={{marginLeft: '8px'}}></i>}</label>
                                    <input type="text" list="filtered-staff-list" className="form-control" name="staffName" value={formData.staffName} onChange={handleInputChange} required placeholder="Nhập hoặc chọn tên..." autoComplete="off" disabled={isLoadingStaff} />
                                </div>

                                <div className="payroll-form-group">
                                    <label className="payroll-form-label">Khóa học (Nếu có)</label>
                                    <input type="text" list="filtered-class-list" className="form-control" name="courseName" value={formData.courseName || ''} onChange={handleInputChange} placeholder="Nhập hoặc chọn lớp..." autoComplete="off" />
                                </div>
                                <div className="payroll-form-group">
                                    <label className="payroll-form-label">Tổng số buổi</label>
                                    <input type="number" className="form-control" name="sessionsCount" value={formData.sessionsCount || ''} onChange={handleInputChange} placeholder="Nhập số buổi..." />
                                </div>

                                <div className="payroll-form-group">
                                    <label className="payroll-form-label" style={{ color: 'var(--primary)' }}>Lương cứng cơ bản (*)</label>
                                    <input type="number" className="form-control" name="baseSalary" value={formData.baseSalary} onChange={handleInputChange} required placeholder="VD: 5000000" style={{ border: '1px solid var(--primary)' }} />
                                </div>
                                <div className="payroll-form-group">
                                    <label className="payroll-form-label">Đơn vị tiền tệ</label>
                                    <select className="form-control" name="currency" value={formData.currency} onChange={handleInputChange}>
                                        <option value="VNĐ">VNĐ</option>
                                    </select>
                                </div>

                                <div className="payroll-adj-section">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)' }}>Khu vực Phụ phí / Điều chỉnh</span>
                                        <button type="button" className="btn" onClick={addAdjRow} style={{ padding: '4px 12px', fontSize: '0.75rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}>
                                            <i className="fa-solid fa-plus"></i> Thêm dòng điều chỉnh
                                        </button>
                                    </div>

                                    {formData.adjustments.map((adj, index) => (
                                        <div className="payroll-adj-row" key={index}>
                                            <div className="payroll-form-group" style={{ marginBottom: 0 }}>
                                                <label className="payroll-form-label">Loại điều chỉnh</label>
                                                <select
                                                    className={`form-control ${getControlClassName(adj.type)}`}
                                                    value={adj.type}
                                                    onChange={(e) => handleAdjChange(index, 'type', e.target.value)}
                                                >
                                                    <option value="Không">Không áp dụng</option>
                                                    <option value="Thưởng">Thưởng</option>
                                                    <option value="Phạt">Phạt</option>
                                                    <option value="Phụ cấp thêm">Phụ cấp thêm</option>
                                                    <option value="Tăng lương">Tăng lương</option>
                                                </select>
                                            </div>
                                            <div className="payroll-form-group" style={{ marginBottom: 0 }}>
                                                <label className="payroll-form-label">Số tiền điều chỉnh</label>
                                                <input
                                                    type="number"
                                                    className={`form-control ${getControlClassName(adj.type)}`}
                                                    value={adj.amount}
                                                    onChange={(e) => handleAdjChange(index, 'amount', e.target.value)}
                                                    disabled={adj.type === 'Không'}
                                                    placeholder={adj.type === 'Không' ? 'Trống...' : 'Nhập số tiền...'}
                                                />
                                            </div>
                                            {formData.adjustments.length > 1 && (
                                                <button type="button" onClick={() => removeAdjRow(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', paddingBottom: '10px', fontSize: '1.1rem' }} title="Xóa dòng này">
                                                    <i className="fa-solid fa-trash-can"></i>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="payroll-form-group full-width" style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', border: '1px dashed #cbd5e1' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>TỔNG THANH TOÁN:</span>
                                    <strong style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>
                                        {isCalculating ? <i className="fa-solid fa-spinner fa-spin"></i> : `${calculatedTotal.toLocaleString('vi-VN')} ${formData.currency}`}
                                    </strong>
                                </div>

                                <div className="payroll-form-group">
                                    <label className="payroll-form-label">Ngày chi trả</label>
                                    <input type="date" className="form-control" name="paymentDate" value={formData.paymentDate} onChange={handleInputChange} required />
                                </div>

                                <div className="payroll-form-group">
                                    <label className="payroll-form-label">Trạng thái</label>
                                    <select className="form-control" name="status" value={formData.status} onChange={handleInputChange}>
                                        <option value="Đã thanh toán">✅ Đã chuyển khoản / Tiền mặt</option>
                                        <option value="Chờ duyệt">⏳ Chờ duyệt</option>
                                    </select>
                                </div>

                                <div className="payroll-form-group full-width">
                                    <label className="payroll-form-label">Ghi chú chi tiết</label>
                                    <textarea className="form-control" name="notes" rows="2" value={formData.notes} onChange={handleInputChange} placeholder="Mô tả lý do..." style={{ resize: 'none' }}></textarea>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#e2e8f0', color: 'var(--text-main)', fontWeight: '700' }}>Hủy bỏ</button>
                                <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: 'white', fontWeight: '800' }}>
                                    <i className="fa-solid fa-floppy-disk" style={{ marginRight: '6px' }}></i> {isEditing ? 'LƯU THAY ĐỔI' : 'LƯU HÓA ĐƠN'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================
                MODAL XEM CHI TIẾT LƯƠNG (Hiện ra khi bấm vào dòng)
            ======================================================== */}
            {viewingPayroll && (
                <div className="payroll-modal-overlay" onClick={() => setViewingPayroll(null)}>
                    <div className="payroll-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, color: 'var(--primary)', fontWeight: '800', fontSize: '1.1rem' }}>
                                <i className="fa-solid fa-receipt" style={{ marginRight: '8px' }}></i>
                                Phiếu lương #PR-{viewingPayroll.id.toString().slice(-4)}
                            </h3>
                            <button onClick={() => setViewingPayroll(null)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: 'var(--text-muted)', cursor: 'pointer' }}>✖</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px' }}>
                                <span style={{ color: '#64748b', fontWeight: '700' }}>Tên nhân sự:</span>
                                <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{viewingPayroll.staffName}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px' }}>
                                <span style={{ color: '#64748b', fontWeight: '700' }}>Vị trí làm việc:</span>
                                <strong>{viewingPayroll.role === 'teacher' ? 'Giáo viên' : viewingPayroll.role === 'ta' ? 'Trợ giảng' : 'Chuyên viên Sale'}</strong>
                            </div>
                            {viewingPayroll.courseName && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px' }}>
                                    <span style={{ color: '#64748b', fontWeight: '700' }}>Khóa phụ trách:</span>
                                    <strong>{viewingPayroll.courseName} {viewingPayroll.sessionsCount && `(${viewingPayroll.sessionsCount} buổi)`}</strong>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px' }}>
                                <span style={{ color: '#64748b', fontWeight: '700' }}>Lương cứng cơ bản:</span>
                                <strong>{(parseInt(viewingPayroll.baseSalary) || 0).toLocaleString('vi-VN')} đ</strong>
                            </div>

                            {/* Danh sách các khoản thưởng / phạt */}
                            {viewingPayroll.adjustments && viewingPayroll.adjustments.some(a => a.type !== 'Không') && (
                                <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Khoản điều chỉnh:</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {viewingPayroll.adjustments.map((adj, i) => adj.type !== 'Không' && (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                <span>{adj.type}:</span>
                                                <strong style={{ color: adj.type === 'Phạt' ? '#ef4444' : '#10b981' }}>
                                                    {adj.type === 'Phạt' ? '-' : '+'}{(parseInt(adj.amount) || 0).toLocaleString('vi-VN')} đ
                                                </strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px' }}>
                                <span style={{ fontWeight: '700', color: '#334155' }}>TỔNG THANH TOÁN:</span>
                                <strong style={{ fontSize: '1.25rem', color: 'var(--success)' }}>
                                    {(viewingPayroll.amount || 0).toLocaleString('vi-VN')} {viewingPayroll.currency || 'đ'}
                                </strong>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px', marginTop: '4px' }}>
                                <span style={{ color: '#64748b', fontWeight: '700' }}>Trạng thái:</span>
                                <span className={`status-badge ${viewingPayroll.status === 'Đã thanh toán' ? 'status-paid' : 'status-pending'}`}>{viewingPayroll.status}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px' }}>
                                <span style={{ color: '#64748b', fontWeight: '700' }}>Ngày chi trả:</span>
                                <span>{new Date(viewingPayroll.paymentDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                            {viewingPayroll.notes && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ color: '#64748b', fontWeight: '700' }}>Ghi chú thêm:</span>
                                    <p style={{ margin: 0, padding: '10px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{viewingPayroll.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Nút Thao tác trong Modal */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                            <button 
                                style={{ flex: 1, padding: '12px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                                onClick={() => { handleDelete(viewingPayroll.id, viewingPayroll.staffName); setViewingPayroll(null); }}
                            >
                                <i className="fa-solid fa-trash"></i> Xóa phiếu
                            </button>
                            <button 
                                style={{ flex: 1, padding: '12px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                                onClick={() => { openEditModal(viewingPayroll); setViewingPayroll(null); }}
                            >
                                <i className="fa-solid fa-pen"></i> Chỉnh sửa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PayrollManagement;
