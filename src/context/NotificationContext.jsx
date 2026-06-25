import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('app_notifications');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('app_notifications', JSON.stringify(notifications));
    }, [notifications]);

    // Bổ sung tham số targetTab (Trang đích cần nhảy tới khi click)
    const addNotification = (message, type = 'success', targetTab = null) => {
        const newNotif = {
            id: Date.now(),
            title: 'Hệ thống Nghiêm Linh',
            message,
            type,
            targetTab, // Lưu lại đích đến
            time: new Date().toLocaleString('vi-VN'),
            isRead: false
        };

        setNotifications(prev => {
            const updated = [newNotif, ...prev];
            return updated.slice(0, 30); // Giữ tối đa 30 thông báo
        });

        // VẪN GIỮ LẠI HỘP THOẠI POPUP HIỆN LÊN GIỮA MÀN HÌNH
        alert(`Hệ thống: ${message}`);
    };

    const toggleReadStatus = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const clearAll = () => setNotifications([]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, toggleReadStatus, markAllAsRead, clearAll, unreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
};