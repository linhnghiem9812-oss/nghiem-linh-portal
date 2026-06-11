import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
});

function TeacherProfile() {
    const { teachers, addTeacher, setTeachers } = useData();

    // --- STATE QUẢN LÝ ---
    const [formInput, setFormInput] = useState({ name: '', email: '', phone: '', experience: '', fee: '', address: '', status: 'Đang dạy' });
    const [editingTeacher, setEditingTeacher] = useState(null); // Quản lý dòng đang sửa
    const [isPanelExpanded, setIsPanelExpanded] = useState(false);

    const [visibleColumns, setVisibleColumns] = useState({
        email: true, experience: true, fee: true, address: false, status: true
    });

    const optionalColumnsConfig = [
        { key: 'email', label: 'Email', icon: 'fa-envelope' },
        { key: 'experience', label: 'Kinh nghiệm', icon: 'fa-book' },
        { key: 'fee', label: 'Lương/Buổi', icon: 'fa-wallet' },
        { key: 'address', label: 'Địa chỉ', icon: 'fa-location-dot' },
        { key: 'status', label: 'Trạng thái', icon: 'fa-user-check' }
    ];

    // --- CÁC HÀM XỬ LÝ ---
    const toggleColumn = (key) => setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));

    const handleInputChange = (e) => setFormInput({ ...formInput, [e.target.name]: e.target.value });

    const handleSaveTeacher = async (e) => {
        e.preventDefault();
        if (!formInput.name || !formInput.phone) {
            alert('Hệ thống: Vui lòng nhập đầy đủ Họ tên và Số điện thoại!');
            return;
        }
        const result = await addTeacher(formInput);
        if (result && result.success) {
            alert('Hệ thống: Lưu thông tin hồ sơ giáo viên thành công!');
            setFormInput({ name: '', email: '', phone: '', experience: '', fee: '', address: '', status: 'Đang dạy' });
        }
    };

    const handleUpdateTeacher = async () => {
        try {
            await api.put(`/users/${editingTeacher.id}`, editingTeacher);
            setTeachers(teachers.map(t => t.id === editingTeacher.id ? editingTeacher : t));
            setEditingTeacher(null);
            alert('Hệ thống: Cập nhật thông tin thành công!');
        } catch (err) { alert('Lỗi cập nhật: ' + err.message); }
    };

    const handleDeleteTeacher = async (id) => {
        if (window.confirm('Cảnh báo: Bạn có chắc chắn muốn xóa giáo viên này khỏi hệ thống?')) {
            try {
                await api.delete(`/users/${id}`);
                setTeachers(teachers.filter(t => t.id !== id));
                alert('Hệ thống: Đã xóa giáo viên!');
            } catch (err) { alert('Lỗi xóa dữ liệu!'); }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', animation: 'fadeIn 0.3s ease-out' }}>

            {/* PHẦN 1: FORM TIẾP NHẬN GIÁO VIÊN */}
            <div className="card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '24px', color: 'var(--primary)', borderLeft: '4px solid var(--primary)', paddingLeft: '12px' }}>
                    <i className="fa-solid fa-user-plus" style={{ marginRight: '8px' }}></i> Tiếp nhận giáo viên / Nhập thông tin nhân sự
                </h3>

                <form onSubmit={handleSaveTeacher} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    <div>
                        <label className="form-label">Họ và tên (*)</label>
                        <input type="text" name="name" className="form-control" placeholder="Ví dụ: Điệp Mạnh" value={formInput.name} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <label className="form-label">Email cá nhân</label>
                        <input type="email" name="email" className="form-control" placeholder="teacher@nghiemlinh.edu.vn" value={formInput.email} onChange={handleInputChange} />
                    </div>
                    <div>
                        <label className="form-label">Số điện thoại (*)</label>
                        <input type="text" name="phone" className="form-control" placeholder="09xxxxxxxx" value={formInput.phone} onChange={handleInputChange} required />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Học vấn & Kinh nghiệm giảng dạy</label>
                        <input type="text" name="experience" className="form-control" placeholder="Chứng chỉ HSK, thâm niên dạy..." value={formInput.experience} onChange={handleInputChange} />
                    </div>
                    <div>
                        <label className="form-label">Mức học phí (VNĐ) / Buổi dạy</label>
                        <input type="number" name="fee" className="form-control" placeholder="350000" value={formInput.fee} onChange={handleInputChange} />
                    </div>
                    <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '14px 40px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>
                            LƯU THÔNG TIN GIÁO VIÊN
                        </button>
                    </div>
                </form>
            </div>

            {/* PHẦN 2: BẢNG DANH SÁCH GIÁO VIÊN (CÓ THANH CÔNG CỤ TÙY CHỈNH) */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>

                {/* THANH ĐIỀU KHIỂN CỐ ĐỊNH (STICKY) */}
                <div style={{
                    position: 'sticky', top: '0', zIndex: '20', backgroundColor: '#ffffff',
                    borderBottom: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px'
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
                                <button onClick={() => setVisibleColumns({ email: true, experience: true, fee: true, address: true, status: true })} style={{ fontSize: '0.75rem', padding: '6px 12px', cursor: 'pointer', border: '1px solid #d1d5db', borderRadius: '6px', background: '#f3f4f6' }}>Chọn tất cả</button>
                                <button onClick={() => setVisibleColumns({ email: false, experience: false, fee: false, address: false, status: false })} style={{ fontSize: '0.75rem', padding: '6px 12px', cursor: 'pointer', border: '1px solid #d1d5db', borderRadius: '6px', background: '#f3f4f6' }}>Bỏ chọn</button>
                            </div>
                        )}
                        {!isPanelExpanded && (
                            <div style={{ display: 'flex', gap: '8px', color: '#64748b' }}>
                                {optionalColumnsConfig.filter(col => visibleColumns[col.key]).map(col => <i key={col.key} className={`fa-solid ${col.icon}`} title={col.label} style={{ fontSize: '0.9rem' }}></i>)}
                            </div>
                        )}
                    </div>
                    {isPanelExpanded && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', paddingTop: '10px' }}>
                            {optionalColumnsConfig.map(col => (
                                <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', backgroundColor: visibleColumns[col.key] ? '#eef2ff' : '#f8fafc', border: visibleColumns[col.key] ? '1px solid #4f46e5' : '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', color: visibleColumns[col.key] ? '#4f46e5' : '#475569' }}>
                                    <input type="checkbox" checked={visibleColumns[col.key]} onChange={() => toggleColumn(col.key)} />
                                    <i className={`fa-solid ${col.icon}`}></i> {col.label}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: 'white', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            <tr>
                                <th style={{ padding: '16px 24px' }}>STT</th>
                                <th style={{ padding: '16px' }}>HỌ TÊN</th>
                                <th style={{ padding: '16px' }}>SĐT</th>
                                {visibleColumns.email && <th style={{ padding: '16px' }}>EMAIL</th>}
                                {visibleColumns.experience && <th style={{ padding: '16px' }}>KINH NGHIỆM</th>}
                                {visibleColumns.fee && <th style={{ padding: '16px' }}>LƯƠNG</th>}
                                {visibleColumns.address && <th style={{ padding: '16px' }}>ĐỊA CHỈ</th>}
                                {visibleColumns.status && <th style={{ padding: '16px' }}>TRẠNG THÁI</th>}
                                <th style={{ padding: '16px', textAlign: 'center' }}>THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers && teachers.map((t, idx) => (
                                <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: '700' }}>{idx + 1}</td>
                                    <td style={{ padding: '16px' }}>
                                        {editingTeacher?.id === t.id ? <input className="form-control" value={editingTeacher.name} onChange={e => setEditingTeacher({ ...editingTeacher, name: e.target.value })} /> : t.name}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        {editingTeacher?.id === t.id ? <input className="form-control" value={editingTeacher.phone} onChange={e => setEditingTeacher({ ...editingTeacher, phone: e.target.value })} /> : t.phone}
                                    </td>
                                    {visibleColumns.email && <td style={{ padding: '16px' }}>{t.email}</td>}
                                    {visibleColumns.experience && <td style={{ padding: '16px' }}>{t.experience}</td>}
                                    {visibleColumns.fee && <td style={{ padding: '16px' }}>{t.fee}</td>}
                                    {visibleColumns.address && <td style={{ padding: '16px' }}>{t.address}</td>}
                                    {visibleColumns.status && <td style={{ padding: '16px' }}>{t.status}</td>}
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                            {editingTeacher?.id === t.id ? (
                                                <button onClick={handleUpdateTeacher} style={{ border: 'none', background: 'none', color: '#22c55e', cursor: 'pointer' }}><i className="fa-solid fa-floppy-disk"></i></button>
                                            ) : (
                                                <button onClick={() => setEditingTeacher(t)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><i className="fa-solid fa-pen"></i></button>
                                            )}
                                            <button onClick={() => handleDeleteTeacher(t.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><i className="fa-solid fa-trash"></i></button>
                                        </div>
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
