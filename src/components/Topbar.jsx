import "../styles/components/Topbar.css";
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

// Kéo file ảnh từ thư mục assets vào
import adminAvatarImg from "../assets/admin_avatar.jpg";
function Topbar({ activeTab, setActiveTab, theme, toggleTheme }) {
  const { currentUser, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState("");
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAsUnread,
    deleteNotif,
    markAllAsRead,
    markMultipleAsRead,
    markMultipleAsUnread,
    deleteMultiple,
  } = useNotification();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewingNotif, setViewingNotif] = useState(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  useEffect(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
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
      if (profileRef.current && !profileRef.current.contains(event.target))
        setShowProfile(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleNotificationClick = (notif) => {
    if (isSelectMode) {
      setSelectedIds((prev) =>
        prev.includes(notif.id)
          ? prev.filter((i) => i !== notif.id)
          : [...prev, notif.id],
      );
    } else {
      setViewingNotif(notif);
      setShowNotif(false); // Đóng menu thả xuống khi mở xem chi tiết
    }
  };
  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length) setSelectedIds([]);
    else setSelectedIds(notifications.map((n) => n.id));
  };
  const handleNavigate = (tab) => {
    if (tab) {
      setActiveTab(tab);
      setViewingNotif(null);
      setShowNotif(false);
    }
  };
  const pageTitles = {
    classes: {
      title: "Quản lý Lớp học",
      subtitle: "Danh sách các lớp học chính thức",
    },
    reports: {
      title: "Báo cáo Lớp học",
      subtitle: "Theo dõi sĩ số, giáo viên, tiến độ",
    },
    "my-class": {
      title: "Lớp của tôi",
      subtitle: "Thông tin chi tiết giảng dạy",
    },
    crm: {
      title: "Phễu Tuyển sinh & CRM",
      subtitle: "Quản lý hành trình khách hàng",
    },
    sales: {
      title: "Quản lý Sale",
      subtitle: "Bảng xếp hạng doanh số",
    },
    care: {
      title: "Chăm sóc Học viên",
      subtitle: "Xử lý khiếu nại, bảo lưu",
    },
    profile: {
      title: "Hồ sơ Cá nhân",
      subtitle: "Quản lý thông tin bảo mật và tài khoản hệ thống",
    },
  };
  const currentHeader = pageTitles[activeTab] || {
    title: "Hệ thống Quản lý",
    subtitle: "Chào mừng quay trở lại",
  };
  return (
    <header className="topbar Topbar-style-1">
      <div className="topbar-left-text">
        <h2>{currentHeader.title}</h2>
        <p>{currentHeader.subtitle}</p>
      </div>

      {/* CỤM ĐIỀU KHIỂN & NGÀY THÁNG ĐƯỢC XẾP LẠI THỨ TỰ */}
      <div className="topbar-controls Topbar-style-2">
        <button
          className="circular-btn"
          onClick={toggleTheme}
          title="Chuyển chế độ Sáng/Tối"
        >
          <i
            className={
              theme === "dark" ? "fa-solid fa-moon" : "fa-solid fa-sun"
            }
          ></i>
        </button>

        {/* --- KHU VỰC THÔNG BÁO (DROPDOWN MENU) --- */}
        <div className="Topbar-style-3" ref={notifRef}>
          <button
            className="circular-btn"
            onClick={() => setShowNotif(!showNotif)}
            title="Thông báo hệ thống"
          >
            <i className="fa-solid fa-bell"></i>
            {unreadCount > 0 && (
              <span className="pink-badge">{unreadCount}</span>
            )}
          </button>

          {showNotif && (
            <div className="Topbar-style-4">
              <div className="Topbar-style-5">
                <h4 className="Topbar-style-6">Thông báo</h4>
                <div className="Topbar-style-7">
                  {!isSelectMode ? (
                    <>
                      <button
                        onClick={markAllAsRead}
                        className="Topbar-style-8"
                      >
                        <i className="fa-solid fa-check-double"></i> Đọc hết
                      </button>
                      <button
                        onClick={() => setIsSelectMode(true)}
                        className="Topbar-style-9"
                      >
                        <i className="fa-solid fa-list-check"></i> Chọn
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsSelectMode(false);
                        setSelectedIds([]);
                      }}
                      className="Topbar-style-10"
                    >
                      Hủy chọn
                    </button>
                  )}
                </div>
              </div>

              {isSelectMode && notifications.length > 0 && (
                <div className="Topbar-style-11">
                  <label className="Topbar-style-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === notifications.length}
                      onChange={handleSelectAll}
                    />{" "}
                    Chọn tất cả
                  </label>
                </div>
              )}

              <div className="Topbar-style-13">
                {notifications.length === 0 ? (
                  <div className="Topbar-style-14">Không có thông báo nào.</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        padding: "14px 16px",
                        borderBottom: "1px solid var(--border-color)",
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                        backgroundColor: n.isRead
                          ? "transparent"
                          : "var(--primary-light)",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseOver={(e) => {
                        if (n.isRead && !isSelectMode)
                          e.currentTarget.style.backgroundColor =
                            "var(--bg-app)";
                      }}
                      onMouseOut={(e) => {
                        if (n.isRead && !isSelectMode)
                          e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      {isSelectMode && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(n.id)}
                          readOnly
                          className="Topbar-style-15"
                        />
                      )}

                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          backgroundColor:
                            n.type === "error"
                              ? "#fee2e2"
                              : n.type === "warning"
                                ? "#fef3c7"
                                : "var(--success-light)",
                          color:
                            n.type === "error"
                              ? "#ef4444"
                              : n.type === "warning"
                                ? "#d97706"
                                : "var(--success)",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          flexShrink: 0,
                          fontSize: "1rem",
                        }}
                      >
                        <i
                          className={`fa-solid ${n.type === "error" ? "fa-trash" : n.type === "warning" ? "fa-pen" : "fa-check"}`}
                        ></i>
                      </div>
                      <div className="Topbar-style-16">
                        <strong
                          style={{
                            fontSize: "0.85rem",
                            color: n.isRead
                              ? "var(--text-muted)"
                              : "var(--text-main)",
                            display: "block",
                            marginBottom: "2px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {n.title}
                        </strong>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.8rem",
                            color: n.isRead ? "#94a3b8" : "var(--text-muted)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {n.message}
                        </p>
                        <span className="Topbar-style-17">{n.time}</span>
                      </div>
                      {!isSelectMode && (
                        <i className="fa-solid fa-chevron-right Topbar-style-18"></i>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* TOOLBAR XỬ LÝ HÀNG LOẠT */}
              {isSelectMode && selectedIds.length > 0 && (
                <div className="Topbar-style-19">
                  <div className="Topbar-style-20">
                    <button
                      onClick={() => {
                        markMultipleAsRead(selectedIds);
                        setSelectedIds([]);
                        setIsSelectMode(false);
                      }}
                      className="btn Topbar-style-21"
                    >
                      Đã đọc
                    </button>
                    <button
                      onClick={() => {
                        markMultipleAsUnread(selectedIds);
                        setSelectedIds([]);
                        setIsSelectMode(false);
                      }}
                      className="btn Topbar-style-22"
                    >
                      Chưa đọc
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      deleteMultiple(selectedIds);
                      setSelectedIds([]);
                      setIsSelectMode(false);
                    }}
                    className="btn Topbar-style-23"
                  >
                    <i className="fa-solid fa-trash"></i> Xóa
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* USER PROFILE DROPDOWN */}
        <div className="Topbar-style-24" ref={profileRef}>
          <button
            className="circular-btn Topbar-style-25"
            onClick={() => setShowProfile(!showProfile)}
          >
            <img
              src={adminAvatarImg}
              alt="Avatar"
              className="Topbar-style-26"
            />
          </button>
          {showProfile && (
            <div className="Topbar-style-27">
              <div className="Topbar-style-28">
                <div className="Topbar-style-29">
                  <img
                    src={adminAvatarImg}
                    alt="Avatar"
                    className="Topbar-style-30"
                  />
                </div>
                <div className="Topbar-style-31">
                  <strong className="Topbar-style-32">
                    {currentUser?.name || "Người dùng"}
                  </strong>
                  <span className="Topbar-style-33">
                    {currentUser?.role || "Guest"}
                  </span>
                </div>
              </div>
              <div className="Topbar-style-34">
                <button
                  onClick={() => {
                    setActiveTab("profile");
                    setShowProfile(false);
                  }}
                  className="Topbar-style-35"
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--bg-app)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <i className="fa-solid fa-pen-to-square Topbar-style-36"></i>{" "}
                  Chỉnh sửa Hồ sơ
                </button>
                <button
                  onClick={logout}
                  className="Topbar-style-37"
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#fee2e2")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <i className="fa-solid fa-arrow-right-from-bracket"></i> Đăng
                  xuất an toàn
                </button>
              </div>
            </div>
          )}
        </div>

        {/* DATE PILL ĐẶT RA NGOÀI CÙNG BÊN PHẢI */}
        <div className="Topbar-style-38">
          <span>
            📅 Hôm nay:{" "}
            <strong className="Topbar-style-39">{currentDate}</strong>
          </span>
        </div>
      </div>

      {/* --- MODAL CHI TIẾT TÓM TẮT THÔNG BÁO (PHỦ ĐEN 100% MÀN HÌNH) --- */}
      {viewingNotif && (
        <div className="Topbar-style-40">
          <div className="card Topbar-style-41">
            <div className="Topbar-style-42">
              <div className="Topbar-style-43">
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor:
                      viewingNotif.type === "error"
                        ? "#fee2e2"
                        : viewingNotif.type === "warning"
                          ? "#fef3c7"
                          : "var(--success-light)",
                    color:
                      viewingNotif.type === "error"
                        ? "#ef4444"
                        : viewingNotif.type === "warning"
                          ? "#d97706"
                          : "var(--success)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "1.4rem",
                  }}
                >
                  <i
                    className={`fa-solid ${viewingNotif.type === "error" ? "fa-trash" : viewingNotif.type === "warning" ? "fa-pen" : "fa-check"}`}
                  ></i>
                </div>
                <div>
                  <h3 className="Topbar-style-44">{viewingNotif.title}</h3>
                  <span className="Topbar-style-45">
                    <i className="fa-regular fa-clock"></i> {viewingNotif.time}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setViewingNotif(null);
                  setShowNotif(true);
                }}
                className="Topbar-style-46"
              >
                ✖
              </button>
            </div>

            <div className="Topbar-style-47">
              <p className="Topbar-style-48">{viewingNotif.message}</p>

              {/* BẢNG TÓM TẮT CHI TIẾT SỰ THAY ĐỔI */}
              {viewingNotif.details &&
                Object.keys(viewingNotif.details).length > 0 && (
                  <div className="Topbar-style-49">
                    <span className="Topbar-style-50">Bản ghi chi tiết:</span>
                    <div className="Topbar-style-51">
                      {Object.entries(viewingNotif.details).map(
                        ([key, value]) => (
                          <div key={key} className="Topbar-style-52">
                            <strong className="Topbar-style-53">{key}:</strong>
                            <span className="Topbar-style-54">{value}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>

            <div className="Topbar-style-55">
              <div className="Topbar-style-56">
                <button
                  onClick={() => {
                    viewingNotif.isRead
                      ? markAsUnread(viewingNotif.id)
                      : markAsRead(viewingNotif.id);
                    setViewingNotif(null);
                    setShowNotif(true);
                  }}
                  className="btn Topbar-style-57"
                >
                  {viewingNotif.isRead
                    ? "Đánh dấu chưa đọc"
                    : "Đánh dấu đã đọc"}
                </button>
                <button
                  onClick={() => {
                    deleteNotif(viewingNotif.id);
                    setViewingNotif(null);
                    setShowNotif(true);
                  }}
                  className="btn Topbar-style-58"
                >
                  <i className="fa-solid fa-trash"></i> Xóa
                </button>
              </div>

              {viewingNotif.targetTab && (
                <button
                  onClick={() => handleNavigate(viewingNotif.targetTab)}
                  className="btn btn-primary Topbar-style-59"
                >
                  Đến trang liên quan{" "}
                  <i className="fa-solid fa-arrow-right Topbar-style-60"></i>
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
