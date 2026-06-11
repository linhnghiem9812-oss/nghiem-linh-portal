import React, { useEffect, useState } from 'react';

function Topbar({ activeTab, theme, toggleTheme }) {
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        setCurrentDate(`${dd}/${mm}/${yyyy}`);
    }, []);

    const pageTitles = {
        'classes': { title: 'Quản lý Lớp học', subtitle: 'Danh sách các lớp học chính thức đang hoạt động tại trung tâm' },
        'reports': { title: 'Báo cáo Lớp học', subtitle: 'Theo dõi sĩ số học viên, giáo viên, tiến độ và lịch sử chi tiết ca dạy' },
        'my-class': { title: 'Lớp của tôi', subtitle: 'Thông tin chi tiết giảng dạy, lộ trình & điểm danh chuyên cần' },
        'dashboard': { title: 'Tổng quan trung tâm', subtitle: 'Hệ thống phân tích doanh số, tuyển sinh & hiệu suất kinh doanh' },
        'crm': { title: 'Phễu Tuyển sinh & CRM', subtitle: 'Quản lý hành trình khách hàng từ lúc mới liên hệ' },
        'sales': { title: 'Quản lý Sale', subtitle: 'Bảng xếp hạng doanh số & đội ngũ chuyên viên tư vấn' },
        'care': { title: 'Chăm sóc Học viên', subtitle: 'Xử lý ticket khiếu nại, hỗ trợ học vụ và nhắc nhở sinh nhật' },
        'teachers': { title: 'Thông tin Giáo viên', subtitle: 'Quản lý thông tin cơ bản, học vấn và trạng thái công tác của nhân sự' },
        'finance': { title: 'Tài chính & Doanh thu', subtitle: 'Theo dõi học phí phải thu, hóa đơn và lịch sử đóng học' }
    };

    const currentHeader = pageTitles[activeTab] || { title: 'Hệ thống Quản trị', subtitle: 'Ngoại ngữ Nghiêm Linh' };

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

                <button className="circular-btn" title="Thông báo hệ thống">
                    <i className="fa-solid fa-bell"></i>
                    <span className="pink-badge">2</span>
                </button>

                <button className="circular-btn" title="Hồ sơ cá nhân" onClick={() => setActiveTab('profile')}>
                    <i className="fa-solid fa-user"></i>
                </button>

                <div className="date-pill">
                    <span>📅 Hôm nay: <strong>{currentDate}</strong></span>
                </div>
            </div>
        </header>
    );
}

export default Topbar;