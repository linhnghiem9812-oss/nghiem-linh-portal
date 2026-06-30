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

    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [viewingNotif, setViewingNotif] = useState(null);

    const notifRef = useRef(null);
    const profileRef = useRef(null);
    
    // 1. REF ĐỂ LƯU DẤU VẾT THÔNG BÁO TỰ ĐỘNG BẬT POPUP
    const isInitialMount = useRef(true);
    const lastNotifIdRef = useRef(null);

    // Xử lý ngày tháng hiện tại
    useEffect(() => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        setCurrentDate(`${dd}/${mm}/${yyyy}`);
    }, []);

    // Xử lý Click ra ngoài Dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotif(false);
                setIsSelectMode(false);
                setSelectedIds([]);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfile(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 2. LOGIC THEO DÕI THÔNG BÁO MỚI ĐỂ TỰ ĐỘNG POPUP
    useEffect(() => {
        if (notifications && notifications.length > 0) {
            // Lấy thông báo mới nhất (đầu mảng)
            const newestNotif = notifications[0]; 

            // Nếu không phải là lần tải trang đầu tiên, và có ID thông báo mới xuất hiện
            if (!isInitialMount.current && newestNotif.id !== lastNotifIdRef.current) {
                setViewingNotif(newestNotif); // Tự động bật Modal Popup chi tiết
            }
            
            // Cập nhật lại ID để ghi nhớ
            lastNotifIdRef.current = newestNotif.id;
        }
        isInitialMount.current = false;
    }, [notifications]);

    const handleNotificationClick = (notif) => {
        if (isSelectMode) {
            setSelectedIds(prev => prev.includes(notif.id) ? prev.filter(i => i !== notif.id) : [...prev, notif.id]);
        } else {
            setViewingNotif(notif);
            setShowNotif(false); // Đóng menu thả xuống khi mở xem chi tiết
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
        'payroll': { title: 'Thanh toán Lương', subtitle: 'Quản lý chi phí và lập hóa đơn lương nhân sự' },
    };

    const currentHeader = pageTitles[activeTab] || { title: 'Hệ thống Quản lý', subtitle: 'Chào mừng quay trở lại' };

    return (
        <header className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="topbar-left-text">
                <h2>{currentHeader.title}</h2>
                <p>{currentHeader.subtitle}</p>
            </div>

            <div className="topbar-controls" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

                <button className="circular-btn" onClick={toggleTheme} title="Chuyển chế độ Sáng/Tối">
                    <i className={theme === 'dark' ? "fa-solid fa-moon" : "fa-solid fa-sun"}></i>
                </button>

                {/* --- KHU VỰC THÔNG BÁO (DROPDOWN MENU) --- */}
                <div style={{ position: 'relative' }} ref={notifRef}>
                    <button className="circular-btn" onClick={() => setShowNotif(!showNotif)} title="Thông báo hệ thống">
                        <i className="fa-solid fa-bell"></i>
                        {unreadCount > 0 && <span className="pink-badge">{unreadCount}</span>}
                    </button>

                    {showNotif && (
                        <div style={{ position: 'absolute', top: '55px', right: '-80px', width: '400px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', zIndex: 1000, overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-app)' }}>
                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)' }}>Thông báo</h4>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {!isSelectMode ? (
                                        <>
                                            <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '700' }}><i className="fa-solid fa-check-double"></i> Đọc hết</button>
                                            <button onClick={() => setIsSelectMode(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.75rem', fontWeight: '700' }}><i className="fa-solid fa-list-check"></i> Chọn</button>
                                        </>
                                    ) : (
                                        <button onClick={() => { setIsSelectMode(false); setSelectedIds([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.75rem', fontWeight: '700' }}>Hủy chọn</button>
                                    )}
                                </div>
                            </div>

                            {isSelectMode && notifications.length > 0 && (
                                <div style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <input type="checkbox" checked={selectedIds.length === notifications.length} onChange={handleSelectAll} /> Chọn tất cả
                                    </label>
                                </div>
                            )}

                            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                {notifications.length === 0 ? (
                                    <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Không có thông báo nào.</div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} onClick={() => handleNotificationClick(n)} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: n.isRead ? 'transparent' : 'var(--primary-light)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => { if (n.isRead && !isSelectMode) e.currentTarget.style.backgroundColor = 'var(--bg-app)' }} onMouseOut={(e) => { if (n.isRead && !isSelectMode) e.currentTarget.style.backgroundColor = 'transparent' }}>
                                            {isSelectMode && <input type="checkbox" checked={selectedIds.includes(n.id)} readOnly style={{ cursor: 'pointer' }} />}

                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: n.type === 'error' ? '#fee2e2' : n.type === 'warning' ? '#fef3c7' : 'var(--success-light)', color: n.type === 'error' ? '#ef4444' : n.type === 'warning' ? '#d97706' : 'var(--success)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, fontSize: '1rem' }}>
                                                <i className={`fa-solid ${n.type === 'error' ? 'fa-trash' : n.type === 'warning' ? 'fa-pen' : 'fa-check'}`}></i>
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <strong style={{ fontSize: '0.85rem', color: n.isRead ? 'var(--text-muted)' : 'var(--text-main)', display: 'block', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</strong>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: n.isRead ? '#94a3b8' : 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.message}</p>
                                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>{n.time}</span>
                                            </div>
                                            {!isSelectMode && <i className="fa-solid fa-chevron-right" style={{ color: '#cbd5e1', fontSize: '0.8rem' }}></i>}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* TOOLBAR XỬ LÝ HÀNG LOẠT */}
                            {isSelectMode && selectedIds.length > 0 && (
                                <div style={{ padding: '12px', backgroundColor: 'var(--bg-app)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => { markMultipleAsRead(selectedIds); setSelectedIds([]); setIsSelectMode(false); }} className="btn" style={{ fontSize: '0.7rem', padding: '6px 12px', background: 'var(--primary)', color: 'white', borderRadius: '6px' }}>Đã đọc</button>
                                        <button onClick={() => { markMultipleAsUnread(selectedIds); setSelectedIds([]); setIsSelectMode(false); }} className="btn" style={{ fontSize: '0.7rem', padding: '6px 12px', background: '#cbd5e1', color: '#1e293b', borderRadius: '6px' }}>Chưa đọc</button>
                                    </div>
                                    <button onClick={() => { deleteMultiple(selectedIds); setSelectedIds([]); setIsSelectMode(false); }} className="btn" style={{ fontSize: '0.7rem', padding: '6px 12px', background: '#ef4444', color: 'white', borderRadius: '6px' }}><i className="fa-solid fa-trash"></i> Xóa</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* USER PROFILE DROPDOWN */}
                <div style={{ position: 'relative' }} ref={profileRef}>
                    <button className="circular-btn" onClick={() => setShowProfile(!showProfile)} style={{ padding: 0, overflow: 'hidden', border: '2px solid var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }}>
                        <img src={adminAvatarImg} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                    {showProfile && (
                        <div style={{ position: 'absolute', top: '55px', right: 0, width: '220px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', zIndex: 1000, overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' }}>
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

                {/* DATE PILL */}
                <div style={{ backgroundColor: 'white', padding: '8px 16px', borderRadius: '50px', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', marginLeft: '6px' }}>
                    <span>📅 Hôm nay: <strong style={{ color: 'var(--primary)' }}>{currentDate}</strong></span>
                </div>
            </div>

            {/* --- MODAL CHI TIẾT TÓM TẮT THÔNG BÁO (PHỦ ĐEN 100% MÀN HÌNH VÀ CLICK OUTSIDE) --- */}
            {viewingNotif && (
                <div 
                    onClick={() => setViewingNotif(null)} // Click vào màn đêm để đóng
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.2s ease-out' }}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()} // Ngăn lệnh đóng nếu click vào bên trong form
                        className="card" 
                        style={{ width: '550px', maxWidth: '95vw', backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                    >
                        {/* TIÊU ĐỀ VÀ ICON */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: viewingNotif.type === 'error' ? '#fee2e2' : viewingNotif.type === 'warning' ? '#fef3c7' : '#dcfce7', color: viewingNotif.type === 'error' ? '#ef4444' : viewingNotif.type === 'warning' ? '#d97706' : '#10b981', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.6rem' }}>
                                    <i className={`fa-solid ${viewingNotif.type === 'error' ? 'fa-trash' : viewingNotif.type === 'warning' ? 'fa-pen' : 'fa-check'}`}></i>
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)' }}>{viewingNotif.title}</h3>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><i className="fa-regular fa-clock"></i> {viewingNotif.time}</span>
                                </div>
                            </div>
                            <button onClick={() => setViewingNotif(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#cbd5e1', cursor: 'pointer' }}>✖</button>
                        </div>

                        {/* NỘI DUNG VÀ BẢN GHI CHI TIẾT */}
                        <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
                            <p style={{ margin: '0 0 20px 0', fontSize: '1rem', color: '#334155', fontWeight: '600', lineHeight: '1.6' }}>{viewingNotif.message}</p>

                            {viewingNotif.details && Object.keys(viewingNotif.details).length > 0 && (
                                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '20px' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)', display: 'block', marginBottom: '12px', textTransform: 'uppercase' }}>Bản ghi chi tiết:</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {Object.entries(viewingNotif.details).map(([key, value]) => (
                                            <div key={key} style={{ display: 'flex', alignItems: 'center', fontSize: '0.95rem', backgroundColor: 'white', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                <strong style={{ width: '150px', color: '#64748b' }}>{key}:</strong>
                                                <span style={{ flex: 1, color: '#0f172a', fontWeight: '700' }}>{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* CÁC NÚT THAO TÁC */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => { viewingNotif.isRead ? markAsUnread(viewingNotif.id) : markAsRead(viewingNotif.id); setViewingNotif(null); }} className="btn" style={{ fontSize: '0.9rem', padding: '10px 20px', background: '#e2e8f0', color: '#1e293b', borderRadius: '8px', fontWeight: '700' }}>
                                    {viewingNotif.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                                </button>
                                <button onClick={() => { deleteNotif(viewingNotif.id); setViewingNotif(null); }} className="btn" style={{ fontSize: '0.9rem', padding: '10px 20px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontWeight: '700' }}><i className="fa-solid fa-trash"></i> Xóa</button>
                            </div>

                            {viewingNotif.targetTab && (
                                <button onClick={() => handleNavigate(viewingNotif.targetTab)} className="btn btn-primary" style={{ fontSize: '0.95rem', padding: '10px 24px', background: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: '800' }}>
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
