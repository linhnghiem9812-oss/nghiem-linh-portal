import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
});

function TeachingAssistantProfile() {
    const [tas, setTas] = useState([]);
    const [formInput, setFormInput] = useState({ name: '', email: '', phone: '', education: '', level: '' });

    // --- STATE QUẢN LÝ MODAL CHI TIẾT & CHỈNH SỬA ---
    const [selectedTA, setSelectedTA] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [isPanelExpanded, setIsPanelExpanded] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState({
        email: true, education: true, level: true
    });

    const optionalColumnsConfig = [
        { key: 'email', label: 'Email', icon: 'fa-envelope' },
        { key: 'education', label: 'Học vấn', icon: 'fa-graduation-cap' },
        { key: 'level', label: 'Trình độ', icon: 'fa-award' }
    ];

    useEffect(() => {
        api.get('/users/role/ta')
            .then(res => setTas(res.data))
            .catch(() => console.log('Chưa có danh sách TA trên CSDL.'));
    }, []);

    const toggleColumn = (key) => setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));

    const handleSaveTA = async (e) => {
        e.preventDefault();
        if (!formInput.name || !formInput.phone) {
            alert('Vui lòng nhập Họ tên và Số điện thoại!');
            return;
        }

        try {
            const res = await api.post('/auth/register', {
                name: formInput.name, email: formInput.email, phone: formInput.phone,
                education: formInput.education, level: formInput.level,
                username: formInput.phone, password: '123', role: 'ta'
            });

            setTas([...tas, { ...res.data, education: formInput.education, level: formInput.level }]);
            setFormInput({ name: '', email: '', phone: '', education: '', level: '' });
            alert('Hệ thống: Lưu thông tin hồ sơ Trợ giảng thành công!');
        } catch (error) {
            alert(`Lỗi: Không thể tạo Trợ giảng. ${error.response?.data?.message || ''}`);
        }
    };

    const handleSaveEdit = async () => {
        if (!selectedTA || !selectedTA.id) return alert('Lỗi: Không xác định được ID trợ giảng!');
        try {
            await api.put(`/users/${selectedTA.id}`, selectedTA);
            setTas(tas.map(t => t.id === selectedTA.id ? selectedTA : t));
            setSelectedTA(null);
            setIsEditing(false);
            alert('Hệ thống: Cập nhật thông tin trợ giảng thành công!');
        } catch (err) {
            alert(`Lỗi cập nhật: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDeleteTA = async (id) => {
        if (!id) return alert('Lỗi: Dữ liệu này không có ID hợp lệ để xóa!');
        if (window.confirm('Cảnh báo: Bạn có chắc chắn muốn xóa trợ giảng này khỏi hệ thống?')) {
            try {
                await api.delete(`/users/${id}`);
                setTas(tas.filter(t => t.id !== id));
                if (selectedTA && selectedTA.id === id) setSelectedTA(null);
                alert('Đã xóa trợ giảng thành công!');
            } catch (err) {
                alert(`Lỗi xóa dữ liệu (Mã: ${err.response?.status}): ${err.response?.data?.message || err.message}`);
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease-out' }}>

            {/* FORM TIẾP NHẬN TRỢ GIẢNG */}
            <div className="card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '24px', color: '#10b981', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <i className="fa-solid fa-user-graduate" style={{ marginRight: '8px' }}></i> Thông tin Trợ giảng
                </h3>
                <form onSubmit={handleSaveTA} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Họ & Tên</label><input type="text" className="form-control" value={formInput.name} onChange={(e) => setFormInput({ ...formInput, name: e.target.value })} required /></div>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Email</label><input type="email" className="form-control" value={formInput.email} onChange={(e) => setFormInput({ ...formInput, email: e.target.value })} /></div>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Số điện thoại (Zalo)</label><input type="text" className="form-control" value={formInput.phone} onChange={(e) => setFormInput({ ...formInput, phone: e.target.value })} required /></div>
                    <div style={{ gridColumn: 'span 2' }}><label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Học vấn</label><input type="text" className="form-control" value={formInput.education} onChange={(e) => setFormInput({ ...formInput, education: e.target.value })} placeholder="VD: Sinh viên ĐH Ngoại ngữ..." /></div>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Trình độ</label><input type="text" className="form-control" value={formInput.level} onChange={(e) => setFormInput({ ...formInput, level: e.target.value })} placeholder="VD: HSK 5, IELTS 7.0..." /></div>
                    <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px', fontWeight: '800', backgroundColor: '#10b981', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>LƯU THÔNG TIN TRỢ GIẢNG</button>
                    </div>
                </form>
            </div>

            <div className="card" style={{ padding: '24px' }}>
                <div style={{
                    position: 'sticky', top: '0', zIndex: '20', backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    padding: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '15px' }}>
                        <button type="button" onClick={() => setIsPanelExpanded(!isPanelExpanded)} style={{
                            background: isPanelExpanded ? '#10b981' : '#ffffff', color: isPanelExpanded ? 'white' : '#10b981',
                            border: '1px solid #10b981', padding: '6px 16px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
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
                                <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', backgroundColor: visibleColumns[col.key] ? '#ecfdf5' : '#f8fafc', border: visibleColumns[col.key] ? '1px solid #10b981' : '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', color: visibleColumns[col.key] ? '#059669' : '#475569' }}>
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
                                <th style={{ padding: '16px' }}>HỌ & TÊN</th>
                                <th style={{ padding: '16px' }}>SĐT</th>
                                {visibleColumns.email && <th style={{ padding: '16px' }}>EMAIL</th>}
                                {visibleColumns.education && <th style={{ padding: '16px' }}>HỌC VẤN</th>}
                                {visibleColumns.level && <th style={{ padding: '16px' }}>TRÌNH ĐỘ</th>}
                                <th style={{ padding: '16px', textAlign: 'center' }}>THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tas.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}><i className="fa-solid fa-inbox" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block' }}></i>Chưa có trợ giảng trong hệ thống.</td></tr>}
                            {tas.map((t, idx) => (
                                <tr key={t.id || idx} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'white' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: '700' }}>{idx + 1}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ color: '#10b981', textDecoration: 'underline', fontWeight: '700', cursor: 'pointer' }} onClick={() => { setSelectedTA({ ...t }); setIsEditing(false); }}>
                                            {t.name || '---'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>{t.phone || '---'}</td>
                                    {visibleColumns.email && <td style={{ padding: '16px' }}>{t.email || '---'}</td>}
                                    {visibleColumns.education && <td style={{ padding: '16px' }}>{t.education || '---'}</td>}
                                    {visibleColumns.level && <td style={{ padding: '16px' }}><span style={{ backgroundColor: '#f1f5f9', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>{t.level || '---'}</span></td>}
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                            <button onClick={() => { setSelectedTA({ ...t }); setIsEditing(true); }} title="Sửa" style={{ border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#475569', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><i className="fa-solid fa-pen"></i></button>
                                            <button onClick={() => handleDeleteTA(t.id)} title="Xóa" style={{ border: '1px solid #fecaca', background: '#fee2e2', color: '#b91c1c', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><i className="fa-solid fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL XEM CHI TIẾT & CHỈNH SỬA HỒ SƠ TRỢ GIẢNG */}
            {selectedTA && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="card" style={{ width: '550px', backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                            <h3 style={{ fontWeight: '800', color: '#10b981' }}><i className="fa-solid fa-user-pen"></i> {isEditing ? "Chỉnh sửa hồ sơ" : "Hồ sơ trợ giảng"}</h3>
                            <button onClick={() => setSelectedTA(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✖</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Họ và tên</label>
                                {isEditing ? <input className="form-control" value={selectedTA.name || ''} onChange={(e) => setSelectedTA({ ...selectedTA, name: e.target.value })} /> : <div style={{ fontWeight: '600' }}>{selectedTA.name || '---'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Số điện thoại</label>
                                {isEditing ? <input className="form-control" value={selectedTA.phone || ''} onChange={(e) => setSelectedTA({ ...selectedTA, phone: e.target.value })} /> : <div style={{ fontWeight: '600' }}>{selectedTA.phone || '---'}</div>}
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Email</label>
                                {isEditing ? <input className="form-control" value={selectedTA.email || ''} onChange={(e) => setSelectedTA({ ...selectedTA, email: e.target.value })} /> : <div style={{ fontWeight: '600' }}>{selectedTA.email || '---'}</div>}
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Học vấn</label>
                                {isEditing ? <input className="form-control" value={selectedTA.education || ''} onChange={(e) => setSelectedTA({ ...selectedTA, education: e.target.value })} /> : <div style={{ fontWeight: '600' }}>{selectedTA.education || '---'}</div>}
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Trình độ</label>
                                {isEditing ? <input className="form-control" value={selectedTA.level || ''} onChange={(e) => setSelectedTA({ ...selectedTA, level: e.target.value })} /> : <div style={{ fontWeight: '600' }}>{selectedTA.level || '---'}</div>}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                            <button className="btn" style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }} onClick={() => handleDeleteTA(selectedTA.id)}><i className="fa-solid fa-trash"></i> Xóa hồ sơ</button>
                            {!isEditing ? (
                                <button className="btn" style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }} onClick={() => setIsEditing(true)}><i className="fa-solid fa-pen"></i> Sửa thông tin</button>
                            ) : (
                                <button className="btn" style={{ padding: '10px 20px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }} onClick={handleSaveEdit}><i className="fa-solid fa-floppy-disk"></i> Lưu thay đổi</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TeachingAssistantProfile;