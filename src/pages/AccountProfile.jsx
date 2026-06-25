import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext'; 

// Kéo file ảnh từ thư mục assets vào
import adminAvatarImg from '../assets/admin_avatar.jpg';

function AccountProfile() {
    const { currentUser, currentRole, updateProfile } = useAuth();
    const { addNotification } = useNotification(); 

    const [formData, setFormData] = useState({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        role: currentUser.role || 'teacher'
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = (e) => {
        e.preventDefault();
        updateProfile(formData);
        
        addNotification('Cập nhật Hồ sơ', 'Thông tin tài khoản cá nhân đã được lưu thành công!', 'success', 'profile', {
            'Tên hiển thị': formData.name,
            'Số điện thoại': formData.phone || 'Chưa cập nhật',
            'Chức vụ': formData.role === 'admin' ? 'Quản trị viên' : formData.role === 'sales' ? 'Chuyên viên Sale' : 'Giáo viên'
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <i className="fa-solid fa-id-badge" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> Quản lý Hồ sơ Cá nhân
                </h3>

                <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                    
                    {/* Cột Avatar - DÙNG ẢNH MẶC ĐỊNH CHUẨN */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '4px solid var(--primary)', overflow: 'hidden' }}>
                            <img src={adminAvatarImg} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <button type="button" className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>Thay đổi ảnh</button>
                    </div>

                    {/* Cột Form */}
                    <form onSubmit={handleSave} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>TÊN ĐĂNG NHẬP / ID (Không thể đổi)</label>
                            <input type="text" className="form-control" value={currentUser.username} disabled style={{ backgroundColor: '#f1f5f9' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>HỌ VÀ TÊN HIỂN THỊ</label>
                            <input type="text" name="name" className="form-control" value={formData.name} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>SỐ ĐIỆN THOẠI</label>
                            <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleInputChange} placeholder="Nhập số điện thoại liên lạc" />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>ĐỊA CHỈ THƯỜNG TRÚ</label>
                            <input type="text" name="address" className="form-control" value={formData.address} onChange={handleInputChange} placeholder="Nhập địa chỉ của bạn" />
                        </div>

                        {/* --- RÚT GỌN 3 VAI TRÒ VÀ TỰ ĐỘNG ẨN VỚI NGƯỜI DÙNG THƯỜNG --- */}
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>CHỨC VỤ HỆ THỐNG</label>
                            <select
                                name="role"
                                className="form-control"
                                value={formData.role}
                                onChange={handleInputChange}
                                disabled={currentRole !== 'admin'}
                                style={{ backgroundColor: currentRole !== 'admin' ? '#f1f5f9' : 'white' }}
                            >
                                <option value="sales">Chuyên viên Sale</option>
                                <option value="teacher">Giáo viên</option>
                                
                                {/* Ẩn hoàn toàn chữ "Quản trị viên" khỏi Dropdown nếu không phải là Admin */}
                                {currentRole === 'admin' && <option value="admin">Quản trị viên (Admin)</option>}
                            </select>
                            
                            {currentRole !== 'admin' && <span style={{ fontSize: '0.75rem', color: 'var(--warning-text)', marginTop: '4px', display: 'block' }}>Chỉ Quản trị viên (Admin) mới có quyền thay đổi chức vụ.</span>}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>
                                LƯU THAY ĐỔI
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AccountProfile;
