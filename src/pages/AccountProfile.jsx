import "../styles/pages/AccountProfile.css";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

// Kéo file ảnh từ thư mục assets vào
import adminAvatarImg from "../assets/admin_avatar.jpg";
function AccountProfile() {
  const { currentUser, currentRole, updateProfile } = useAuth();
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    name: currentUser.name || "",
    phone: currentUser.phone || "",
    address: currentUser.address || "",
    role: currentUser.role || "teacher",
  });
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(formData);
    addNotification(
      "Cập nhật Hồ sơ",
      "Thông tin tài khoản cá nhân đã được lưu thành công!",
      "success",
      "profile",
      {
        "Tên hiển thị": formData.name,
        "Số điện thoại": formData.phone || "Chưa cập nhật",
        "Chức vụ":
          formData.role === "admin"
            ? "Quản trị viên"
            : formData.role === "sales"
              ? "Chuyên viên Sale"
              : "Giáo viên",
      },
    );
  };
  return (
    <div className="AccountProfile-style-1">
      <div className="card AccountProfile-style-2">
        <h3 className="AccountProfile-style-3">
          <i className="fa-solid fa-id-badge AccountProfile-style-4"></i> Quản
          lý Hồ sơ Cá nhân
        </h3>

        <div className="AccountProfile-style-5">
          {/* Cột Avatar - DÙNG ẢNH MẶC ĐỊNH CHUẨN */}
          <div className="AccountProfile-style-6">
            <div className="AccountProfile-style-7">
              <img
                src={adminAvatarImg}
                alt="Avatar"
                className="AccountProfile-style-8"
              />
            </div>
            <button type="button" className="btn AccountProfile-style-9">
              Thay đổi ảnh
            </button>
          </div>

          {/* Cột Form */}
          <form onSubmit={handleSave} className="AccountProfile-style-10">
            <div>
              <label className="AccountProfile-style-11">
                TÊN ĐĂNG NHẬP / ID (Không thể đổi)
              </label>
              <input
                type="text"
                className="form-control AccountProfile-style-12"
                value={currentUser.username}
                disabled
              />
            </div>
            <div>
              <label className="AccountProfile-style-13">
                HỌ VÀ TÊN HIỂN THỊ
              </label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="AccountProfile-style-14">SỐ ĐIỆN THOẠI</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại liên lạc"
              />
            </div>
            <div>
              <label className="AccountProfile-style-15">
                ĐỊA CHỈ THƯỜNG TRÚ
              </label>
              <input
                type="text"
                name="address"
                className="form-control"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Nhập địa chỉ của bạn"
              />
            </div>

            {/* --- RÚT GỌN 3 VAI TRÒ VÀ TỰ ĐỘNG ẨN VỚI NGƯỜI DÙNG THƯỜNG --- */}
            <div>
              <label className="AccountProfile-style-16">
                CHỨC VỤ HỆ THỐNG
              </label>
              <select
                name="role"
                className="form-control"
                value={formData.role}
                onChange={handleInputChange}
                disabled={currentRole !== "admin"}
                style={{
                  backgroundColor:
                    currentRole !== "admin" ? "#f1f5f9" : "white",
                }}
              >
                <option value="sales">Chuyên viên Sale</option>
                <option value="teacher">Giáo viên</option>

                {/* Ẩn hoàn toàn chữ "Quản trị viên" khỏi Dropdown nếu không phải là Admin */}
                {currentRole === "admin" && (
                  <option value="admin">Quản trị viên (Admin)</option>
                )}
              </select>

              {currentRole !== "admin" && (
                <span className="AccountProfile-style-17">
                  Chỉ Quản trị viên (Admin) mới có quyền thay đổi chức vụ.
                </span>
              )}
            </div>

            <div className="AccountProfile-style-18">
              <button
                type="submit"
                className="btn btn-primary AccountProfile-style-19"
              >
                LƯU THAY ĐỔI
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default AccountProfile;
