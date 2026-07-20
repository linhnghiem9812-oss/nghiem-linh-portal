import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import adminAvatarImg from "../../assets/admin_avatar.jpg";
import "../../styles/components/BottomNav.css";

function BottomNav({ activeTab, setActiveTab }) {
    const { currentUser, currentRole, logout } = useAuth();
    const isTeacher = currentRole === "teacher";

    // State quản lý việc mở Modal cho Sale/Admin
    const [activeModal, setActiveModal] = useState(null); // 'teaching' | 'management' | 'account' | null

    const handleNavClick = (tabId, modalType = null) => {
        if (modalType) {
            // Nếu bấm vào nút có Modal -> Bật/tắt modal đó
            setActiveModal(activeModal === modalType ? null : modalType);
        } else {
            // Nếu bấm chuyển trang trực tiếp -> Chuyển trang & đóng mọi modal
            setActiveTab(tabId);
            setActiveModal(null);
        }
    };

    const handleModalSelect = (tabId) => {
        setActiveTab(tabId);
        setActiveModal(null);
    };

    // =========================================================================
    // LOGIC KIỂM TRA MÀU ACTIVE SIÊU NHẠY (Sáng ngay khi bấm hoặc đang ở tab đó)
    // =========================================================================
    const isHomeActive = !activeModal && activeTab === (isTeacher ? "my-class" : "reports");

    // Nút Giảng dạy sáng khi: Đang mở Modal Giảng dạy HOẶC đang ở trang thuộc nhóm Giảng dạy
    const isTeachingActive = activeModal === "teaching" || (!activeModal && ["classes", "reports", "my-class"].includes(activeTab));

    // Nút Quản lý sáng khi: Đang mở Modal Quản lý HOẶC đang ở trang thuộc nhóm Quản lý
    const isManagementActive = activeModal === "management" || (!activeModal && ["crm", "sales", "care", "teachers", "tas", "finance", "payroll"].includes(activeTab));

    // Nút Tài khoản sáng khi: Đang mở Modal Tài khoản HOẶC đang ở trang Hồ sơ/Cài đặt app
    const isAccountActive = activeModal === "account" || (!activeModal && ["profile", "install-app"].includes(activeTab));

    return (
        <>
            {/* 1. KHUNG BOTTOM BAR CỐ ĐỊNH DƯỚI ĐÁY MÀN HÌNH */}
            <nav className="bottom-nav">
                {/* NÚT 1: HÔM NAY / TỔNG QUAN */}
                <button
                    className={`bottom-nav-item ${isHomeActive ? "active" : ""}`}
                    onClick={() => handleNavClick(isTeacher ? "my-class" : "reports")}
                >
                    <i className="fa-solid fa-house"></i>
                    <span>{isTeacher ? "Hôm nay" : "Tổng quan"}</span>
                </button>

                {/* NÚT 2: KHỐI GIẢNG DẠY */}
                {isTeacher ? (
                    <button
                        className={`bottom-nav-item ${!activeModal && activeTab === "reports" ? "active" : ""}`}
                        onClick={() => handleNavClick("reports")}
                    >
                        <i className="fa-solid fa-square-poll-vertical"></i>
                        <span>Báo cáo</span>
                    </button>
                ) : (
                    <button
                        className={`bottom-nav-item ${isTeachingActive ? "active" : ""}`}
                        onClick={() => handleNavClick(null, "teaching")}
                    >
                        <i className="fa-solid fa-school"></i>
                        <span>Giảng dạy <i className="fa-solid fa-caret-up text-xs ml-1"></i></span>
                    </button>
                )}

                {/* NÚT 3: KHỐI QUẢN LÝ / LƯƠNG */}
                {isTeacher ? (
                    <button
                        className={`bottom-nav-item ${!activeModal && activeTab === "payroll" ? "active" : ""}`}
                        onClick={() => handleNavClick("payroll")}
                    >
                        <i className="fa-solid fa-wallet"></i>
                        <span>Tiền lương</span>
                    </button>
                ) : (
                    <button
                        className={`bottom-nav-item ${isManagementActive ? "active" : ""}`}
                        onClick={() => handleNavClick(null, "management")}
                    >
                        <i className="fa-solid fa-briefcase"></i>
                        <span>Quản lý <i className="fa-solid fa-caret-up text-xs ml-1"></i></span>
                    </button>
                )}

                {/* NÚT 4: TÀI KHOẢN */}
                <button
                    className={`bottom-nav-item ${isAccountActive ? "active" : ""}`}
                    onClick={() => handleNavClick(null, "account")}
                >
                    <div className="bottom-nav-avatar">
                        <img src={adminAvatarImg} alt="Avatar" />
                    </div>
                    <span>Tài khoản</span>
                </button>
            </nav>

            {/* 2. LỚP PHỦ ĐEN OVERLAY KHI MỞ MODAL */}
            {activeModal && (
                <div className="bottom-modal-overlay" onClick={() => setActiveModal(null)} />
            )}

            {/* 3. MODAL POP-UP MENU (BOTTOM SHEET) */}
            {activeModal && (
                <div className="bottom-modal-sheet animate-slide-up">
                    <div className="bottom-modal-drag-handle" onClick={() => setActiveModal(null)} />

                    {/* MODAL: KHỐI GIẢNG DẠY */}
                    {activeModal === "teaching" && (
                        <div className="modal-content-group">
                            <h3 className="modal-title">📚 Khối Giảng Dạy</h3>
                            <div className="modal-grid">
                                <button onClick={() => handleModalSelect("classes")} className={`modal-grid-item ${activeTab === "classes" ? "active" : ""}`}>
                                    <i className="fa-solid fa-school"></i>
                                    <span>Quản lý Lớp học</span>
                                </button>
                                <button onClick={() => handleModalSelect("reports")} className={`modal-grid-item ${activeTab === "reports" ? "active" : ""}`}>
                                    <i className="fa-solid fa-square-poll-vertical"></i>
                                    <span>Báo cáo Lớp học</span>
                                </button>
                                <button onClick={() => handleModalSelect("my-class")} className={`modal-grid-item ${activeTab === "my-class" ? "active" : ""}`}>
                                    <i className="fa-solid fa-chalkboard-user"></i>
                                    <span>Lớp của tôi</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* MODAL: KHỐI QUẢN LÝ TRUNG TÂM */}
                    {activeModal === "management" && (
                        <div className="modal-content-group">
                            <h3 className="modal-title">🏢 Quản lý Trung Tâm</h3>
                            <div className="modal-grid">
                                <button onClick={() => handleModalSelect("crm")} className={`modal-grid-item ${activeTab === "crm" ? "active" : ""}`}>
                                    <i className="fa-solid fa-user-group"></i>
                                    <span>CRM & Khách hàng</span>
                                </button>
                                <button onClick={() => handleModalSelect("sales")} className={`modal-grid-item ${activeTab === "sales" ? "active" : ""}`}>
                                    <i className="fa-solid fa-chart-line"></i>
                                    <span>Quản lý Sale</span>
                                </button>
                                <button onClick={() => handleModalSelect("care")} className={`modal-grid-item ${activeTab === "care" ? "active" : ""}`}>
                                    <i className="fa-solid fa-heart-pulse"></i>
                                    <span>Chăm sóc Học viên</span>
                                </button>
                                <button onClick={() => handleModalSelect("teachers")} className={`modal-grid-item ${activeTab === "teachers" ? "active" : ""}`}>
                                    <i className="fa-solid fa-user-tie"></i>
                                    <span>Giáo viên</span>
                                </button>
                                <button onClick={() => handleModalSelect("tas")} className={`modal-grid-item ${activeTab === "tas" ? "active" : ""}`}>
                                    <i className="fa-solid fa-user-graduate"></i>
                                    <span>Trợ giảng</span>
                                </button>
                                <button onClick={() => handleModalSelect("finance")} className={`modal-grid-item ${activeTab === "finance" ? "active" : ""}`}>
                                    <i className="fa-solid fa-wallet"></i>
                                    <span>Tài chính</span>
                                </button>
                                <button onClick={() => handleModalSelect("payroll")} className={`modal-grid-item ${activeTab === "payroll" ? "active" : ""}`}>
                                    <i className="fa-solid fa-file-invoice-dollar"></i>
                                    <span>Quản lý Lương</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* MODAL: TÀI KHOẢN & ĐĂNG XUẤT */}
                    {activeModal === "account" && (
                        <div className="modal-content-group">
                            <div className="modal-user-header">
                                <img src={adminAvatarImg} alt="Avatar" className="modal-user-avatar" />
                                <div>
                                    <strong className="modal-user-name">{currentUser?.name || "Người dùng"}</strong>
                                    <span className="modal-user-role">
                                        {currentRole === "admin" && "Quản trị viên"}
                                        {currentRole === "manager" && "Quản lý"}
                                        {currentRole === "sales" && "Chuyên viên Sale"}
                                        {currentRole === "teacher" && "Giáo viên"}
                                    </span>
                                </div>
                            </div>

                            <div className="modal-list">
                                <button onClick={() => handleModalSelect("profile")} className="modal-list-item">
                                    <i className="fa-solid fa-pen-to-square"></i>
                                    <span>Chỉnh sửa Hồ sơ</span>
                                </button>
                                <button onClick={() => handleModalSelect("install-app")} className={`modal-list-item text-blue-600 font-bold ${activeTab === "install-app" ? "bg-blue-50" : ""}`}>
                                    <i className="fa-solid fa-mobile-screen-button"></i>
                                    <span>Cài đặt App điện thoại</span>
                                </button>
                                <button onClick={() => { setActiveModal(null); logout(); }} className="modal-list-item logout">
                                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                                    <span>Đăng xuất an toàn</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default BottomNav;