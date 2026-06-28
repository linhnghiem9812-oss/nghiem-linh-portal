import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { NotificationProvider } from "./context/NotificationContext";

// Khởi tạo ứng dụng React tại thẻ div có id="root" trong file index.html
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Bọc AuthProvider ở ngoài cùng để xử lý Phân quyền (Role) */}
    <AuthProvider>
      {/* Bọc DataProvider để cung cấp dữ liệu (CRM, Lớp học, Giáo viên) toàn cục */}
      <DataProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </DataProvider>
    </AuthProvider>
  </React.StrictMode>,
);
