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

            // SỬA LỖI MẤT DỮ LIỆU: Ép dữ liệu Học vấn & Trình độ từ form vào state hiển thị
            // (Đề phòng trường hợp Backend UserEntity chưa kịp lưu 2 trường này)
            setTas([...tas, { ...res.data, education: formInput.education, level: formInput.level }]);
            setFormInput({ name: '', email: '', phone: '', education: '', level: '' });
            alert('Hệ thống: Lưu thông tin hồ sơ Trợ giảng thành công!');
        } catch (error) {
            alert('Lỗi: CSDL không phản hồi, không thể tạo Trợ giảng.');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease-out' }}>
            <div className="card" style={{ padding: '32px' }}>
                {/* SỬA YÊU CẦU: Đổi tên thành "Thông tin Trợ giảng" */}
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '24px', color: '#10b981', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <i className="fa-solid fa-user-graduate" style={{ marginRight: '8px' }}></i> Thông tin Trợ giảng
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
                        <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px', fontWeight: '800', backgroundColor: '#10b981', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                            LƯU THÔNG TIN TRỢ GIẢNG
                        </button>
                    </div>
                </form>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>
                        <i className="fa-solid fa-table-list"></i> Bảng thông tin Trợ giảng
                    </h3>
                </div>
                <div className="modal-table-container">
                    <table className="modal-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'white', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '16px 24px' }}>STT</th>
                                <th style={{ padding: '16px 24px' }}>Họ & Tên</th>
                                <th style={{ padding: '16px 24px' }}>Liên hệ (SĐT / Email)</th>
                                <th style={{ padding: '16px 24px' }}>Học vấn</th>
                                <th style={{ padding: '16px 24px' }}>Trình độ</th>
                                {/* SỬA YÊU CẦU: Thêm cột Thao tác */}
                                <th style={{ padding: '16px 24px', textAlign: 'center' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tas.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Chưa có trợ giảng trong hệ thống.</td></tr>}
                            {tas.map((t, idx) => (
                                <tr key={t.id || idx} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'white' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: '700' }}>{idx + 1}</td>
                                    <td style={{ padding: '16px 24px', fontWeight: '700', color: '#10b981' }}>{t.name}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ display: 'block', fontSize: '0.85rem' }}>Zalo: {t.phone}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.email || 'Chưa cập nhật'}</span>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.85rem' }}>{t.education || 'Chưa cập nhật'}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}>
                                            {t.level || 'Chưa cập nhật'}
                                        </span>
                                    </td>
                                    {/* SỬA YÊU CẦU: Thêm nút Xóa giống bảng khách hàng */}
                                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                        <button title="Xóa" style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}>
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

export default TeachingAssistantProfile;