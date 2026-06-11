import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
});

function TeacherProfile() {
    const { teachers, addTeacher, setTeachers } = useData();
    const [formInput, setFormInput] = useState({
        name: '', email: '', phone: '', experience: '', fee: '', address: '', status: 'Đang dạy'
    });

    // --- CẤU HÌNH TÙY CHỈNH CỘT (GIỐNG CRM) ---
    const [isPanelExpanded, setIsPanelExpanded] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState({
        email: true,
        experience: true,
        fee: true,
        address: false,
        status: true
    });

    const optionalColumnsConfig = [
        { key: 'email', label: 'Email', icon: 'fa-envelope' },
        { key: 'experience', label: 'Kinh nghiệm', icon: 'fa-book' },
        { key: 'fee', label: 'Lương/Buổi', icon: 'fa-wallet' },
        { key: 'address', label: 'Địa chỉ', icon: 'fa-location-dot' },
        { key: 'status', label: 'Trạng thái', icon: 'fa-user-check' }
    ];

    const toggleColumn = (key) => setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
    
    // --- HÀM XỬ LÝ DỮ LIỆU ---
    const handleInputChange = (e) => {
        setFormInput({ ...formInput, [e.target.name]: e.target.value });
    };

    const handleSaveTeacher = async (e) => {
        e.preventDefault();
        const result = await addTeacher(formInput);
        if (result && result.success) {
            alert('Hệ thống: Lưu hồ sơ giáo viên thành công!');
            setFormInput({ name: '', email: '', phone: '', experience: '', fee: '', address: '', status: 'Đang dạy' });
        } else {
            alert('Lỗi: Không thể lưu thông tin!');
        }
    };

    const handleDeleteTeacher = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa giáo viên này?')) {
            try {
                await api.delete(`/users/${id}`);
                setTeachers(teachers.filter(t => t.id !== id));
                alert('Đã xóa giáo viên!');
            } catch (err) { alert('Lỗi xóa dữ liệu!'); }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', animation: 'fadeIn 0.3s ease-out' }}>
            
            {/* FORM TIẾP NHẬN */}
            <div className="card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '24px', color: 'var(--primary)', borderLeft: '4px solid var(--primary)', paddingLeft: '12px' }}>
                    <i className="fa-solid fa-user-plus" style={{ marginRight: '8px' }}></i> Tiếp nhận giáo viên
                </h3>
                <form onSubmit={handleSaveTeacher} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    <input className="form-control" name="name" placeholder="Họ và tên" value={formInput.name} onChange={handleInputChange} required />
                    <input className="form-control" name="email" placeholder="Email" value={formInput.email} onChange={handleInputChange} />
                    <input className="form-control" name="phone" placeholder="Số điện thoại" value={formInput.phone} onChange={handleInputChange} required />
                    <div style={{ gridColumn: 'span 2' }}>
                        <input className="form-control" name="experience" placeholder="Học vấn & Kinh nghiệm" value={formInput.experience} onChange={handleInputChange} />
                    </div>
                    <input className="form-control" name="fee" placeholder="Mức lương / Buổi" value={formInput.fee} onChange={handleInputChange} />
                    <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 3', padding: '14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '800' }}>LƯU THÔNG TIN</button>
                </form>
            </div>

            {/* BẢNG DANH SÁCH (THEO PHONG CÁCH CRM) */}
            <div className="card" style={{ padding: '24px' }}>
                
                {/* THANH ĐIỀU KHIỂN CỘT (STICKY) */}
                <div style={{ 
                    position: 'sticky', top: '0', zIndex: '20', backgroundColor: '#ffffff', 
                    border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    padding: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '15px' }}>
                        <button type="button" onClick={() => setIsPanelExpanded(!isPanelExpanded)} style={{ 
                            background: isPanelExpanded ? '#4f46e5' : 'white', color: isPanelExpanded ? 'white' : '#4f46e5',
                            border: '1px solid #4f46e5', padding: '6px 16px', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem' 
                        }}>
                            {isPanelExpanded ? 'Đóng bảng chọn' : 'Tùy chỉnh cột'}
                        </button>
                        {isPanelExpanded && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => setVisibleColumns({email: true, experience: true, fee: true, address: true, status: true})} style={{ fontSize: '0.75rem', padding: '6px 12px', cursor: 'pointer', border: '1px solid #d1d5db', borderRadius: '6px', background: '#f3f4f6' }}>Chọn tất cả</button>
                                <button onClick={() => setVisibleColumns({email: false, experience: false, fee: false, address: false, status: false})} style={{ fontSize: '0.75rem', padding: '6px 12px', cursor: 'pointer', border: '1px solid #d1d5db', borderRadius: '6px', background: '#f3f4f6' }}>Bỏ chọn</button>
                            </div>
                        )}
                        {!isPanelExpanded && (
                            <div style={{ display: 'flex', gap: '8px', color: '#64748b' }}>
                                {optionalColumnsConfig.filter(col => visibleColumns[col.key]).map(col => <i key={col.key} className={`fa-solid ${col.icon}`} title={col.label}></i>)}
                            </div>
                        )}
                    </div>
                    {isPanelExpanded && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                            {optionalColumnsConfig.map(col => (
                                <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', backgroundColor: visibleColumns[col.key] ? '#eef2ff' : '#f8fafc', border: visibleColumns[col.key] ? '1px solid #4f46e5' : '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', color: visibleColumns[col.key] ? '#4f46e5' : '#475569' }}>
                                    <input type="checkbox" checked={visibleColumns[col.key]} onChange={() => toggleColumn(col.key)} />
                                    <i className={`fa-solid ${col.icon}`}></i> {col.label}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* BẢNG DỮ LIỆU */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-app)', textAlign: 'left', fontSize: '0.75rem' }}>
                                <th style={{ padding: '16px' }}>STT</th>
                                <th style={{ padding: '16px' }}>HỌ TÊN</th>
                                <th style={{ padding: '16px' }}>SĐT</th>
                                {visibleColumns.email && <th style={{ padding: '16px' }}>EMAIL</th>}
                                {visibleColumns.experience && <th style={{ padding: '16px' }}>KINH NGHIỆM</th>}
                                {visibleColumns.fee && <th style={{ padding: '16px' }}>LƯƠNG/BUỔI</th>}
                                {visibleColumns.address && <th style={{ padding: '16px' }}>ĐỊA CHỈ</th>}
                                {visibleColumns.status && <th style={{ padding: '16px' }}>TRẠNG THÁI</th>}
                                <th style={{ padding: '16px', textAlign: 'center' }}>THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map((t, idx) => (
                                <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px', fontWeight: '700' }}>{idx + 1}</td>
                                    <td style={{ padding: '16px' }}>{t.name}</td>
                                    <td style={{ padding: '16px' }}>{t.phone}</td>
                                    {visibleColumns.email && <td style={{ padding: '16px' }}>{t.email}</td>}
                                    {visibleColumns.experience && <td style={{ padding: '16px' }}>{t.experience}</td>}
                                    {visibleColumns.fee && <td style={{ padding: '16px' }}>{t.fee}</td>}
                                    {visibleColumns.address && <td style={{ padding: '16px' }}>{t.address}</td>}
                                    {visibleColumns.status && <td style={{ padding: '16px' }}>{t.status}</td>}
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <button onClick={() => handleDeleteTeacher(t.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default TeacherProfile;
