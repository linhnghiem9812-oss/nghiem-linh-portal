import React, { useState, useEffect } from "react";

function InstallApp() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // 1. Kiểm tra xem app đã được cài đặt vào màn hình chưa
        if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true) {
            setIsStandalone(true);
        }

        // 2. Kiểm tra xem thiết bị có phải là iPhone/iPad (iOS) không
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // 3. Bắt sự kiện cài đặt tự động của Android / Chrome (beforeinstallprompt)
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault(); // Ngăn trình duyệt tự hiện bảng thông báo mặc định
            setDeferredPrompt(e); // Lưu sự kiện lại
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    // Hàm xử lý khi người dùng bấm nút Cài đặt trên Android / Desktop
    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            alert("⚠️ Trình duyệt của bạn chưa hỗ trợ cài đặt tự động hoặc Ứng dụng đã được cài đặt rồi!");
            return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setIsStandalone(true);
        }
        setDeferredPrompt(null);
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card text-center" style={{ padding: '40px 24px' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 16px', fontWeight: '800' }}>
                    N
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>Cài đặt Ứng dụng Nghiêm Linh</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '32px' }}>
                    Thêm ứng dụng vào màn hình chính để có trải nghiệm mượt mà, toàn màn hình và tốc độ truy cập nhanh nhất.
                </p>

                {isStandalone ? (
                    <div style={{ backgroundColor: 'var(--success-light)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
                        <h4 style={{ fontWeight: '700', color: 'var(--success)', fontSize: '1.1rem', marginBottom: '8px' }}>Tuyệt vời! Bạn đang sử dụng App</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--success)' }}>
                            Ứng dụng đã được cài đặt thành công trên thiết bị của bạn. Bạn không cần thao tác gì thêm!
                        </p>
                    </div>
                ) : isIOS ? (
                    <div style={{ backgroundColor: 'var(--primary-light)', border: '1px solid rgba(79, 70, 229, 0.2)', borderRadius: '12px', padding: '24px', textAlign: 'left' }}>
                        <h4 style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fa-brands fa-apple text-xl"></i> Hướng dẫn cài đặt cho iPhone / iPad
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <span style={{ width: '24px', height: '24px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>1</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Mở trang web này trên trình duyệt <strong>Safari</strong>.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <span style={{ width: '24px', height: '24px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>2</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Bấm vào biểu tượng <strong>Chia sẻ (Share)</strong> <i className="fa-solid fa-arrow-up-from-bracket text-blue-600 mx-1"></i> ở thanh công cụ phía dưới màn hình.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <span style={{ width: '24px', height: '24px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>3</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Cuộn xuống và chọn <strong>"Thêm vào MH chính" (Add to Home Screen)</strong> <i className="fa-regular fa-square-plus text-slate-700 mx-1"></i>.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <span style={{ width: '24px', height: '24px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>4</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Xác nhận <strong>"Thêm" (Add)</strong> ở góc trên bên phải màn hình.</span>
                            </li>
                        </ul>
                    </div>
                ) : (
                    <div style={{ padding: '20px 0' }}>
                        <button
                            onClick={handleInstallClick}
                            style={{
                                width: '100%',
                                padding: '16px 24px',
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1.05rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                                transition: 'transform 0.1s ease'
                            }}
                            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <i className="fa-solid fa-download"></i>
                            CÀI ĐẶT ỨNG DỤNG NGAY
                        </button>
                        <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Trình duyệt sẽ hiển thị yêu cầu xác nhận cài đặt.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default InstallApp;
