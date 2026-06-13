import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext'; // Gọi AuthContext để định danh user

function Topbar({ activeTab, setActiveTab, theme, toggleTheme }) {
    const { currentUser, logout } = useAuth(); // Lấy thông tin user hiện tại để chia thông báo
    const [currentDate, setCurrentDate] = useState('');

    // --- STATE QUẢN LÝ THÔNG BÁO VÀ DROPDOWN ---
    const [showNotif, setShowNotif] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [notifEnabled, setNotifEnabled] = useState(true);
    const [notifications, setNotifications] = useState([]);

    const notifRef = useRef(null);
    const profileRef = useRef(null);

    // Kích hoạt ngày giờ
    useEffect(() => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        setCurrentDate(`${dd}/${mm}/${yyyy}`);
    }, []);

    // Khởi tạo thông báo từ LocalStorage dựa trên user đăng nhập
    useEffect(() => {
        if (!currentUser) return;
        const savedNotifs = localStorage.getItem(`notifs_${currentUser.username}`);
        const savedSetting = localStorage.getItem(`notif_setting_${currentUser.username}`);

        if (savedSetting !== null) setNotifEnabled(JSON.parse(savedSetting));

        if (savedNotifs) {
            setNotifications(JSON.parse(savedNotifs));
        } else {
            // Thông báo chào mừng mặc định
            const defaultNotifs = [
                { id: Date.now(), title: 'Hệ thống Nghiêm Linh', message: `Xin chào ${currentUser.name || 'bạn'}! Chào mừng quay trở lại hệ thống.`, isRead: false, time: new Date().toLocaleString('vi-VN') }
            ];
            setNotifications(defaultNotifs);
            localStorage.setItem(`notifs_${currentUser.username}`, JSON.stringify(defaultNotifs));
        }
    }, [currentUser]);

    // Xử lý click ra ngoài để đóng Dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotif(false);
            if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfile(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- CÁC HÀM XỬ LÝ THÔNG BÁO ---
    const saveNotifs = (newNotifs) => {
        // Giới hạn tối đa 30 thông báo gần nhất
        const cappedNotifs = newNotifs.slice(0, 30);
        setNotifications(cappedNotifs);
        localStorage.setItem(`notifs_${currentUser.username}`, JSON.stringify(cappedNotifs));
    };

    const toggleReadStatus = (id) => {
        const updated = notifications.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n);
        saveNotifs(updated);
    };

    const markAllRead = () => {
        const updated = notifications.map(n => ({ ...n, isRead: true }));
        saveNotifs(updated);
    };

    const deleteNotif = (id) => {
        const updated = notifications.filter(n => n.id !== id);
        saveNotifs(updated);
    };

    const toggleNotifSetting = () => {
        const newState = !notifEnabled;
        setNotifEnabled(newState);
        localStorage.setItem(`notif_setting_${currentUser.username}`, JSON.stringify(newState));
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const pageTitles = {
        'classes': { title: 'Quản lý Lớp học', subtitle: 'Danh sách các lớp học chính thức đang hoạt động tại trung tâm' },
        'reports': { title: 'Báo cáo Lớp học', subtitle: 'Theo dõi sĩ số học viên, giáo viên, tiến độ và lịch sử chi tiết ca dạy' },
        'my-class': { title: 'Lớp của tôi', subtitle: 'Thông tin chi tiết giảng dạy, lộ trình & điểm danh chuyên cần' },
        'dashboard': { title: 'Tổng quan trung tâm', subtitle: 'Hệ thống phân tích doanh số, tuyển sinh & hiệu suất kinh doanh' },
        'crm': { title: 'Phễu Tuyển sinh & CRM', subtitle: 'Quản lý hành trình khách hàng từ lúc mới liên hệ' },
        'sales': { title: 'Quản lý Sale', subtitle: 'Bảng xếp hạng doanh số & đội ngũ chuyên viên tư vấn' },
        'care': { title: 'Chăm sóc Học viên', subtitle: 'Xử lý ticket khiếu nại, bảo lưu, theo dõi chất lượng học viên' },
        'finance': { title: 'Tài chính & Doanh thu', subtitle: 'Theo dõi học phí phải thu, hóa đơn và lịch sử đóng học' },
        'assistant': { title: 'Giáo viên trợ giảng', subtitle: 'Hệ thống hỗ trợ quản lý lớp học dành riêng cho Trợ giảng' },
        'profile': { title: 'Hồ sơ Cá nhân', subtitle: 'Quản lý thông tin bảo mật và tài khoản hệ thống' },
    };

    const currentHeader = pageTitles[activeTab] || { title: 'Hệ thống Quản lý', subtitle: 'Chào mừng quay trở lại' };

    return (
        <header className="topbar">
            <div className="topbar-left-text">
                <h2>{currentHeader.title}</h2>
                <p>{currentHeader.subtitle}</p>
            </div>

            <div className="topbar-controls">
                <button className="circular-btn" onClick={toggleTheme} title="Chuyển chế độ Sáng/Tối">
                    <i className={theme === 'dark' ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
                </button>

                {/* --- KHU VỰC THÔNG BÁO (BELL ICON) --- */}
                <div style={{ position: 'relative' }} ref={notifRef}>
                    <button className="circular-btn" title="Thông báo hệ thống" onClick={() => setShowNotif(!showNotif)}>
                        <i className={notifEnabled ? "fa-solid fa-bell" : "fa-solid fa-bell-slash"}></i>
                        {notifEnabled && unreadCount > 0 && <span className="pink-badge">{unreadCount}</span>}
                    </button>

                    {showNotif && (
                        <div style={{ position: 'absolute', top: '50px', right: '-60px', width: '360px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', zIndex: 1000, overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-app)' }}>
                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)' }}>Thông báo</h4>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={markAllRead} title="Đánh dấu tất cả đã đọc" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: '700' }}><i className="fa-solid fa-check-double"></i></button>
                                    <button onClick={toggleNotifSetting} title={notifEnabled ? "Tắt thông báo" : "Bật thông báo"} style={{ background: 'none', border: 'none', cursor: 'pointer', color: notifEnabled ? 'var(--text-muted)' : '#ef4444', fontSize: '0.8rem' }}>
                                        <i className={notifEnabled ? "fa-solid fa-bell-slash" : "fa-solid fa-bell"}></i>
                                    </button>
                                </div>
                            </div>

                            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                {!notifEnabled ? (
                                    <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        <i className="fa-solid fa-bell-slash" style={{ fontSize: '2rem', marginBottom: '10px', opacity: 0.5 }}></i><br />
                                        Bạn đang tắt thông báo hệ thống.
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        Không có thông báo nào.
                                    </div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px', backgroundColor: n.isRead ? 'transparent' : 'var(--primary-light)', transition: 'background 0.2s' }}>
                                            <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => toggleReadStatus(n.id)}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <strong style={{ fontSize: '0.85rem', color: n.isRead ? 'var(--text-muted)' : 'var(--text-main)' }}>{n.title}</strong>
                                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{n.time.split(' ')[1]}</span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: n.isRead ? '#94a3b8' : 'var(--text-muted)', lineHeight: '1.4' }}>{n.message}</p>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); deleteNotif(n.id); }} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', alignSelf: 'flex-start' }} title="Xóa thông báo">✖</button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div style={{ padding: '10px', textAlign: 'center', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-app)' }}>
                                Hệ thống lưu tối đa 30 thông báo gần nhất.
                            </div>
                        </div>
                    )}
                </div>

                {/* --- KHU VỰC HỒ SƠ TÀI KHOẢN (USER ICON) --- */}
                <div style={{ position: 'relative' }} ref={profileRef}>
                    <button className="circular-btn" title="Hồ sơ cá nhân" onClick={() => setShowProfile(!showProfile)}>
                        <i className="fa-solid fa-user"></i>
                    </button>

                    {showProfile && (
                        <div style={{ position: 'absolute', top: '50px', right: 0, width: '220px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', zIndex: 1000, overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--primary-light)' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '800' }}>
                                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{currentUser?.name || 'Người dùng'}</strong>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>{currentUser?.role || 'Guest'}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <button onClick={() => { setActiveTab('profile'); setShowProfile(false); }} style={{ padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-app)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <i className="fa-solid fa-pen-to-square" style={{ color: 'var(--primary)' }}></i> Chỉnh sửa Hồ sơ
                                </button>
                                <button onClick={logout} style={{ padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#fee2e2'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <i className="fa-solid fa-arrow-right-from-bracket"></i> Đăng xuất an toàn
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="date-pill">
                    <span>📅 Hôm nay: <strong>{currentDate}</strong></span>
                </div>
            </div>
        </header>
    );
}

export default Topbar;