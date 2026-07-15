import "../styles/components/Sidebar.css";
import React from "react";
import { useAuth } from "../context/AuthContext";

// Kéo file ảnh từ thư mục assets vào
import adminAvatarImg from "../assets/admin_avatar.jpg";
function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) {
  const { currentUser, currentRole, logout } = useAuth();
  const isTeacher = currentRole === "teacher";

  // HÀM XỬ LÝ: Tách dòng tự động nếu tên tài khoản là "Ngoại ngữ Nghiêm Linh"
  const renderUserName = () => {
    if (!currentUser?.name) {
      return (
        <>
          <span className="Sidebar-style-1">Ngoại ngữ</span>
          <span className="Sidebar-style-2">Nghiêm Linh</span>
        </>
      );
    }

    // Bắt chính xác tên mặc định để ép xuống 2 dòng cân đối
    if (
      currentUser.name === "Ngoại ngữ Nghiêm Linh" ||
      currentUser.name === "Ngoại Ngữ Nghiêm Linh"
    ) {
      return (
        <>
          <span className="Sidebar-style-3">Ngoại Ngữ</span>
          <span className="Sidebar-style-4">Nghiêm Linh</span>
        </>
      );
    }

    // Với các nhân viên/giáo viên khác thì hiển thị tên bình thường
    return currentUser.name;
  };
  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-brand-container Sidebar-style-5">
        <div className="hanai-robot-avatar Sidebar-style-6">
          <img
            src={adminAvatarImg}
            alt="Logo / User Avatar"
            className="Sidebar-style-7"
          />
        </div>

        {/* GỌI HÀM HIỂN THỊ TÊN ĐÃ ĐƯỢC CHIA DÒNG */}
        {!isCollapsed && (
          <>
            <div className="robot-brand-text Sidebar-style-8">
              {renderUserName()}
            </div>

            <div className="user-title-badge Sidebar-style-9">
              {currentRole === "admin" && "Quản trị viên"}
              {currentRole === "manager" && "Quản lý"}
              {currentRole === "sales" && "Chuyên viên Sale"}
              {currentRole === "teacher" && "Giáo viên"}
            </div>
          </>
        )}
      </div>

      <nav className="sidebar-menu">
        {isCollapsed ? <div className="menu-divider" /> : <div className="menu-label">Giảng dạy</div>}

        {currentRole !== "teacher" && (
          <div
            className={`menu-item ${activeTab === "classes" ? "active" : ""}`}
            onClick={() => setActiveTab("classes")}
            title={isCollapsed ? "Quản lý Lớp học" : ""}
          >
            <i className="fa-solid fa-school"></i>
            <span>Quản lý Lớp học</span>
          </div>
        )}

        <div
          className={`menu-item ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
          title={isCollapsed ? "Báo cáo Lớp học" : ""}
        >
          <i className="fa-solid fa-square-poll-vertical"></i>
          <span>Báo cáo Lớp học</span>
        </div>
        <div
          className={`menu-item ${activeTab === "my-class" ? "active" : ""}`}
          onClick={() => setActiveTab("my-class")}
          title={isCollapsed ? "Lớp của tôi" : ""}
        >
          <i className="fa-solid fa-chalkboard-user"></i>
          <span>Lớp của tôi</span>
        </div>

        {!isTeacher && (
          <>
            {isCollapsed ? <div className="menu-divider" /> : <div className="menu-label">Quản lý trung tâm</div>}

            <div
              className={`menu-item ${activeTab === "crm" ? "active" : ""}`}
              onClick={() => setActiveTab("crm")}
              title={isCollapsed ? "CRM & Khách hàng" : ""}
            >
              <i className="fa-solid fa-user-group"></i>
              <span>CRM & Khách hàng</span>
            </div>
            <div
              className={`menu-item ${activeTab === "sales" ? "active" : ""}`}
              onClick={() => setActiveTab("sales")}
              title={isCollapsed ? "Quản lý Sale" : ""}
            >
              <i className="fa-solid fa-chart-line"></i>
              <span>Quản lý Sale</span>
            </div>
            <div
              className={`menu-item ${activeTab === "care" ? "active" : ""}`}
              onClick={() => setActiveTab("care")}
              title={isCollapsed ? "Chăm sóc Học viên" : ""}
            >
              <i className="fa-solid fa-heart-pulse"></i>
              <span>Chăm sóc Học viên</span>
            </div>
            <div
              className={`menu-item ${activeTab === "teachers" ? "active" : ""}`}
              onClick={() => setActiveTab("teachers")}
              title={isCollapsed ? "Thông tin Giáo viên" : ""}
            >
              <i className="fa-solid fa-user-tie"></i>
              <span>Thông tin Giáo viên</span>
            </div>

            <div
              className={`menu-item ${activeTab === "tas" ? "active" : ""}`}
              onClick={() => setActiveTab("tas")}
              title={isCollapsed ? "Thông tin Trợ giảng" : ""}
            >
              <i className="fa-solid fa-user-graduate"></i>
              <span>Thông tin Trợ giảng</span>
            </div>

            <div
              className={`menu-item ${activeTab === "finance" ? "active" : ""}`}
              onClick={() => setActiveTab("finance")}
              title={isCollapsed ? "Tài chính & Doanh thu" : ""}
            >
              <i className="fa-solid fa-wallet"></i>
              <span>Tài chính & Doanh thu</span>
            </div>

            <div
              className={`menu-item ${activeTab === "payroll" ? "active" : ""}`}
              onClick={() => setActiveTab("payroll")}
              title={isCollapsed ? "Quản lý Lương" : ""}
            >
              <i className="fa-solid fa-file-invoice-dollar"></i>
              <span>Quản lý Lương</span>
            </div>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-logout" onClick={logout}>
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
          {!isCollapsed && <span>Đăng xuất</span>}
        </div>
        <div className="sidebar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
          <i className={`fa-solid ${isCollapsed ? "fa-angles-right" : "fa-angles-left"}`}></i>
        </div>
      </div>
    </aside>
  );
}
export default Sidebar;
