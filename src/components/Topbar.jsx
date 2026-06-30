import "../styles/components/Topbar.css";
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

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

  // 1. REF ĐỂ LƯU DẤU VẾT THÔNG BÁO TỰ ĐỘNG BẬT POPUP
  const isInitialMount = useRef(true);
  const lastNotifIdRef = useRef(null);

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

  // 2. THUẬT TOÁN TỰ ĐỘNG BẬT POPUP KHI CÓ THÔNG BÁO MỚI
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const newestNotif = notifications[0];

      // Mở popup nếu không phải lần tải trang đầu và ID thông báo khác với lần trước
      if (!isInitialMount.current && newestNotif.id !== lastNotifIdRef.current) {
        setViewingNotif(newestNotif);
      }

      lastNotifIdRef.current = newestNotif.id;
    }
    isInitialMount.current = false;
  }, [notifications]);

  const handleNotificationClick = (notif) => {
    if (isSelectMode) {
      setSelectedIds((prev) =>
        prev.includes(notif.id)
          ? prev.filter((i) => i !== notif.id)
          : [...prev, notif.id],
      );
    } else {
      setViewingNotif(notif);
      setShowNotif(false);
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
    payroll: {
      title: 'Thanh toán Lương',
      subtitle: 'Quản lý chi phí và lập hóa đơn lương nhân sự'
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

        <div className="Topbar-style-38">
          <span>
            📅 Hôm nay:{" "}
            <strong className="Topbar-style-39">{currentDate}</strong>
          </span>
        </div>
      </div>

      {/* 3. MODAL CHI TIẾT TÓM TẮT THÔNG BÁO - ĐÃ KHẮC PHỤC LỆCH MÀN HÌNH VÀ THÊM CLICK OUTSIDE */}
      {/* 3. MODAL CHI TIẾT TÓM TẮT THÔNG BÁO - CHUẨN HÓA VỊ TRÍ VÀ KÍCH THƯỚC */}
      {viewingNotif && (
        <div
          className="Topbar-style-40"
          onClick={() => setViewingNotif(null)}
        >
          <div
            className="card Topbar-style-41"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="Topbar-style-42">
              <div className="Topbar-style-43">
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor:
                      viewingNotif.type === "error"
                        ? "#fee2e2"
                        : viewingNotif.type === "warning"
                          ? "#fef3c7"
                          : "#dcfce7",
                    color:
                      viewingNotif.type === "error"
                        ? "#ef4444"
                        : viewingNotif.type === "warning"
                          ? "#d97706"
                          : "#10b981",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "1.6rem",
                    flexShrink: 0
                  }}
                >
                  <i
                    className={`fa-solid ${viewingNotif.type === "error" ? "fa-trash" : viewingNotif.type === "warning" ? "fa-pen" : "fa-check"}`}
                  ></i>
                </div>
                <div>
                  <h3 className="Topbar-style-44" style={{ fontSize: '1.3rem' }}>{viewingNotif.title}</h3>
                  <span className="Topbar-style-45" style={{ fontSize: '0.85rem' }}>
                    <i className="fa-regular fa-clock"></i> {viewingNotif.time}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingNotif(null)}
                className="Topbar-style-46"
              >
                ✖
              </button>
            </div>

            <div className="Topbar-style-47" style={{ padding: '24px' }}>
              <p className="Topbar-style-48" style={{ fontSize: '1rem' }}>{viewingNotif.message}</p>

              {viewingNotif.details &&
                Object.keys(viewingNotif.details).length > 0 && (
                  <div className="Topbar-style-49" style={{ paddingTop: '20px' }}>
                    <span className="Topbar-style-50">Bản ghi chi tiết:</span>
                    <div className="Topbar-style-51" style={{ gap: '10px' }}>
                      {Object.entries(viewingNotif.details).map(
                        ([key, value]) => (
                          <div key={key} className="Topbar-style-52" style={{ padding: '12px 16px', alignItems: 'center' }}>
                            <strong className="Topbar-style-53" style={{ width: '150px' }}>{key}:</strong>
                            <span className="Topbar-style-54" style={{ fontWeight: '700' }}>{value}</span>
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
                  }}
                  className="btn Topbar-style-57"
                  style={{ fontSize: '0.9rem', padding: '10px 20px' }}
                >
                  {viewingNotif.isRead
                    ? "Đánh dấu chưa đọc"
                    : "Đánh dấu đã đọc"}
                </button>
                <button
                  onClick={() => {
                    deleteNotif(viewingNotif.id);
                    setViewingNotif(null);
                  }}
                  className="btn Topbar-style-58"
                  style={{ fontSize: '0.9rem', padding: '10px 20px' }}
                >
                  <i className="fa-solid fa-trash"></i> Xóa
                </button>
              </div>

              {viewingNotif.targetTab && (
                <button
                  onClick={() => handleNavigate(viewingNotif.targetTab)}
                  className="btn btn-primary Topbar-style-59"
                  style={{ fontSize: '0.95rem', padding: '10px 24px' }}
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