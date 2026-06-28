import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import { useData } from '../context/DataContext'; 
import '../styles/pages/PayrollManagement.css'; // Đường dẫn chuẩn theo yêu cầu

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
});

function PayrollManagement() {
    const { addNotification } = useNotification();
    const { teachers, tas } = useData() || {}; // Lấy dữ liệu GV, TA để đưa vào dropdown
    
    // States
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [payrolls, setPayrolls] = useState([]);
    
    const [staffSuggestions, setStaffSuggestions] = useState([]);

    // Khởi tạo Form chuẩn với các trường mới
    const initialForm = {
        id: null,
        staffName: '',
        role: 'teacher',
        courseName: '',
        sessionsCount: '',
        currency: 'VNĐ',
        baseSalary: '',
        adjustmentType: 'Không', // Không, Thưởng, Phạt, Phụ cấp thêm, Tăng lương
        adjustmentAmount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: '',
        status: 'Đã thanh toán'
    };

    const [formData, setFormData] = useState(initialForm);

    // 1. Tải dữ liệu hóa đơn và gom danh sách nhân sự cho Dropdown
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

        // Gom danh sách nhân sự làm Suggestions
        const combinedStaff = [];
        if (teachers) teachers.forEach(t => combinedStaff.push(t.name));
        if (tas) tas.forEach(t => combinedStaff.push(t.name));
        // Loại bỏ trùng lặp
        setStaffSuggestions([...new Set(combinedStaff)]);
    }, [teachers, tas]);

    // Tính toán TỔNG TIỀN tự động
    const calculateTotal = () => {
        const base = parseInt(formData.baseSalary) || 0;
        const adj = parseInt(formData.adjustmentAmount) || 0;
        if (formData.adjustmentType === 'Phạt') return base - adj;
        if (formData.adjustmentType !== 'Không') return base + adj;
        return base;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            // Reset tiền điều chỉnh nếu chọn "Không"
            if (name === 'adjustmentType' && value === 'Không') {
                updated.adjustmentAmount = '';
            }
            return updated;
        });
    };

    // Mở Form Thêm Mới
    const openAddModal = () => {
        setFormData(initialForm);
        setIsEditing(false);
        setShowModal(true);
    };

    // Mở Form Chỉnh Sửa
    const openEditModal = (record) => {
        setFormData({ ...record });
        setIsEditing(true);
        setShowModal(true);
    };

    // Lưu Dữ Liệu (Thêm/Sửa)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const finalTotal = calculateTotal();
            const payload = {
                ...formData,
                amount: finalTotal // Lưu tổng tiền vào database
            };

            if (isEditing) {
                // API Sửa
                const res = await api.put(`/payroll/${formData.id}`, payload);
                setPayrolls(payrolls.map(p => p.id === formData.id ? res.data : p));
                addNotification('Sửa Hóa Đơn', `Đã cập nhật hóa đơn lương của ${formData.staffName}`, 'warning', 'payroll');
            } else {
                // API Thêm mới
                const res = await api.post('/payroll', payload);
                setPayrolls([res.data, ...payrolls]);
                addNotification('Thanh toán lương', `Đã ghi nhận phiếu lương mới cho ${formData.staffName}`, 'success', 'payroll');
            }

            setShowModal(false);
        } catch (error) {
            addNotification('Lỗi', 'Không thể lưu hóa đơn lương lên hệ thống.', 'error');
        }
    };

    // Xóa Dữ Liệu
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

    // Bộ lọc
    const filteredPayrolls = payrolls.filter(p => {
        const matchTab = activeTab === 'all' || p.role === activeTab;
        const matchSearch = p.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.courseName?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchTab && matchSearch;
    });

    const totalPaid = payrolls.filter(p => p.status === 'Đã thanh toán').reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPending = payrolls.filter(p => p.status === 'Chờ thanh toán').reduce((sum, p) => sum + (p.amount || 0), 0);

    return (
        <div className="payroll-container">
            
            {/* KPI Cards */}
            <div className="payroll-kpi-grid">
                <div className="payroll-kpi-card">
                    <div className="payroll-kpi-info">
                        <span>Tổng chi trả lương (Hệ thống)</span>
                        <strong style={{ color: 'var(--success)' }}>{totalPaid.toLocaleString('vi-VN')} đ</strong>
                    </div>
                    <div className="payroll-kpi-icon" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
                        <i className="fa-solid fa-money-bill-wave"></i>
                    </div>
                </div>
                <div className="payroll-kpi-card">
                    <div className="payroll-kpi-info">
                        <span>Đang chờ thanh toán</span>
                        <strong style={{ color: '#d97706' }}>{totalPending.toLocaleString('vi-VN')} đ</strong>
                    </div>
                    <div className="payroll-kpi-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                        <i className="fa-solid fa-hourglass-half"></i>
                    </div>
                </div>
                <div className="payroll-kpi-card" style={{ cursor: 'pointer', backgroundColor: 'var(--primary)', color: 'white' }} onClick={openAddModal}>
                    <div className="payroll-kpi-info">
                        <span style={{ color: 'rgba(255,255,255,0.8)' }}>Thao tác nhanh</span>
                        <strong style={{ color: 'white' }}>Tạo hóa đơn lương</strong>
                    </div>
                    <div className="payroll-kpi-icon" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                        <i className="fa-solid fa-plus"></i>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                        <i className="fa-solid fa-file-invoice-dollar" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
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
                    <button className={`payroll-tab-btn ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => setActiveTab('sales')}>Chuyên viên Sale</button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="modal-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-app)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '16px' }}>MÃ / NGÀY TRẢ</th>
                                <th style={{ padding: '16px' }}>THÔNG TIN LÀM VIỆC</th>
                                <th style={{ padding: '16px' }}>CHI TIẾT LƯƠNG</th>
                                <th style={{ padding: '16px' }}>TỔNG THANH TOÁN</th>
                                <th style={{ padding: '16px' }}>TRẠNG THÁI</th>
                                <th style={{ padding: '16px', textAlign: 'center' }}>THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayrolls.length === 0 && (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Chưa có bản ghi thanh toán lương nào.</td></tr>
                            )}
                            {filteredPayrolls.map((p) => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'white' }}>
                                    <td style={{ padding: '16px' }}>
                                        <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.9rem' }}>#PR-{p.id.toString().slice(-4)}</strong>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(p.paymentDate).toLocaleDateString('vi-VN')}</span>
                                    </td>
                                    
                                    <td style={{ padding: '16px' }}>
                                        <strong style={{ display: 'block', color: 'var(--primary)', fontSize: '0.95rem', marginBottom: '4px' }}>{p.staffName}</strong>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Vị trí: {p.role === 'teacher' ? 'Giáo viên' : p.role === 'ta' ? 'Trợ giảng' : 'Sale'}</span>
                                        {p.courseName && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Khóa: {p.courseName} {p.sessionsCount && `(${p.sessionsCount} buổi)`}</span>}
                                    </td>

                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                            Cứng: <strong style={{color: '#475569'}}>{(parseInt(p.baseSalary) || 0).toLocaleString('vi-VN')} đ</strong>
                                        </div>
                                        {p.adjustmentType !== 'Không' && p.adjustmentAmount > 0 && (
                                            <div className={`adj-badge adj-${p.adjustmentType === 'Thưởng' ? 'thuong' : p.adjustmentType === 'Phạt' ? 'phat' : p.adjustmentType === 'Tăng lương' ? 'tang' : 'them'}`}>
                                                {p.adjustmentType}: {p.adjustmentType === 'Phạt' ? '-' : '+'}{(parseInt(p.adjustmentAmount) || 0).toLocaleString('vi-VN')} đ
                                            </div>
                                        )}
                                    </td>

                                    <td style={{ padding: '16px', fontWeight: '800', color: 'var(--primary)', fontSize: '1.1rem' }}>
                                        {(p.amount || 0).toLocaleString('vi-VN')} {p.currency || 'đ'}
                                    </td>
                                    
                                    <td style={{ padding: '16px' }}>
                                        <span className={`status-badge ${p.status === 'Đã thanh toán' ? 'status-paid' : 'status-pending'}`}>
                                            {p.status}
                                        </span>
                                    </td>

                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button className="payroll-action-btn btn-edit" onClick={() => openEditModal(p)} title="Sửa hóa đơn"><i className="fa-solid fa-pen"></i></button>
                                            <button className="payroll-action-btn btn-delete" onClick={() => handleDelete(p.id, p.staffName)} title="Xóa hóa đơn"><i className="fa-solid fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Ghi Hóa Đơn Lương */}
            {showModal && (
                <div className="payroll-modal-overlay">
                    <div className="payroll-modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, color: 'var(--primary)', fontWeight: '800' }}>
                                <i className="fa-solid fa-file-signature" style={{ marginRight: '8px' }}></i> 
                                {isEditing ? 'Chỉnh Sửa Hóa Đơn Lương' : 'Tạo Hóa Đơn Trả Lương'}
                            </h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--text-muted)', cursor: 'pointer' }}>✖</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Datalist hỗ trợ tìm kiếm nhân sự */}
                            <datalist id="staff-list">
                                {staffSuggestions.map((name, idx) => (
                                    <option key={idx} value={name} />
                                ))}
                            </datalist>

                            <div className="payroll-form-grid">
                                <div className="payroll-form-group">
                                    <label className="payroll-form-label">Bộ phận / Vị trí (*)</label>
                                    <select className="form-control" name="role" value={formData.role} onChange={handleInputChange}>
                                        <option value="teacher">Giáo viên</option>
                                        <option value="ta">Trợ giảng</option>
                                        <option value="sales">Chuyên viên Sale</option>
                                    </select>
                                </div>
                                <div className="payroll-form-group">
                                    <label className="payroll-form-label">Tên nhân sự (*)</label>
                                    <input type="text" list="staff-list" className="form-control" name="staffName" value={formData.staffName} onChange={handleInputChange} required placeholder="Nhập hoặc chọn tên..." autoComplete="off" />
                                </div>
                                
                                <div className="payroll-form-group">
                                    <label className="payroll-form-label">Khóa học (Nếu có)</label>
                                    <input type="text" className="form-control" name="courseName" value={formData.courseName || ''} onChange={handleInputChange} placeholder="VD: 20/5 HSK 1..." />
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
                                        <option value="VNĐ">VNĐ (Việt Nam Đồng)</option>
                                    </select>
                                </div>

                                {/* KHU VỰC THƯỞNG PHẠT */}
                                <div className="payroll-form-group">
                                    <label className="payroll-form-label">Phụ phí / Điều chỉnh</label>
                                    <select className="form-control" name="adjustmentType" value={formData.adjustmentType} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }}>
                                        <option value="Không">Không áp dụng</option>
                                        <option value="Thưởng">🟢 Thưởng</option>
                                        <option value="Phạt">🔴 Phạt</option>
                                        <option value="Phụ cấp thêm">🔵 Phụ cấp thêm</option>
                                        <option value="Tăng lương">🟣 Tăng lương</option>
                                    </select>
                                </div>
                                <div className="payroll-form-group">
                                    <label className="payroll-form-label">Số tiền điều chỉnh</label>
                                    <input type="number" className="form-control" name="adjustmentAmount" value={formData.adjustmentAmount || ''} onChange={handleInputChange} disabled={formData.adjustmentType === 'Không'} placeholder={formData.adjustmentType === 'Không' ? 'Vui lòng chọn loại điều chỉnh...' : 'Nhập số tiền...'} style={{ backgroundColor: formData.adjustmentType === 'Không' ? '#e2e8f0' : 'white' }} />
                                </div>

                                <div className="payroll-form-group full-width" style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', border: '1px dashed #cbd5e1' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>TỔNG THANH TOÁN:</span>
                                    <strong style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>
                                        {calculateTotal().toLocaleString('vi-VN')} {formData.currency}
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
                                        <option value="Chờ thanh toán">⏳ Lưu nháp chờ duyệt</option>
                                    </select>
                                </div>

                                <div className="payroll-form-group full-width">
                                    <label className="payroll-form-label">Ghi chú chi tiết</label>
                                    <textarea className="form-control" name="notes" rows="2" value={formData.notes} onChange={handleInputChange} placeholder="Mô tả lý do thưởng/phạt hoặc chi tiết lương..." style={{ resize: 'none' }}></textarea>
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
        </div>
    );
}

export default PayrollManagement;
