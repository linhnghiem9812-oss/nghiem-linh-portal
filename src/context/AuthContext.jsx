import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // API kết nối đến Backend xác thực
    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
    });

    // Chỉ lưu phiên người dùng hiện tại, KHÔNG lưu danh sách user ảo nữa
    const [currentUser, setCurrentUser] = useState(() => {
        const savedSession = localStorage.getItem('nl_real_session');
        return savedSession ? JSON.parse(savedSession) : null;
    });

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('nl_real_session', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('nl_real_session');
        }
    }, [currentUser]);

    const currentRole = currentUser?.role || null;

    // Gọi API Đăng nhập thật
    const login = async (username, password) => {
        try {
            const response = await authApi.post('/login', { username, password });
            setCurrentUser(response.data); // Backend trả về thông tin User
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Sai tài khoản hoặc mật khẩu!' };
        }
    };

    // Gọi API Đăng ký thật
    const register = async (name, username, password, role) => {
        try {
            await authApi.post('/register', { name, username, password, role });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Tên đăng nhập đã tồn tại!' };
        }
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const updateProfile = async (updatedData) => {
        try {
            const response = await authApi.put(`/update/${currentUser.id}`, updatedData);
            setCurrentUser(response.data);
            return { success: true };
        } catch (error) {
            return { success: false, message: 'Lỗi cập nhật hồ sơ!' };
        }
    };

    return (
        <AuthContext.Provider value={{ currentUser, currentRole, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);