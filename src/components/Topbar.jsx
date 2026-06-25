import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext'; 

// Kéo file ảnh từ thư mục assets vào
import adminAvatarImg from '../assets/admin_avatar.jpg';

function Topbar({ activeTab, setActiveTab, theme, toggleTheme }) {
    const { currentUser, logout } = useAuth();
    const [currentDate, setCurrentDate] = useState('');

    const { 
        notifications, unreadCount, markAsRead, markAsUnread, deleteNotif, 
        markAllAsRead, markMultipleAsRead, markMultipleAsUnread, deleteMultiple 
    } = useNotification();
    
    const [showNotif, setShowNotif] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    // STATE QUẢN LÝ CHỌN NHIỀU THÔNG BÁO VÀ XEM CHI TIẾT
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [viewingNotif, setViewingNotif] = useState(null); 

    const profileRef = useRef(null);

    useEffect(() => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        setCurrentDate(`${dd}/${mm}/${yyyy}`);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfile(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = (notif) => {
        if (isSelectMode) {
            setSelectedIds(prev => prev.includes(notif.id) ? prev.filter(i => i !== notif.id) : [...prev, notif.id]);
        } else {
            setViewingNotif(notif);
        }
    };

    const handleSelectAll = () => {
        if (selectedIds.length === notifications.length) setSelectedIds([]);
        else setSelectedIds(notifications.map(n => n.id));
    };

    const handleNavigate = (tab) => {
        if (tab) {
            setActiveTab(tab);
            setViewingNotif(null);
            setShowNotif(false);
        }
    };

    const pageTitles = {
        'classes': { title: 'Quản lý Lớp học', subtitle: 'Danh sách các lớp học chính thức' },
        'reports': { title: 'Báo cáo Lớp học', subtitle: 'Theo dõi sĩ số, giáo viên, tiến độ' },
        'my-class': { title: 'Lớp của tôi', subtitle: 'Thông tin chi tiết giảng dạy' },
        'crm': { title: 'Phễu Tuyển sinh & CRM', subtitle: 'Quản lý hành trình khách hàng' },
        'sales': { title: 'Quản lý Sale', subtitle: 'Bảng xếp hạng doanh số' },
        'care': { title: 'Chăm sóc Học viên', subtitle: 'Xử lý khiếu nại, bảo lưu' },
        'profile': { title: 'Hồ sơ Cá nhân', subtitle: 'Quản lý thông tin bảo mật và tài khoản hệ thống' },
    };

    const currentHeader = pageTitles[activeTab] || { title: 'Hệ thống Quản lý', subtitle: 'Chào mừng quay trở lại' };

    return (
        <header className="topbar">
            <div className="topbar-left-text">
                <h2>{currentHeader.title}</h2>
                <p>{currentHeader.subtitle}</p>
            </div>

            <div className="topbar-controls" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                
                <button className="circular-btn" onClick={toggleTheme} title="Chuyển chế độ Sáng/Tối">
                    <i className={theme === 'dark' ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
                </button>

                <button className="circular-btn" onClick={() => setShowNotif(true)} style={{ position: 'relative' }} title="Thông báo hệ thống">
                    <i className="fa-solid fa-bell"></i>
                    {unreadCount > 0 && <span className="pink-badge">{unreadCount}</span>}
                </button>

                {/* USER PROFILE DROPDOWN */}
                <div style={{ position: 'relative' }} ref={profileRef}>
                    <button className="circular-btn" onClick={() => setShowProfile(!showProfile)} style={{ padding: 0, overflow: 'hidden', border: '2px solid var(--border-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }}>
                        <img src={adminAvatarImg} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    </button>
                    {showProfile && (
                        <div style={{ position: 'absolute', top: '50px', right: 0, width: '220px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', zIndex: 1000, overflow: 'hidden' }}>
                            <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--primary-light)', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary)', flexShrink: 0 }}>
                                    <img src={adminAvatarImg} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.name || 'Người dùng'}</strong>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>{currentUser?.role || 'Guest'}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <button onClick={() => { setActiveTab('profile'); setShowProfile(false); }} style={{ padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-app)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <i className="fa-solid fa-pen-to-square" style={{ color: 'var(--primary)' }}></i> Chỉnh sửa Hồ sơ
                                </button>
                                <button onClick={logout} style={{ width: '100%', padding: '12px 16px', textAlign: 'left', background: 'none', border: 'none', color: '#ef4444', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#fee2e2'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <i className="fa-solid fa-arrow-right-from-bracket"></i> Đăng xuất an toàn
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* DATE PILL ĐÃ ĐƯỢC CHUYỂN RA NGOÀI CÙNG NHƯ BAN ĐẦU */}
            <div className="date-pill">
                <span>📅 Hôm nay: <strong>{currentDate}</strong></span>
            </div>

            {/* --- MODAL QUẢN LÝ THÔNG BÁO (CĂN GIỮA TOÀN MÀN HÌNH) --- */}
            {showNotif && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9998, display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ width: '650px', maxWidth: '90%', maxHeight: '85vh', backgroundColor: 'var(--bg-card)', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-app)' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}><i className="fa-solid fa-bell" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> Trung tâm Thông báo</h3>
                            <button onClick={() => setShowNotif(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#cbd5e1' }}>✖</button>
                        </div>

                        <div style={{ padding: '12px 24px', backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {!isSelectMode ? (
                                    <>
                                        <button onClick={markAllAsRead} className="btn" style={{ fontSize: '0.8rem', padding: '6px 12px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '6px', fontWeight: '700' }}><i className="fa-solid fa-check-double"></i> Đọc tất cả</button>
                                        <button onClick={() => setIsSelectMode(true)} className="btn" style={{ fontSize: '0.8rem', padding: '6px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '6px', fontWeight: '700' }}><i className="fa-solid fa-list-check"></i> Chọn nhiều</button>
                                    </>
                                ) : (
                                    <button onClick={() => { setIsSelectMode(false); setSelectedIds([]); }} className="btn" style={{ fontSize: '0.8rem', padding: '6px 12px', background: '#fee2e2', color: '#ef4444', borderRadius: '6px', fontWeight: '700' }}>Hủy chọn</button>
                                )}
                            </div>
                            
                            {isSelectMode && notifications.length > 0 && (
                                <label style={{ fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                                    <input type="checkbox" checked={selectedIds.length === notifications.length} onChange={handleSelectAll} style={{ transform: 'scale(1.2)' }} /> Chọn tất cả
                                </label>
                            )}
                        </div>
                        
                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>Không có thông báo nào trong hệ thống.</div>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} onClick={() => handleNotificationClick(n)} style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '16px', alignItems: 'center', backgroundColor: n.isRead ? 'transparent' : 'var(--primary-light)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => { if (n.isRead && !isSelectMode) e.currentTarget.style.backgroundColor = 'var(--bg-app)' }} onMouseOut={(e) => { if (n.isRead && !isSelectMode) e.currentTarget.style.backgroundColor = 'transparent' }}>
                                        {isSelectMode && <input type="checkbox" checked={selectedIds.includes(n.id)} readOnly style={{ transform: 'scale(1.3)', cursor: 'pointer' }} />}
                                        
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: n.type === 'error' ? '#fee2e2' : n.type === 'warning' ? '#fef3c7' : '#dcfce7', color: n.type === 'error' ? '#ef4444' : n.type === 'warning' ? '#d97706' : '#10b981', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, fontSize: '1.2rem' }}>
                                            <i className={`fa-solid ${n.type === 'error' ? 'fa-trash' : n.type === 'warning' ? 'fa-pen' : 'fa-plus'}`}></i>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <strong style={{ fontSize: '1rem', color: n.isRead ? 'var(--text-muted)' : 'var(--text-main)', display: 'block', marginBottom: '4px' }}>{n.title}</strong>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: n.isRead ? '#94a3b8' : 'var(--text-muted)', lineHeight: '1.4' }}>{n.message}</p>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '6px', fontWeight: '500' }}><i className="fa-regular fa-clock"></i> {n.time}</span>
                                        </div>
                                        {!isSelectMode && <i className="fa-solid fa-chevron-right" style={{ color: '#cbd5e1' }}></i>}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* TOOLBAR XỬ LÝ HÀNG LOẠT */}
                        {isSelectMode && selectedIds.length > 0 && (
                            <div style={{ padding: '16px 24px', backgroundColor: 'var(--bg-app)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>Đã chọn: {selectedIds.length}</span>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => { markMultipleAsRead(selectedIds); setSelectedIds([]); setIsSelectMode(false); }} className="btn" style={{ fontSize: '0.85rem', padding: '8px 16px', background: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: '700' }}>Đã đọc</button>
                                    <button onClick={() => { markMultipleAsUnread(selectedIds); setSelectedIds([]); setIsSelectMode(false); }} className="btn" style={{ fontSize: '0.85rem', padding: '8px 16px', background: '#cbd5e1', color: '#1e293b', borderRadius: '8px', fontWeight: '700' }}>Chưa đọc</button>
                                    <button onClick={() => { deleteMultiple(selectedIds); setSelectedIds([]); setIsSelectMode(false); }} className="btn" style={{ fontSize: '0.85rem', padding: '8px 16px', background: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '700' }}><i className="fa-solid fa-trash"></i> Xóa</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- MODAL CHI TIẾT TÓM TẮT THÔNG BÁO --- */}
            {viewingNotif && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="card" style={{ width: '550px', backgroundColor: 'white', padding: '28px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: viewingNotif.type === 'error' ? '#fee2e2' : viewingNotif.type === 'warning' ? '#fef3c7' : 'var(--success-light)', color: viewingNotif.type === 'error' ? '#ef4444' : viewingNotif.type === 'warning' ? '#d97706' : 'var(--success)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.4rem' }}>
                                    <i className={`fa-solid ${viewingNotif.type === 'error' ? 'fa-trash' : viewingNotif.type === 'warning' ? 'fa-pen' : 'fa-check'}`}></i>
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>{viewingNotif.title}</h3>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><i className="fa-regular fa-clock"></i> {viewingNotif.time}</span>
                                </div>
                            </div>
                            <button onClick={() => { setViewingNotif(null); setShowNotif(true); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#cbd5e1', cursor: 'pointer' }}>✖</button>
                        </div>

                        <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
                            <p style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: '#334155', fontWeight: '600', lineHeight: '1.5' }}>{viewingNotif.message}</p>

                            {/* BẢNG TÓM TẮT CHI TIẾT SỰ THAY ĐỔI */}
                            {viewingNotif.details && Object.keys(viewingNotif.details).length > 0 && (
                                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '16px' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary)', display: 'block', marginBottom: '10px', textTransform: 'uppercase' }}>Bản ghi chi tiết:</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {Object.entries(viewingNotif.details).map(([key, value]) => (
                                            <div key={key} style={{ display: 'flex', fontSize: '0.9rem', backgroundColor: 'white', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                <strong style={{ width: '130px', color: '#64748b' }}>{key}:</strong>
                                                <span style={{ flex: 1, color: '#0f172a', fontWeight: '600' }}>{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => { viewingNotif.isRead ? markAsUnread(viewingNotif.id) : markAsRead(viewingNotif.id); setViewingNotif(null); setShowNotif(true); }} className="btn" style={{ fontSize: '0.85rem', padding: '10px 16px', background: '#e2e8f0', color: '#1e293b', borderRadius: '8px', fontWeight: '700' }}>
                                    {viewingNotif.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                                </button>
                                <button onClick={() => { deleteNotif(viewingNotif.id); setViewingNotif(null); setShowNotif(true); }} className="btn" style={{ fontSize: '0.85rem', padding: '10px 16px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontWeight: '700' }}><i className="fa-solid fa-trash"></i> Xóa</button>
                            </div>

                            {viewingNotif.targetTab && (
                                <button onClick={() => handleNavigate(viewingNotif.targetTab)} className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '10px 24px', background: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: '800' }}>
                                    Đến trang liên quan <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

export default Topbar;
