import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
});

function TeacherProfile() {
    const { teachers, addTeacher, setTeachers } = useData();

    const [formInput, setFormInput] = useState({ name: '', email: '', phone: '', experience: '', fee: '', address: '', status: 'Đang dạy' });

    // --- STATE QUẢN LÝ MODAL CHI TIẾT & CHỈNH SỬA ---
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

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

    const toggleColumn = (key) => setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
    const handleInputChange = (e) => setFormInput({ ...formInput, [e.target.name]: e.target.value });

    const handleSaveTeacher = async (e) => {
        e.preventDefault();
        if (!formInput.name || !formInput.phone) {
            alert('Vui lòng nhập Họ tên và Số điện thoại!');
            return;
        }
        const result = await addTeacher(formInput);
        if (result && result.success) {
            alert('Hệ thống: Lưu thông tin hồ sơ giáo viên thành công!');
            setFormInput({ name: '', email: '', phone: '', experience: '', fee: '', address: '', status: 'Đang dạy' });
        }
    };

    const handleSaveEdit = async () => {
        if (!selectedTeacher || !selectedTeacher.id) return alert('Lỗi: Không xác định được ID giáo viên!');
        try {
            await api.put(`/users/${selectedTeacher.id}`, selectedTeacher);
            setTeachers(teachers.map(t => t.id === selectedTeacher.id ? selectedTeacher : t));
            setSelectedTeacher(null);
            setIsEditing(false);
            alert('Hệ thống: Cập nhật thông tin thành công!');
        } catch (err) {
            alert(`Lỗi cập nhật: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDeleteTeacher = async (id) => {
        if (!id) return alert('Lỗi: Dữ liệu này không có ID hợp lệ để xóa!');
        if (window.confirm('Cảnh báo: Bạn có chắc chắn muốn xóa giáo viên này khỏi hệ thống?')) {
            try {
                await api.delete(`/users/${id}`);
                setTeachers(teachers.filter(t => t.id !== id));
                if (selectedTeacher && selectedTeacher.id === id) setSelectedTeacher(null);
                alert('Hệ thống: Đã xóa giáo viên thành công!');
            } catch (err) {
                alert(`Lỗi xóa dữ liệu (Mã: ${err.response?.status}): ${err.response?.data?.message || err.message}`);
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', animation: 'fadeIn 0.3s ease-out' }}>

            {/* FORM TIẾP NHẬN GIÁO VIÊN */}
            <div className="card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '24px', color: 'var(--primary)', borderLeft: '4px solid var(--primary)', paddingLeft: '12px' }}>
                    <i className="fa-solid fa-user-plus" style={{ marginRight: '8px' }}></i> Tiếp nhận giáo viên / Nhập thông tin nhân sự
                </h3>
                <form onSubmit={handleSaveTeacher} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    <div><label className="form-label">Họ và tên (*)</label><input type="text" name="name" className="form-control" placeholder="Ví dụ: Điệp Mạnh" value={formInput.name} onChange={handleInputChange} required /></div>
                    <div><label className="form-label">Email cá nhân</label><input type="email" name="email" className="form-control" placeholder="teacher@nghiemlinh.edu.vn" value={formInput.email} onChange={handleInputChange} /></div>
                    <div><label className="form-label">Số điện thoại (*)</label><input type="text" name="phone" className="form-control" placeholder="09xxxxxxxx" value={formInput.phone} onChange={handleInputChange} required /></div>
                    <div style={{ gridColumn: 'span 2' }}><label className="form-label">Học vấn & Kinh nghiệm giảng dạy</label><input type="text" name="experience" className="form-control" placeholder="Chứng chỉ HSK, thâm niên dạy..." value={formInput.experience} onChange={handleInputChange} /></div>
                    <div><label className="form-label">Mức học phí (VNĐ) / Buổi dạy</label><input type="number" name="fee" className="form-control" placeholder="350000" value={formInput.fee} onChange={handleInputChange} /></div>
                    <div style={{ gridColumn: 'span 2' }}><label className="form-label">Địa chỉ</label><input type="text" name="address" className="form-control" value={formInput.address} onChange={handleInputChange} /></div>
                    <div>
                        <label className="form-label">Trạng thái</label>
                        <select name="status" className="form-control" value={formInput.status} onChange={handleInputChange}>
                            <option value="Đang dạy">Đang dạy</option><option value="Tạm nghỉ">Tạm nghỉ</option><option value="Đã nghỉ">Đã nghỉ</option>
                        </select>
                    </div>
                    <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '14px 40px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>LƯU THÔNG TIN GIÁO VIÊN</button>
                    </div>
                </form>
            </div>

            {/* BẢNG DỮ LIỆU */}
            <div className="card" style={{ padding: '24px' }}>
                <div style={{
                    position: 'sticky', top: '0', zIndex: '20', backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    padding: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '15px' }}>
                        <button type="button" onClick={() => setIsPanelExpanded(!isPanelExpanded)} style={{
                            background: isPanelExpanded ? '#4f46e5' : '#ffffff', color: isPanelExpanded ? 'white' : '#4f46e5',
                            border: '1px solid #4f46e5', padding: '6px 16px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                            <i className={`fa-solid ${isPanelExpanded ? 'fa-cog' : 'fa-list-ul'}`}></i>
                            <span>{isPanelExpanded ? 'Đóng bảng chọn' : 'Tùy chỉnh cột'}</span>
                        </button>
                        {isPanelExpanded && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => setVisibleColumns(Object.keys(visibleColumns).reduce((acc, key) => ({ ...acc, [key]: true }), {}))} style={{ fontSize: '0.75rem', padding: '6px 12px', cursor: 'pointer', border: '1px solid #d1d5db', borderRadius: '6px', background: '#f3f4f6' }}>Chọn tất cả</button>
                                <button onClick={() => setVisibleColumns(Object.keys(visibleColumns).reduce((acc, key) => ({ ...acc, [key]: false }), {}))} style={{ fontSize: '0.75rem', padding: '6px 12px', cursor: 'pointer', border: '1px solid #d1d5db', borderRadius: '6px', background: '#f3f4f6' }}>Bỏ chọn</button>
                            </div>
                        )}
                        {!isPanelExpanded && (
                            <div style={{ display: 'flex', gap: '8px', color: '#64748b' }}>
                                {optionalColumnsConfig.filter(col => visibleColumns[col.key]).map(col => <i key={col.key} className={`fa-solid ${col.icon}`} title={col.label} style={{ fontSize: '0.9rem' }}></i>)}
                            </div>
                        )}
                    </div>
                    {isPanelExpanded && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                            {optionalColumnsConfig.map(col => (
                                <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', backgroundColor: visibleColumns[col.key] ? '#eef2ff' : '#f8fafc', border: visibleColumns[col.key] ? '1px solid #4f46e5' : '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', color: visibleColumns[col.key] ? '#4f46e5' : '#475569' }}>
                                    <input type="checkbox" checked={visibleColumns[col.key]} onChange={() => toggleColumn(col.key)} />
                                    <i className={`fa-solid ${col.icon}`}></i> {col.label}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal-table-container" style={{ overflowX: 'auto', maxWidth: '100%' }}>
                    <table className="modal-table" style={{ width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: 'var(--bg-app)', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
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
                                <tr key={t.id || idx} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'white' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: '700' }}>{idx + 1}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: '700', cursor: 'pointer' }} onClick={() => { setSelectedTeacher({ ...t }); setIsEditing(false); }}>
                                            {t.name || '---'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>{t.phone || '---'}</td>
                                    {visibleColumns.email && <td style={{ padding: '16px' }}>{t.email || '---'}</td>}
                                    {visibleColumns.experience && <td style={{ padding: '16px' }}>{t.experience || '---'}</td>}
                                    {visibleColumns.fee && <td style={{ padding: '16px', fontWeight: '700', color: 'var(--primary)' }}>{t.fee ? `${parseInt(t.fee).toLocaleString('vi-VN')} đ` : '---'}</td>}
                                    {visibleColumns.address && <td style={{ padding: '16px' }}>{t.address || '---'}</td>}
                                    {visibleColumns.status && <td style={{ padding: '16px' }}>
                                        <span style={{ backgroundColor: t.status === 'Đang dạy' ? '#dcfce7' : '#fee2e2', color: t.status === 'Đang dạy' ? '#166534' : '#b91c1c', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800' }}>{t.status || 'Đang dạy'}</span>
                                    </td>}
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                            <button onClick={() => { setSelectedTeacher({ ...t }); setIsEditing(true); }} title="Sửa" style={{ border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#475569', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><i className="fa-solid fa-pen"></i></button>
                                            <button onClick={() => handleDeleteTeacher(t.id)} title="Xóa" style={{ border: '1px solid #fecaca', background: '#fee2e2', color: '#b91c1c', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><i className="fa-solid fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL XEM CHI TIẾT & CHỈNH SỬA HỒ SƠ GIÁO VIÊN */}
            {selectedTeacher && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="card" style={{ width: '550px', backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                            <h3 style={{ fontWeight: '800' }}><i className="fa-solid fa-user-pen"></i> {isEditing ? "Chỉnh sửa hồ sơ" : "Hồ sơ giáo viên"}</h3>
                            <button onClick={() => setSelectedTeacher(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✖</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Họ và tên</label>
                                {isEditing ? <input className="form-control" value={selectedTeacher.name || ''} onChange={(e) => setSelectedTeacher({ ...selectedTeacher, name: e.target.value })} /> : <div style={{ fontWeight: '600' }}>{selectedTeacher.name || '---'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Số điện thoại</label>
                                {isEditing ? <input className="form-control" value={selectedTeacher.phone || ''} onChange={(e) => setSelectedTeacher({ ...selectedTeacher, phone: e.target.value })} /> : <div style={{ fontWeight: '600' }}>{selectedTeacher.phone || '---'}</div>}
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Email</label>
                                {isEditing ? <input className="form-control" value={selectedTeacher.email || ''} onChange={(e) => setSelectedTeacher({ ...selectedTeacher, email: e.target.value })} /> : <div style={{ fontWeight: '600' }}>{selectedTeacher.email || '---'}</div>}
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Kinh nghiệm / Học vấn</label>
                                {isEditing ? <input className="form-control" value={selectedTeacher.experience || ''} onChange={(e) => setSelectedTeacher({ ...selectedTeacher, experience: e.target.value })} /> : <div style={{ fontWeight: '600' }}>{selectedTeacher.experience || '---'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Mức lương / Buổi</label>
                                {isEditing ? <input type="number" className="form-control" value={selectedTeacher.fee || ''} onChange={(e) => setSelectedTeacher({ ...selectedTeacher, fee: e.target.value })} /> : <div style={{ fontWeight: '600' }}>{selectedTeacher.fee ? `${parseInt(selectedTeacher.fee).toLocaleString('vi-VN')} đ` : '---'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Trạng thái</label>
                                {isEditing ? (
                                    <select className="form-control" value={selectedTeacher.status || 'Đang dạy'} onChange={(e) => setSelectedTeacher({ ...selectedTeacher, status: e.target.value })}>
                                        <option value="Đang dạy">Đang dạy</option><option value="Tạm nghỉ">Tạm nghỉ</option><option value="Đã nghỉ">Đã nghỉ</option>
                                    </select>
                                ) : <div style={{ fontWeight: '600' }}>{selectedTeacher.status || '---'}</div>}
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Địa chỉ thường trú</label>
                                {isEditing ? <input className="form-control" value={selectedTeacher.address || ''} onChange={(e) => setSelectedTeacher({ ...selectedTeacher, address: e.target.value })} /> : <div style={{ fontWeight: '600' }}>{selectedTeacher.address || '---'}</div>}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                            <button className="btn" style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }} onClick={() => handleDeleteTeacher(selectedTeacher.id)}><i className="fa-solid fa-trash"></i> Xóa hồ sơ</button>
                            {!isEditing ? (
                                <button className="btn" style={{ padding: '10px 20px', backgroundColor: 'var(--warning)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }} onClick={() => setIsEditing(true)}><i className="fa-solid fa-pen"></i> Sửa thông tin</button>
                            ) : (
                                <button className="btn" style={{ padding: '10px 20px', backgroundColor: 'var(--success)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }} onClick={handleSaveEdit}><i className="fa-solid fa-floppy-disk"></i> Lưu thay đổi</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TeacherProfile;