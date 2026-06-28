import React, { createContext, useContext, useState, useEffect } from "react";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("app_notifications");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("app_notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Thêm tham số "details" là một object chứa các thông tin chi tiết
  const addNotification = (
    title,
    message,
    type = "success",
    targetTab = null,
    details = null,
  ) => {
    const newNotif = {
      id: Date.now(),
      title,
      message,
      type,
      targetTab,
      details, // VD: { 'Trường sửa': 'SĐT', 'Cũ': '090', 'Mới': '091' }
      time: new Date().toLocaleString("vi-VN"),
      isRead: false,
    };

    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      return updated.slice(0, 50); // Lưu tối đa 50 thông báo gần nhất
    });
  };

  const markAsRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  const markAsUnread = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
    );
  const deleteNotif = (id) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  const clearAll = () => setNotifications([]);

  // --- CÁC HÀM XỬ LÝ HÀNG LOẠT (BATCH ACTIONS) ---
  const markMultipleAsRead = (ids) =>
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n)),
    );
  const markMultipleAsUnread = (ids) =>
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: false } : n)),
    );
  const deleteMultiple = (ids) =>
    setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAsUnread,
        deleteNotif,
        markAllAsRead,
        clearAll,
        markMultipleAsRead,
        markMultipleAsUnread,
        deleteMultiple,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
