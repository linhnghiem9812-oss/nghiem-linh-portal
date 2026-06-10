import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
});

function TeachingAssistantProfile() {
    const [tas, setTas] = useState([]);
    const [formInput, setFormInput] = useState({ name: '', email: '', phone: '', education: '', level: '' });

    useEffect(() => {
        api.get('/users/role/ta')
            .then(res => setTas(res.data))
            .catch(() => console.log('Chưa có danh sách TA trên CSDL.'));
    }, []);

    const handleSaveTA = async (e) => {
        e.preventDefault();
        if (!formInput.name || !formInput.phone) {
            alert('Vui lòng nhập Họ tên và Số điện thoại!');
            return;
        }

        try {
            const res = await api.post('/auth/register', {
                name: formInput.name,
                email: formInput.email,
                phone: formInput.phone,
                education: formInput.education,
                level: formInput.level,
                username: formInput.phone, // Lấy SĐT làm account đăng nhập cho TA
                password: '123',
                role: 'ta'
            });

            setTas([...tas, res.data]);
            setFormInput({ name: '', email: '', phone: '', education: '', level: '' });
            alert('Hệ thống: Lưu thông tin hồ sơ Trợ giảng thành công!');
        } catch (error) {
            alert('Lỗi: CSDL không phản hồi, không thể tạo Trợ giảng.');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', color: 'var(--primary)' }}>
                    <i className="fa-solid fa-user-graduate"></i> Nhập thông tin Trợ giảng
                </h3>
                <form onSubmit={handleSaveTA} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Họ & Tên</label>
                        <input type="text" className="form-control" value={formInput.name} onChange={(e) => setFormInput({ ...formInput, name: e.target.value })} required />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Email</label>
                        <input type="email" className="form-control" value={formInput.email} onChange={(e) => setFormInput({ ...formInput, email: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Số điện thoại (Zalo)</label>
                        <input type="text" className="form-control" value={formInput.phone} onChange={(e) => setFormInput({ ...formInput, phone: e.target.value })} required />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Học vấn</label>
                        <input type="text" className="form-control" value={formInput.education} onChange={(e) => setFormInput({ ...formInput, education: e.target.value })} placeholder="VD: Sinh viên ĐH Ngoại ngữ..." />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Trình độ</label>
                        <input type="text" className="form-control" value={formInput.level} onChange={(e) => setFormInput({ ...formInput, level: e.target.value })} placeholder="VD: HSK 5, IELTS 7.0..." />
                    </div>
                    <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px', fontWeight: '700', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                            Lưu thông tin Trợ giảng
                        </button>
                    </div>
                </form>
            </div>

            <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px' }}>
                    <i className="fa-solid fa-table-list"></i> Bảng thông tin Trợ giảng
                </h3>
                <div className="modal-table-container">
                    <table className="modal-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-app)' }}>
                                <th style={{ padding: '12px' }}>STT</th><th style={{ padding: '12px' }}>Họ & Tên</th>
                                <th style={{ padding: '12px' }}>Liên hệ (SĐT / Email)</th><th style={{ padding: '12px' }}>Học vấn</th><th style={{ padding: '12px' }}>Trình độ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tas.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Chưa có trợ giảng trong hệ thống.</td></tr>}
                            {tas.map((t, idx) => (
                                <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '12px', fontWeight: '700' }}>{idx + 1}</td>
                                    <td style={{ padding: '12px', fontWeight: '700', color: 'var(--text-main)' }}>{t.name}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{ display: 'block', fontSize: '0.85rem' }}>Zalo: {t.phone}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.email}</span>
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>{t.education}</td>
                                    <td style={{ padding: '12px', fontWeight: '700', color: 'var(--primary)' }}>{t.level}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default TeachingAssistantProfile;