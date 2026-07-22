import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // API kết nối đến Backend xác thực
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api",
  });

  // Chỉ lưu phiên người dùng hiện tại, KHÔNG lưu danh sách user ảo nữa
  const [currentUser, setCurrentUser] = useState(() => {
    const savedSession = localStorage.getItem("nl_real_session");
    return savedSession ? JSON.parse(savedSession) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("nl_real_session", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("nl_real_session");
    }
  }, [currentUser]);

  const currentRole = currentUser?.role || null;

  // Gọi API Đăng nhập thật
  const login = async (username, password) => {
    try {
      const response = await api.post("/auth/login", { username, password });
      localStorage.removeItem("current_tab"); // Reset tab khi đăng nhập tài khoản mới
      setCurrentUser(response.data); // Backend trả về thông tin User
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Sai tài khoản hoặc mật khẩu!",
      };
    }
  };

  // Gọi API Đăng ký thật
  const register = async (name, username, password, role, email) => {
    try {
      await api.post("/auth/register", {
        name,
        username,
        password,
        role,
        email,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Tên đăng nhập đã tồn tại!",
      };
    }
  };

  // BƯỚC 1: Gọi API Yêu cầu gửi mã xác thực (OTP)
  const requestPasswordReset = async (email) => {
    try {
      const response = await api.post("/auth/forgot-password/request", {
        email,
      });
      return {
        success: true,
        message: response.data?.message || "Mã xác thực đã được gửi!",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Không tìm thấy email/tài khoản trong hệ thống!",
      };
    }
  };

  // BƯỚC 2: Gọi API Xác nhận mã OTP và Đặt mật khẩu mới
  const confirmPasswordReset = async (email, otp, newPassword) => {
    try {
      const response = await api.post("/auth/forgot-password/reset", {
        email,
        otp,
        newPassword,
      });
      return {
        success: true,
        message: response.data?.message || "Đặt lại mật khẩu thành công!",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Mã xác thực không đúng hoặc đã hết hạn!",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("current_tab");
    setCurrentUser(null);
  };

  const updateProfile = async (updatedData) => {
    try {
      const response = await api.put(
        `/auth/update/${currentUser.id}`,
        updatedData,
      );
      setCurrentUser(response.data);
      return { success: true };
    } catch (error) {
      return { success: false, message: "Lỗi cập nhật hồ sơ!" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        login,
        register,
        logout,
        updateProfile,
        requestPasswordReset,
        confirmPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
