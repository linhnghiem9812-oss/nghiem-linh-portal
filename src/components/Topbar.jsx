import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

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

    const notifRef = useRef(null);
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

    // CLICK VÀO THÔNG BÁO
    const handleNotificationClick = (notif) => {
        if (isSelectMode) {
            // Chế độ chọn: Tick/Untick hộp kiểm
            setSelectedIds(prev => prev.includes(notif.id) ? prev.filter(i => i !== notif.id) : [...prev, notif.id]);
        } else {
            // Chế độ xem: Bật Modal chi tiết
            setViewingNotif(notif);
            setShowNotif(false);
        }
    };

    const handleSelectAll = () => {
        if (selectedIds.length === notifications.length) setSelectedIds([]);
        else setSelectedIds(notifications.map(n => n.id));
    };

    // HÀNH ĐỘNG TRONG MODAL CHI TIẾT
    const handleNavigate = (tab) => {
        if (tab) {
            setActiveTab(tab);
            setViewingNotif(null);
        }
    };

    const pageTitles = {
        'classes': { title: 'Quản lý Lớp học', subtitle: 'Danh sách các lớp học chính thức' },
        'reports': { title: 'Báo cáo Lớp học', subtitle: 'Theo dõi sĩ số, giáo viên, tiến độ' },
        'my-class': { title: 'Lớp của tôi', subtitle: 'Thông tin chi tiết giảng dạy' },
        'crm': { title: 'Phễu Tuyển sinh & CRM', subtitle: 'Quản lý hành trình khách hàng' },
        'sales': { title: 'Quản lý Sale', subtitle: 'Bảng xếp hạng doanh số' },
        'care': { title: 'Chăm sóc Học viên', subtitle: 'Xử lý khiếu nại, bảo lưu' },
    };

    const currentHeader = pageTitles[activeTab] || { title: 'Hệ thống Quản lý', subtitle: 'Chào mừng quay trở lại' };

    return (
        <header className="topbar">
            <div className="topbar-left-text">
                <h2>{currentHeader.title}</h2>
                <p>{currentHeader.subtitle}</p>
            </div>

            <div className="topbar-controls">
                <button className="circular-btn" onClick={toggleTheme}>
                    <i className={theme === 'dark' ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
                </button>

                {/* --- CHUÔNG THÔNG BÁO --- */}
                <div style={{ position: 'relative' }} ref={notifRef}>
                    <button className="circular-btn" onClick={() => setShowNotif(!showNotif)}>
                        <i className="fa-solid fa-bell"></i>
                        {unreadCount > 0 && <span className="pink-badge">{unreadCount}</span>}
                    </button>

                    {showNotif && (
                        <div style={{ position: 'absolute', top: '50px', right: '-60px', width: '400px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', zIndex: 1000, overflow: 'hidden' }}>
                            {/* HEADER BẢNG THÔNG BÁO */}
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

                            {/* DANH SÁCH THÔNG BÁO */}
                            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                {notifications.length === 0 ? (
                                    <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Không có thông báo nào.</div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} onClick={() => handleNotificationClick(n)} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: n.isRead ? 'transparent' : 'var(--primary-light)', cursor: 'pointer' }} onMouseOver={(e) => { if (n.isRead && !isSelectMode) e.currentTarget.style.backgroundColor = 'var(--bg-app)' }} onMouseOut={(e) => { if (n.isRead && !isSelectMode) e.currentTarget.style.backgroundColor = 'transparent' }}>
                                            {isSelectMode && <input type="checkbox" checked={selectedIds.includes(n.id)} readOnly />}

                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: n.type === 'error' ? '#fee2e2' : n.type === 'warning' ? '#fef3c7' : 'var(--success-light)', color: n.type === 'error' ? '#ef4444' : n.type === 'warning' ? '#d97706' : 'var(--success)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                                                <i className={`fa-solid ${n.type === 'error' ? 'fa-trash' : n.type === 'warning' ? 'fa-pen' : 'fa-plus'}`}></i>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <strong style={{ fontSize: '0.85rem', color: n.isRead ? 'var(--text-muted)' : 'var(--text-main)', display: 'block', marginBottom: '2px' }}>{n.title}</strong>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: n.isRead ? '#94a3b8' : 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>{n.message}</p>
                                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>{n.time}</span>
                                            </div>
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
                    <button className="circular-btn" onClick={() => setShowProfile(!showProfile)}>
                        <i className="fa-solid fa-user"></i>
                    </button>
                    {showProfile && (
                        <div style={{ position: 'absolute', top: '50px', right: 0, width: '220px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', zIndex: 1000 }}>
                            <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--primary-light)' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '800' }}>U</div>
                                <div>
                                    <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--primary)' }}>{currentUser?.name || 'Người dùng'}</strong>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser?.role}</span>
                                </div>
                            </div>
                            <button onClick={logout} style={{ width: '100%', padding: '12px', textAlign: 'left', background: 'none', border: 'none', color: '#ef4444', fontWeight: '600', cursor: 'pointer' }}><i className="fa-solid fa-arrow-right-from-bracket"></i> Đăng xuất</button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL CHI TIẾT TÓM TẮT THÔNG BÁO --- */}
            {viewingNotif && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="card" style={{ width: '500px', backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: viewingNotif.type === 'error' ? '#fee2e2' : viewingNotif.type === 'warning' ? '#fef3c7' : 'var(--success-light)', color: viewingNotif.type === 'error' ? '#ef4444' : viewingNotif.type === 'warning' ? '#d97706' : 'var(--success)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem' }}>
                                    <i className={`fa-solid ${viewingNotif.type === 'error' ? 'fa-trash' : viewingNotif.type === 'warning' ? 'fa-pen' : 'fa-check'}`}></i>
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>{viewingNotif.title}</h3>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}><i className="fa-regular fa-clock"></i> {viewingNotif.time}</span>
                                </div>
                            </div>
                            <button onClick={() => setViewingNotif(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#cbd5e1', cursor: 'pointer' }}>✖</button>
                        </div>

                        <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                            <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#334155', fontWeight: '600', lineHeight: '1.5' }}>{viewingNotif.message}</p>

                            {/* BẢNG TÓM TẮT CHI TIẾT SỰ THAY ĐỔI */}
                            {viewingNotif.details && Object.keys(viewingNotif.details).length > 0 && (
                                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Bản ghi chi tiết:</span>
                                    {Object.entries(viewingNotif.details).map(([key, value]) => (
                                        <div key={key} style={{ display: 'flex', marginBottom: '6px', fontSize: '0.85rem' }}>
                                            <strong style={{ width: '120px', color: '#64748b' }}>{key}:</strong>
                                            <span style={{ flex: 1, color: '#0f172a', fontWeight: '500' }}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => { viewingNotif.isRead ? markAsUnread(viewingNotif.id) : markAsRead(viewingNotif.id); setViewingNotif(null); }} className="btn" style={{ fontSize: '0.8rem', padding: '8px 16px', background: '#e2e8f0', color: '#1e293b', borderRadius: '6px', fontWeight: '700' }}>
                                    {viewingNotif.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                                </button>
                                <button onClick={() => { deleteNotif(viewingNotif.id); setViewingNotif(null); }} className="btn" style={{ fontSize: '0.8rem', padding: '8px 16px', background: '#fee2e2', color: '#ef4444', borderRadius: '6px', fontWeight: '700' }}><i className="fa-solid fa-trash"></i> Xóa</button>
                            </div>

                            {viewingNotif.targetTab && (
                                <button onClick={() => handleNavigate(viewingNotif.targetTab)} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 20px', background: 'var(--primary)', color: 'white', borderRadius: '6px', fontWeight: '800' }}>
                                    Đến trang liên quan <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }}></i>
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