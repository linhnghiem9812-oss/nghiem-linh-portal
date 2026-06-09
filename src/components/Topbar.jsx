import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Topbar({ activeTab, theme, toggleTheme }) {
    // Lấy dữ liệu phân quyền trực tiếp từ AuthContext
    const { currentRole, changeRole } = useAuth();

    // Trạng thái lưu trữ ngày tháng hiện tại
    const [currentDate, setCurrentDate] = useState('');

    // Lấy ngày tự động khi render
    useEffect(() => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        setCurrentDate(`${dd}/${mm}/${yyyy}`);
    }, []);

    // Map tiêu đề động dựa trên tab đang mở
    const pageTitles = {
        'my-class': { title: 'Lớp của tôi', subtitle: 'Thông tin chi tiết giảng dạy & điểm danh' },
        'crm': { title: 'Phễu Tuyển sinh & CRM', subtitle: 'Quản lý hành trình khách hàng từ lúc mới liên hệ' },
        'sales': { title: 'Quản lý Sale', subtitle: 'Bảng xếp hạng doanh số & Đội ngũ tư vấn' },
        'care': { title: 'Chăm sóc Học viên', subtitle: 'Theo dõi tình trạng và hỗ trợ học viên' },
        'teachers': { title: 'Thông tin Giáo viên', subtitle: 'Quản lý hồ sơ và trạng thái nhân sự' },
        'classes': { title: 'Quản lý Lớp học', subtitle: 'Danh sách các lớp học chính thức đang hoạt động' },
        'curriculum': { title: 'Chương trình học', subtitle: 'Danh sách các khóa học ngoại ngữ chính' },
        'finance': { title: 'Tài chính & Doanh thu', subtitle: 'Theo dõi học phí và hóa đơn dòng tiền' }
    };

    const currentHeader = pageTitles[activeTab] || { title: 'Hệ thống Quản trị', subtitle: 'Ngoại ngữ Nghiêm Linh' };

    return (
        <header className="topbar">
            {/* Khu vực text tiêu đề bên trái */}
            <div className="topbar-left-text">
                <h2>{currentHeader.title}</h2>
                <p>{currentHeader.subtitle}</p>
            </div>

            {/* Khu vực công cụ bên phải */}
            <div className="topbar-controls">

                {/* Bộ chọn giả lập Vai trò - Tách riêng 4 options theo yêu cầu */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '12px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>GIẢ LẬP:</span>
                    <select
                        className="role-selector"
                        value={currentRole}
                        onChange={(e) => changeRole(e.target.value)}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '50px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: '600', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', cursor: 'pointer' }}
                    >
                        <option value="admin">Quản trị viên (Admin)</option>
                        <option value="manager">Quản lý</option>
                        <option value="sales">Nhân viên Sales</option>
                        <option value="teacher">Giáo viên (Teacher Portal)</option>
                    </select>
                </div>

                {/* Nút chuyển đổi Theme */}
                <button className="circular-btn" onClick={toggleTheme} title="Chuyển chế độ Sáng/Tối">
                    <i className={theme === 'dark' ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
                </button>

                {/* Nút Thông báo */}
                <button className="circular-btn" title="Thông báo hệ thống">
                    <i className="fa-solid fa-bell"></i>
                    <span className="pink-badge">2</span>
                </button>

                {/* Hiển thị ngày hôm nay */}
                <div className="date-pill">
                    <span>📅 Hôm nay: <strong>{currentDate}</strong></span>
                </div>

            </div>
        </header>
    );
}

export default Topbar;