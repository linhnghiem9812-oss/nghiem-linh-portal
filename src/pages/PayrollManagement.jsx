import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import '../styles/pages/PayrollManagement.css'; // Import file CSS đã bóc tách

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
});

function PayrollManagement() {
    const { addNotification } = useNotification();

    // States
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [payrolls, setPayrolls] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        staffName: '',
        role: 'teacher',
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: '',
        status: 'Đã thanh toán'
    });

    // Dữ liệu giả lập (Mock Data) để hiển thị trong khi chờ thiết kế Backend
    useEffect(() => {
        const mockData = [
            { id: 1, staffName: 'Mai Hồng Nhung', role: 'teacher', amount: 4500000, paymentDate: '2026-06-25', status: 'Đã thanh toán', notes: 'Lương tháng 5 - Lớp HSK1' },
            { id: 2, staffName: 'Ngoại Ngữ Nghiêm Linh', role: 'sales', amount: 1200000, paymentDate: '2026-06-26', status: 'Chờ thanh toán', notes: 'Hoa hồng 3 học viên mới' },
            { id: 3, staffName: 'Trần Thị Thu', role: 'ta', amount: 800000, paymentDate: '2026-06-25', status: 'Đã thanh toán', notes: 'Trợ giảng 10 buổi' },
        ];
        setPayrolls(mockData);

        // Đoạn code thật khi có Backend:
        // api.get('/payroll').then(res => setPayrolls(res.data)).catch(err => console.log(err));
    }, []);

    // Handlers
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newRecord = {
            ...formData,
            id: Date.now(), // Fake ID
            amount: parseInt(formData.amount)
        };

        // Giả lập lưu thành công
        setPayrolls([newRecord, ...payrolls]);

        addNotification('Thanh toán lương', `Đã ghi nhận phiếu lương cho ${formData.staffName}`, 'success', 'finance', {
            'Người nhận': formData.staffName,
            'Số tiền': `${Number(formData.amount).toLocaleString('vi-VN')} VNĐ`,
            'Ngày trả': formData.paymentDate,
            'Trạng thái': formData.status
        });

        setShowModal(false);
        setFormData({ staffName: '', role: 'teacher', amount: '', paymentDate: new Date().toISOString().split('T')[0], notes: '', status: 'Đã thanh toán' });
    };

    // Filters
    const filteredPayrolls = payrolls.filter(p => {
        const matchTab = activeTab === 'all' || p.role === activeTab;
        const matchSearch = p.staffName.toLowerCase().includes(searchTerm.toLowerCase()) || p.notes.toLowerCase().includes(searchTerm.toLowerCase());
        return matchTab && matchSearch;
    });

    const totalPaid = payrolls.filter(p => p.status === 'Đã thanh toán').reduce((sum, p) => sum + p.amount, 0);
    const totalPending = payrolls.filter(p => p.status === 'Chờ thanh toán').reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="payroll-container">

            {/* KPI Cards */}
            <div className="payroll-kpi-grid">
                <div className="payroll-kpi-card">
                    <div className="payroll-kpi-info">
                        <span>Tổng chi trả lương (Tháng này)</span>
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
                <div className="payroll-kpi-card" style={{ cursor: 'pointer', backgroundColor: 'var(--primary)', color: 'white' }} onClick={() => setShowModal(true)}>
                    <div className="payroll-kpi-info">
                        <span style={{ color: 'rgba(255,255,255,0.8)' }}>Thao tác nhanh</span>
                        <strong style={{ color: 'white' }}>Tạo phiếu chi lương</strong>
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
                        Danh sách Hóa đơn Thanh toán Lương
                    </h3>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="🔍 Tìm kiếm tên nhân sự, ghi chú..."
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
                                <th style={{ padding: '16px' }}>MÃ PHIẾU</th>
                                <th style={{ padding: '16px' }}>NGÀY TRẢ</th>
                                <th style={{ padding: '16px' }}>NHÂN SỰ</th>
                                <th style={{ padding: '16px' }}>VỊ TRÍ</th>
                                <th style={{ padding: '16px' }}>SỐ TIỀN (VNĐ)</th>
                                <th style={{ padding: '16px' }}>GHI CHÚ (HÓA ĐƠN)</th>
                                <th style={{ padding: '16px' }}>TRẠNG THÁI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayrolls.length === 0 && (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Chưa có bản ghi thanh toán lương nào.</td></tr>
                            )}
                            {filteredPayrolls.map((p) => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '16px', fontWeight: '700', color: 'var(--text-muted)' }}>#PR-{p.id.toString().slice(-4)}</td>
                                    <td style={{ padding: '16px', color: 'var(--text-main)', fontWeight: '500' }}>
                                        {new Date(p.paymentDate).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td style={{ padding: '16px', fontWeight: '700', color: 'var(--primary)' }}>{p.staffName}</td>
                                    <td style={{ padding: '16px' }}>
                                        {p.role === 'teacher' ? 'Giáo viên' : p.role === 'ta' ? 'Trợ giảng' : 'Sale'}
                                    </td>
                                    <td style={{ padding: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
                                        {p.amount.toLocaleString('vi-VN')} đ
                                    </td>
                                    <td style={{ padding: '16px', color: 'var(--text-muted)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.notes}>
                                        {p.notes || '---'}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span className={`status-badge ${p.status === 'Đã thanh toán' ? 'status-paid' : 'status-pending'}`}>
                                            {p.status}
                                        </span>
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
                                <i className="fa-solid fa-file-signature" style={{ marginRight: '8px' }}></i> Tạo Hóa Đơn Trả Lương
                            </h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--text-muted)', cursor: 'pointer' }}>✖</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="payroll-form-grid">
                                <div className="payroll-form-group">
                                    <label className="payroll-form-label">Bộ phận / Vị trí</label>
                                    <select className="form-control" name="role" value={formData.role} onChange={handleInputChange}>
                                        <option value="teacher">Giáo viên</option>
                                        <option value="ta">Trợ giảng</option>
                                        <option value="sales">Chuyên viên Sale</option>
                                    </select>
                                </div>
                                <div className="payroll-form-group">
                                    <label className="payroll-form-label">Tên nhân sự (*)</label>
                                    <input type="text" className="form-control" name="staffName" value={formData.staffName} onChange={handleInputChange} required placeholder="Nhập tên người nhận..." />
                                </div>

                                <div className="payroll-form-group">
                                    <label className="payroll-form-label" style={{ color: 'var(--primary)' }}>Số tiền thanh toán (VNĐ) (*)</label>
                                    <input type="number" className="form-control" name="amount" value={formData.amount} onChange={handleInputChange} required placeholder="VD: 5000000" style={{ border: '1px solid var(--primary)' }} />
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
                                    <label className="payroll-form-label">Ghi chú (Nội dung hóa đơn)</label>
                                    <textarea className="form-control" name="notes" rows="2" value={formData.notes} onChange={handleInputChange} placeholder="VD: Lương tháng 5 lớp HSK1 + Thưởng..." style={{ resize: 'none' }}></textarea>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#e2e8f0', color: 'var(--text-main)', fontWeight: '700' }}>Hủy bỏ</button>
                                <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: 'white', fontWeight: '800' }}>
                                    <i className="fa-solid fa-floppy-disk" style={{ marginRight: '6px' }}></i> LƯU HÓA ĐƠN
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