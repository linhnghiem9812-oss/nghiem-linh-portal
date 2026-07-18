import "../styles/pages/LandingPage.css";
import React from "react";

function LandingPage({ onLoginClick }) {
  return (
    <div className="LandingPage-style-1">
      {/* Thanh điều hướng trang chủ */}
      <header className="LandingPage-style-2">
        <div className="LandingPage-style-3">
          <div className="hanai-robot-avatar LandingPage-style-4">
            <div className="robot-head LandingPage-style-5">
              <div className="robot-eye LandingPage-style-6"></div>
              <div className="robot-eye LandingPage-style-7"></div>
            </div>
          </div>
          <h1 className="LandingPage-style-8">Ngoại Ngữ Nghiêm Linh</h1>
        </div>
        <button
          onClick={onLoginClick}
          className="LandingPage-style-9"
        >
          Truy cập hệ thống
        </button>
      </header>

      {/* Nội dung chính (Hero Section) */}
      <main className="LandingPage-style-10">
        <h2 className="LandingPage-style-11">
          Hệ thống Quản trị & Giảng dạy <br />
          <span className="LandingPage-style-12">
            Trung tâm Ngoại Ngữ Nghiêm Linh
          </span>
        </h2>
        <p className="LandingPage-style-13">
          Nền tảng quản lý toàn diện giúp trung tâm vận hành trơn tru từ khâu
          tuyển sinh, tài chính đến theo dõi tiến độ giảng dạy của từng lớp học.
        </p>
        <button
          onClick={onLoginClick}
          className="LandingPage-style-14"
        >
          Đăng nhập / Đăng ký ngay
        </button>
      </main>
    </div>
  );
}

export default LandingPage;
