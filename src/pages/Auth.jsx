import "../styles/pages/Auth.css";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
function Auth() {
  const { addNotification } = useNotification();
  const { login, register, requestPasswordReset, confirmPasswordReset } =
    useAuth();

  // authMode có 4 trạng thái: 'login', 'register', 'forgot_request', 'forgot_verify'
  const [authMode, setAuthMode] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
    role: "teacher",
  });
  const [errorMsg, setErrorMsg] = useState("");

  // State đếm ngược 5 giây
  const [countdown, setCountdown] = useState(null);
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrorMsg("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. LUỒNG ĐĂNG NHẬP
    if (authMode === "login") {
      const res = await login(formData.username, formData.password);
      if (!res.success) setErrorMsg(res.message);
    }

    // 2. LUỒNG ĐĂNG KÝ
    else if (authMode === "register") {
      if (
        !formData.username ||
        !formData.password ||
        !formData.name ||
        !formData.confirmPassword
      ) {
        return setErrorMsg("Vui lòng hoàn thiện đầy đủ thông tin!");
      }
      if (formData.password !== formData.confirmPassword) {
        return setErrorMsg("Mật khẩu xác nhận không khớp!");
      }
      if (!formData.email) {
        return setErrorMsg("Vui lòng nhập Email!");
      }
      const res = await register(
        formData.name,
        formData.username,
        formData.password,
        formData.role,
      );
      if (res.success) {
        setCountdown(5);
      } else {
        setErrorMsg(res.message);
      }
    }

    // 3. LUỒNG QUÊN MẬT KHẨU (BƯỚC 1: Yêu cầu mã)
    else if (authMode === "forgot_request") {
      if (!formData.username)
        return setErrorMsg("Vui lòng nhập Email/Tên đăng nhập!");
      const res = await requestPasswordReset(formData.username);
      if (res.success) {
        addNotification(
          "Hệ thống đã gửi mã xác thực (OTP) đến Email của bạn. Vui lòng kiểm tra hộp thư!",
          "success",
          null,
        );
        setAuthMode("forgot_verify"); // Chuyển sang bước nhập mã
        setErrorMsg("");
      } else {
        setErrorMsg(res.message);
      }
    }

    // 4. LUỒNG QUÊN MẬT KHẨU (BƯỚC 2: Xác nhận và đổi mật khẩu)
    else if (authMode === "forgot_verify") {
      if (!formData.otp || !formData.password || !formData.confirmPassword) {
        return setErrorMsg("Vui lòng điền đủ Mã xác thực và Mật khẩu mới!");
      }
      if (formData.password !== formData.confirmPassword) {
        return setErrorMsg("Mật khẩu xác nhận không khớp!");
      }
      const res = await confirmPasswordReset(
        formData.username,
        formData.otp,
        formData.password,
      );
      if (res.success) {
        addNotification(
          "Khôi phục mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.",
          "success",
          null,
        );
        setAuthMode("login"); // Tự động đưa về trang đăng nhập
        setFormData({
          name: "",
          username: "",
          password: "",
          confirmPassword: "",
          otp: "",
          role: "teacher",
        });
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  // Hook xử lý đếm ngược thời gian chuyển trang
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setAuthMode("login");
      setCountdown(null);
      setFormData({
        name: "",
        username: "",
        password: "",
        confirmPassword: "",
        otp: "",
        role: "teacher",
      });
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);
  return (
    <div className="Auth-style-1">
      <div className="card Auth-style-2">
        <div className="Auth-style-3">
          <h2 className="Auth-style-4">Ngoại Ngữ Nghiêm Linh</h2>
          <p className="Auth-style-5">
            {authMode === "login"
              ? "Đăng nhập cổng quản trị & giảng dạy trung tâm"
              : authMode === "register"
                ? "Đăng ký tài khoản nhân sự / phân quyền mới"
                : "Khôi phục mật khẩu tài khoản nhân sự"}
          </p>
        </div>

        {countdown !== null ? (
          <div className="Auth-style-6">
            <div className="Auth-style-7">
              <i className="fa-solid fa-check"></i>
            </div>
            <h3 className="Auth-style-8">Đăng ký thành công!</h3>
            <p className="Auth-style-9">
              Tài khoản của bạn đã được khởi tạo trên hệ thống.
            </p>
            <p className="Auth-style-10">
              Tự động chuyển về trang Đăng nhập sau {countdown} giây...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="Auth-style-11">
            {errorMsg && <div className="Auth-style-12">{errorMsg}</div>}

            {authMode === "register" && (
              <>
                <div>
                  <label className="Auth-style-13">
                    CHỨC VỤ / VAI TRÒ HỆ THỐNG (*)
                  </label>
                  <select
                    name="role"
                    className="form-control Auth-style-14"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="teacher">Giáo viên (Teacher Portal)</option>
                    <option value="sales">Chuyên viên Tư vấn (Sales)</option>
                  </select>
                </div>
                <div>
                  <label className="Auth-style-15">HỌ VÀ TÊN (*)</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Ví dụ: Đoàn Đăng Khoa"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="Auth-style-16">EMAIL (*)</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            )}

            {/* HIỂN THỊ Ô TÊN ĐĂNG NHẬP / EMAIL TÙY TRẠNG THÁI */}
            {authMode !== "forgot_verify" && (
              <div>
                <label className="Auth-style-17">
                  {authMode === "forgot_request"
                    ? "EMAIL / TÊN ĐĂNG NHẬP (*)"
                    : "TÊN ĐĂNG NHẬP (*)"}
                </label>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  placeholder={
                    authMode === "forgot_request"
                      ? "Nhập Email để nhận mã OTP"
                      : "Nhập ID tài khoản nhân sự"
                  }
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            {/* BƯỚC 2 QUÊN MẬT KHẨU: HIỂN THỊ OTP VÀ MẬT KHẨU MỚI */}
            {authMode === "forgot_verify" && (
              <>
                <div>
                  <label className="Auth-style-18">
                    MÃ XÁC THỰC TỪ EMAIL (OTP) (*)
                  </label>
                  <input
                    type="text"
                    name="otp"
                    className="form-control"
                    placeholder="Ví dụ: 123456"
                    value={formData.otp}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="Auth-style-19">MẬT KHẨU MỚI (*)</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="Auth-style-20">
                    XÁC NHẬN MẬT KHẨU MỚI (*)
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            )}

            {/* TRẠNG THÁI LOGIN HOẶC REGISTER */}
            {(authMode === "login" || authMode === "register") && (
              <>
                <div>
                  <div className="Auth-style-21">
                    <label className="Auth-style-22">MẬT KHẨU (*)</label>
                    {authMode === "login" && (
                      <span
                        className="Auth-style-23"
                        onClick={() => {
                          setAuthMode("forgot_request");
                          setErrorMsg("");
                        }}
                      >
                        Quên mật khẩu?
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {authMode === "register" && (
                  <div>
                    <label className="Auth-style-24">
                      XÁC NHẬN MẬT KHẨU (*)
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}
              </>
            )}

            <button type="submit" className="btn btn-primary Auth-style-25">
              {authMode === "login"
                ? "XÁC NHẬN ĐĂNG NHẬP"
                : authMode === "register"
                  ? "HOÀN TẤT ĐĂNG KÝ"
                  : authMode === "forgot_request"
                    ? "GỬI MÃ XÁC THỰC"
                    : "XÁC NHẬN ĐỔI MẬT KHẨU"}
            </button>
          </form>
        )}

        {countdown === null && (
          <div className="Auth-style-26">
            {authMode === "login" ? (
              <span>
                Nhân sự mới?{" "}
                <strong
                  className="Auth-style-27"
                  onClick={() => {
                    setAuthMode("register");
                    setErrorMsg("");
                  }}
                >
                  Đăng ký tài khoản tại đây
                </strong>
              </span>
            ) : (
              <span>
                Quay lại cổng làm việc?{" "}
                <strong
                  className="Auth-style-28"
                  onClick={() => {
                    setAuthMode("login");
                    setErrorMsg("");
                  }}
                >
                  Đăng nhập
                </strong>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default Auth;
