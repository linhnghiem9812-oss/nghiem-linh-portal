import React from 'react';

function LandingPage({ onLoginClick }) {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', fontFamily: 'var(--font-body)' }}>
            {/* Thanh điều hướng trang chủ */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="hanai-robot-avatar" style={{ width: '40px', height: '40px', margin: 0 }}>
                        <div className="robot-head" style={{ width: '20px', height: '16px', borderRadius: '4px' }}>
                            <div className="robot-eye" style={{ width: '4px', height: '4px' }}></div>
                            <div className="robot-eye" style={{ width: '4px', height: '4px' }}></div>
                        </div>
                    </div>
                    <h1 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>Ngoại Ngữ Nghiêm Linh</h1>
                </div>
                <button
                    onClick={onLoginClick}
                    className="btn btn-primary"
                    style={{ padding: '10px 24px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50px', fontWeight: '700', cursor: 'pointer' }}
                >
                    Truy cập hệ thống
                </button>
            </header>

            {/* Nội dung chính (Hero Section) */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: '800', color: '#1e293b', marginBottom: '16px', maxWidth: '800px', lineHeight: '1.2' }}>
                    Hệ thống Quản trị & Giảng dạy <br /><span style={{ color: 'var(--primary)' }}>Trung tâm Ngoại Ngữ Nghiêm Linh</span>
                </h2>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '600px' }}>
                    Nền tảng quản lý toàn diện giúp trung tâm vận hành trơn tru từ khâu tuyển sinh, tài chính đến theo dõi tiến độ giảng dạy của từng lớp học.
                </p>
                <button
                    onClick={onLoginClick}
                    className="btn btn-primary"
                    style={{ padding: '16px 40px', fontSize: '1.1rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.4)' }}
                >
                    Đăng nhập / Đăng ký ngay
                </button>
            </main>
        </div>
    );
}

export default LandingPage;