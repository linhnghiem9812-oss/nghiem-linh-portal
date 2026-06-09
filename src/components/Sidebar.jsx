import React from 'react';

function Sidebar({ activeTab, setActiveTab, currentRole }) {
    // Kiểm tra xem người dùng hiện tại có phải là giáo viên hay không
    const isTeacher = currentRole === 'teacher';

    return (
        <aside className="sidebar">
            <div className="sidebar-brand-container">
                <div className="hanai-robot-avatar">
                    <div className="robot-head">
                        <div className="robot-ear-l"></div>
                        <div className="robot-eye"></div>
                        <div className="robot-eye"></div>
                        <div className="robot-ear-r"></div>
                    </div>
                </div>
                <div className="robot-brand-text">Ngoại ngữ<br />Nghiêm Linh</div>
                <div className="user-title-badge">
                    {currentRole === 'admin' && 'Quản trị viên'}
                    {currentRole === 'manager' && 'Quản lý'}
                    {currentRole === 'sales' && 'Chuyên viên Sale'}
                    {currentRole === 'teacher' && 'Giáo viên'}
                </div>
            </div>

            <nav className="sidebar-menu">
                {/* Nhóm chức năng Giảng dạy công khai cho tất cả các vai trò */}
                <div className="menu-label">Giảng dạy</div>
                <div
                    className={`menu-item ${activeTab === 'my-class' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my-class')}
                >
                    <i className="fa-solid fa-chalkboard-user"></i>
                    <span>Lớp của tôi</span>
                </div>

                {/* Ẩn hoặc hiển thị các mục quản trị dựa trên vai trò */}
                {!isTeacher && (
                    <>
                        <div className="menu-label">Quản lý trung tâm</div>
                        <div
                            className={`menu-item ${activeTab === 'crm' ? 'active' : ''}`}
                            onClick={() => setActiveTab('crm')}
                        >
                            <i className="fa-solid fa-user-group"></i>
                            <span>CRM & Khách hàng</span>
                        </div>
                        <div
                            className={`menu-item ${activeTab === 'sales' ? 'active' : ''}`}
                            onClick={() => setActiveTab('sales')}
                        >
                            <i className="fa-solid fa-chart-line"></i>
                            <span>Quản lý Sale</span>
                        </div>
                        <div
                            className={`menu-item ${activeTab === 'care' ? 'active' : ''}`}
                            onClick={() => setActiveTab('care')}
                        >
                            <i className="fa-solid fa-heart-pulse"></i>
                            <span>Chăm sóc Học viên</span>
                        </div>
                        <div
                            className={`menu-item ${activeTab === 'teachers' ? 'active' : ''}`}
                            onClick={() => setActiveTab('teachers')}
                        >
                            <i className="fa-solid fa-user-tie"></i>
                            <span>Thông tin Giáo viên</span>
                        </div>
                        <div
                            className={`menu-item ${activeTab === 'classes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('classes')}
                        >
                            <i className="fa-solid fa-school"></i>
                            <span>Quản lý Lớp học</span>
                        </div>
                        <div
                            className={`menu-item ${activeTab === 'curriculum' ? 'active' : ''}`}
                            onClick={() => setActiveTab('curriculum')}
                        >
                            <i className="fa-solid fa-book-open"></i>
                            <span>Chương trình học</span>
                        </div>
                        <div
                            className={`menu-item ${activeTab === 'finance' ? 'active' : ''}`}
                            onClick={() => setActiveTab('finance')}
                        >
                            <i className="fa-solid fa-wallet"></i>
                            <span>Tài chính & Doanh thu</span>
                        </div>
                    </>
                )}
            </nav>

            <div className="sidebar-logout" onClick={() => alert('Hệ thống: Đăng xuất thành công!')}>
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                <span>Đăng xuất</span>
            </div>
        </aside>
    );
}

export default Sidebar;