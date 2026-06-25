import React from 'react';
import { useAuth } from '../context/AuthContext';

// Kéo file ảnh từ thư mục assets vào
import adminAvatarImg from '../assets/admin_avatar.jpg';

function Sidebar({ activeTab, setActiveTab }) {
    const { currentUser, currentRole, logout } = useAuth();
    const isTeacher = currentRole === 'teacher';

    // HÀM XỬ LÝ: Tách dòng tự động nếu tên tài khoản là "Ngoại ngữ Nghiêm Linh"
    const renderUserName = () => {
        if (!currentUser?.name) {
            return (
                <>
                    <span style={{ display: 'block' }}>Ngoại ngữ</span>
                    <span style={{ display: 'block', color: 'var(--primary)' }}>Nghiêm Linh</span>
                </>
            );
        }

        // Bắt chính xác tên mặc định để ép xuống 2 dòng cân đối
        if (currentUser.name === 'Ngoại ngữ Nghiêm Linh' || currentUser.name === 'Ngoại Ngữ Nghiêm Linh') {
            return (
                <>
                    <span style={{ display: 'block' }}>Ngoại Ngữ</span>
                    <span style={{ display: 'block' }}>Nghiêm Linh</span>
                </>
            );
        }

        // Với các nhân viên/giáo viên khác thì hiển thị tên bình thường
        return currentUser.name;
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-brand-container" style={{ paddingBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                <div className="hanai-robot-avatar" style={{
                    border: '3px solid var(--primary)',
                    backgroundColor: 'var(--primary-light)',
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%'
                }}>
                    <img
                        src={adminAvatarImg}
                        alt="Logo / User Avatar"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>

                {/* GỌI HÀM HIỂN THỊ TÊN ĐÃ ĐƯỢC CHIA DÒNG */}
                <div className="robot-brand-text" style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '12px', padding: '0 8px', textAlign: 'center', lineHeight: '1.4' }}>
                    {renderUserName()}
                </div>

                <div className="user-title-badge" style={{ marginTop: '8px' }}>
                    {currentRole === 'admin' && 'Quản trị viên'}
                    {currentRole === 'manager' && 'Quản lý'}
                    {currentRole === 'sales' && 'Chuyên viên Sale'}
                    {currentRole === 'teacher' && 'Giáo viên'}
                </div>
            </div>

            <nav className="sidebar-menu">
                <div className="menu-label">Giảng dạy</div>

                {currentRole !== 'teacher' && (
                    <div className={`menu-item ${activeTab === 'classes' ? 'active' : ''}`} onClick={() => setActiveTab('classes')}>
                        <i className="fa-solid fa-school"></i><span>Quản lý Lớp học</span>
                    </div>
                )}

                <div className={`menu-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                    <i className="fa-solid fa-square-poll-vertical"></i><span>Báo cáo Lớp học</span>
                </div>
                <div className={`menu-item ${activeTab === 'my-class' ? 'active' : ''}`} onClick={() => setActiveTab('my-class')}>
                    <i className="fa-solid fa-chalkboard-user"></i><span>Lớp của tôi</span>
                </div>

                {!isTeacher && (
                    <>
                        <div className="menu-label">Quản lý trung tâm</div>

                        <div className={`menu-item ${activeTab === 'crm' ? 'active' : ''}`} onClick={() => setActiveTab('crm')}>
                            <i className="fa-solid fa-user-group"></i><span>CRM & Khách hàng</span>
                        </div>
                        <div className={`menu-item ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => setActiveTab('sales')}>
                            <i className="fa-solid fa-chart-line"></i><span>Quản lý Sale</span>
                        </div>
                        <div className={`menu-item ${activeTab === 'care' ? 'active' : ''}`} onClick={() => setActiveTab('care')}>
                            <i className="fa-solid fa-heart-pulse"></i><span>Chăm sóc Học viên</span>
                        </div>
                        <div className={`menu-item ${activeTab === 'teachers' ? 'active' : ''}`} onClick={() => setActiveTab('teachers')}>
                            <i className="fa-solid fa-user-tie"></i><span>Thông tin Giáo viên</span>
                        </div>

                        <div className={`menu-item ${activeTab === 'tas' ? 'active' : ''}`} onClick={() => setActiveTab('tas')}>
                            <i className="fa-solid fa-user-graduate"></i><span>Thông tin Trợ giảng</span>
                        </div>

                        <div className={`menu-item ${activeTab === 'finance' ? 'active' : ''}`} onClick={() => setActiveTab('finance')}>
                            <i className="fa-solid fa-wallet"></i><span>Tài chính & Doanh thu</span>
                        </div>
                    </>
                )}
            </nav>

            <div className="sidebar-logout" onClick={logout}>
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                <span>Đăng xuất</span>
            </div>
        </aside>
    );
}

export default Sidebar;