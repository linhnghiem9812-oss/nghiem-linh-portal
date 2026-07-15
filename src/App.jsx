import React, { useState, useEffect } from "react"; // Đảm bảo có useEffect

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { useAuth } from "./context/AuthContext";

import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import SalesRating from "./pages/SalesRating";
import StudentCare from "./pages/StudentCare";
import TeacherProfile from "./pages/TeacherProfile";
import Classes from "./pages/Classes";
import ClassReports from "./pages/ClassReports";
import FinanceLog from "./pages/FinanceLog";
import MyClassActive from "./pages/MyClassActive";
import TeachingAssistantProfile from "./pages/TeachingAssistantProfile";
import AccountProfile from "./pages/AccountProfile"; // Trang cấu hình tài khoản mới
import PayrollManagement from "./pages/PayrollManagement";
import "./styles/globals.css";

function App() {
  const { currentUser, currentRole } = useAuth();

  // viewMode: 'landing' (Trang chủ) | 'auth' (Đăng nhập/Đăng ký)
  const [viewMode, setViewMode] = useState("landing");
  const [isCollapsed, setIsCollapsed] = useState(false); // Thêm state thu gọn sidebar
  // 1. Lấy tab từ bộ nhớ, nếu mới đăng nhập (chưa có) thì để rỗng '' (Trang trắng)
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("current_tab");
    return savedTab || "";
  });

  // 2. Tự động lưu lại tên Tab mỗi khi bạn nhấp chuyển trang
  useEffect(() => {
    localStorage.setItem("current_tab", activeTab);
  }, [activeTab]);
  const [theme, setTheme] = useState("light");

  // XỬ LÝ ĐIỀU HƯỚNG KHI CHƯA ĐĂNG NHẬP
  if (!currentUser) {
    if (viewMode === "landing") {
      return <LandingPage onLoginClick={() => setViewMode("auth")} />;
    }
    return <Auth onBack={() => setViewMode("landing")} />;
  }

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  return (
    <div className={`app-container ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div
        className="main-layout-wrapper"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: isCollapsed ? "80px" : "260px",
          transition: "margin-left 0.25s ease"
        }}
      >
        <Topbar
          theme={theme}
          toggleTheme={toggleTheme}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isCollapsed}
        />

        <main
          className="main-content"
          style={{ marginTop: "80px", padding: "32px" }}
        >
          {activeTab === "classes" && <Classes />}
          {activeTab === "reports" && <ClassReports />}
          {activeTab === "my-class" && <MyClassActive />}
          {activeTab === "profile" && <AccountProfile />}{" "}
          {/* Tab Quản lý tài khoản */}
          {activeTab === "crm" && currentRole !== "teacher" && <CRM />}
          {activeTab === "sales" && currentRole !== "teacher" && (
            <SalesRating />
          )}
          {activeTab === "care" && currentRole !== "teacher" && <StudentCare />}
          {activeTab === "teachers" && currentRole !== "teacher" && (
            <TeacherProfile />
          )}
          {activeTab === "tas" && currentRole !== "teacher" && (
            <TeachingAssistantProfile />
          )}
          {activeTab === "finance" && currentRole !== "teacher" && (
            <FinanceLog />
          )}
          {activeTab === "payroll" && currentRole === "admin" && (
            <PayrollManagement />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
