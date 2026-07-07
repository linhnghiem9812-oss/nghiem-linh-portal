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

    const filteredStaffSuggestions = useMemo(() => {
        if (formData.role === 'teacher') {
            return teachers ? [...new Set(teachers.map(t => t.name?.trim()).filter(Boolean))] : [];
        }
        if (formData.role === 'ta') {
            return tas ? [...new Set(tas.map(t => t.name?.trim()).filter(Boolean))] : [];
        }
        if (formData.role === 'sales') {
            const normalize = (str) => {
                if (!str) return '';
                let s = str.toString().trim().replace(/\s+/g, ' ');
                if (s.toLowerCase() === 'nghiêm linh' || s.toLowerCase() === 'ngoai ngu nghiem linh') return 'Ngoại Ngữ Nghiêm Linh';
                return s;
            };
            const crmSales = customers ? customers.map(c => c.saleInCharge).filter(Boolean) : [];
            const normalizedSales = crmSales.map(name => normalize(name));
            return [...new Set(normalizedSales)];
        }
        return [];
    }, [formData.role, teachers, tas, customers]);

    const filteredClassSuggestions = useMemo(() => {
        if (!formData.staffName || !classes) return [];
        const nameLower = formData.staffName.toLowerCase().trim();

        return classes.filter(c => {
            if (formData.role === 'teacher') return c.teacher && c.teacher.toLowerCase().includes(nameLower);
            if (formData.role === 'ta') return c.ta && c.ta.toLowerCase().includes(nameLower);
            return false;
        }).map(c => c.classCode);
    }, [formData.staffName, formData.role, classes]);

    const calculateTotal = (formState) => {
        const base = parseInt(formState.baseSalary) || 0;
        let totalAdj = 0;

        if (formState.adjustments && formState.adjustments.length > 0) {
            formState.adjustments.forEach(adj => {
                const amt = parseInt(adj.amount) || 0;
                if (adj.type === 'Phạt') {
                    totalAdj -= amt;
                } else if (adj.type !== 'Không') {
                    totalAdj += amt;
                }
            });
        }
        return base + totalAdj;
    };

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
            const finalTotal = calculateTotal(formData);

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

    const filteredPayrolls = payrolls.filter(p => {
        const matchTab = activeTab === 'all' || p.role === activeTab;
        const matchSearch = p.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.notes?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchTab && matchSearch;
    });

    const totalPaid = payrolls.filter(p => p.status === 'Đã thanh toán').reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPending = payrolls.filter(p => p.status === 'Chờ duyệt').reduce((sum, p) => sum + (p.amount || 0), 0);

    return (
        <div className="payroll-container">
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
                        <span>Đang chờ duyệt</span>
                        <strong style={{ color: '#d97706' }}>{totalPending.toLocaleString('vi-VN')} đ</strong>
                    </div>
                    <div className="payroll-kpi-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                        <i className="fa-solid fa-hourglass-half"></i>
                    </div>
                </div>
                <div className="payroll-kpi-card" style={{ cursor: 'pointer', backgroundColor: 'var(--primary)', color: 'white' }} onClick={openAddModal}>
                    <div className="payroll-kpi-info">
                        <span style={{ color: 'rgba(255,255,255,0.8)' }}>Quản lý chi phí</span>
                        <strong style={{ color: 'white' }}>Tạo hóa đơn trả lương</strong>
                    </div>
                    <div className="payroll-kpi-icon" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                        <i className="fa-solid fa-plus"></i>
                    </div>
                </div>
            </div>

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
                                {filteredStaffSuggestions.map((name, idx) => (
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
                                    <label className="payroll-form-label">Tên nhân sự (*)</label>
                                    <input type="text" list="filtered-staff-list" className="form-control" name="staffName" value={formData.staffName} onChange={handleInputChange} required placeholder="Nhập hoặc chọn tên..." autoComplete="off" />
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
                                        {calculateTotal(formData).toLocaleString('vi-VN')} {formData.currency}
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
        </div>
    );
}

export default PayrollManagement;