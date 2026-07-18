import React, { useState, useEffect } from "react";

function InstallApp() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isInAppBrowser, setIsInAppBrowser] = useState(false);

    useEffect(() => {
        // 1. Kiểm tra xem app đã được cài đặt vào màn hình chưa
        if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true) {
            setIsStandalone(true);
        }

        const userAgent = window.navigator.userAgent.toLowerCase();
        
        // 2. Kiểm tra iPhone/iPad (iOS)
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // 3. Kiểm tra xem có phải đang mở trong Zalo, Facebook, Google Search App, WebView... không
        const isInApp = /fban|fbav|zalo|instagram|line|wv|gsa/.test(userAgent);
        setIsInAppBrowser(isInApp);

        // 4. Bắt sự kiện cài đặt tự động của Android / Chrome
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault(); 
            setDeferredPrompt(e); 
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            // Thay vì alert báo lỗi, nếu không có event tự động, ta cảnh báo người dùng chuyển trình duyệt
            alert("⚠️ Trình duyệt hiện tại chưa hỗ trợ nút bấm tự động.\n\n👉 Vui lòng nhấn vào biểu tượng [3 chấm] ở góc trình duyệt -> Chọn 'Mở bằng trình duyệt Chrome' hoặc chọn 'Thêm vào màn hình chính/Cài đặt ứng dụng' trong menu!");
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
                <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--primary-light, #eff6ff)', color: 'var(--primary, #2563eb)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 16px', fontWeight: '800' }}>
                    N
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main, #0f172a)' }}>Cài đặt App Ngoại Ngữ Nghiêm Linh</h2>
                <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.95rem', marginBottom: '32px' }}>
                    Thêm ứng dụng vào màn hình chính để có trải nghiệm mượt mà, toàn màn hình và tốc độ truy cập nhanh nhất.
                </p>

                {/* TH 1: ĐÃ CÀI ĐẶT THÀNH CÔNG */}
                {isStandalone ? (
                    <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
                        <h4 style={{ fontWeight: '700', color: '#15803d', fontSize: '1.1rem', marginBottom: '8px' }}>Tuyệt vời! Bạn đang sử dụng App</h4>
                        <p style={{ fontSize: '0.9rem', color: '#166534' }}>
                            Ứng dụng đã được cài đặt thành công trên thiết bị của bạn. Bạn không cần thao tác gì thêm!
                        </p>
                    </div>
                ) : isInAppBrowser ? (
                    /* TH 2: ĐANG MỞ TRONG ZALO, FACEBOOK HOẶC GOOGLE SEARCH APP -> HƯỚNG DẪN MỞ BẰNG CHROME */
                    <div style={{ backgroundColor: '#fef9c3', border: '1px solid #fde047', borderRadius: '12px', padding: '20px', textAlign: 'left' }}>
                        <h4 style={{ fontWeight: '700', color: '#854d0e', fontSize: '1rem', marginBottom: '12px' }}>
                            ⚠️ Bạn đang mở trong trình duyệt phụ (Zalo/Google App)
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: '#713f12', marginBottom: '12px', lineHeight: '1.5' }}>
                            Các ứng dụng này chặn tính năng cài đặt phần mềm. Để tiếp tục cài đặt:
                        </p>
                        <ol style={{ paddingLeft: '20px', margin: 0, fontSize: '0.85rem', color: '#713f12', display: 'flex', flexDirection: 'column', gap: '8px', fontWeight: '600' }}>
                            <li>Nhấn vào biểu tượng <strong>[3 chấm dọc]</strong> hoặc <strong>[Chia sẻ]</strong> ở góc màn hình.</li>
                            <li>Chọn <strong>"Mở bằng trình duyệt Chrome"</strong> (hoặc Safari nếu dùng iPhone).</li>
                            <li>Quay lại tab này và tiếp tục nhấn nút cài đặt!</li>
                        </ol>
                    </div>
                ) : isIOS ? (
                    /* TH 3: DÀNH RIÊNG CHO iPHONE / iPAD */
                    <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '24px', textAlign: 'left' }}>
                        <h4 style={{ fontWeight: '700', color: '#1e40af', fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fa-brands fa-apple text-xl"></i> Hướng dẫn cài đặt cho iPhone / iPad
                        </h4>
                        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem', color: '#991b1b' }}>
                            * <strong>Lưu ý quan trọng:</strong> Hãy chắc chắn bạn đang mở bằng trình duyệt <strong>Safari chuẩn</strong> (Không phải chế độ Duyệt web riêng tư / Ẩn danh).
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <span style={{ width: '24px', height: '24px', backgroundColor: '#2563eb', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>1</span>
                                <span style={{ fontSize: '0.9rem', color: '#0f172a' }}>Nhấn vào nút <strong>Chia sẻ (Share)</strong> <span style={{ display: 'inline-block', padding: '2px 6px', backgroundColor: '#e2e8f0', borderRadius: '4px', fontSize: '0.8rem' }}>⬆️ ⬜</span> nằm ở giữa cạnh dưới cùng của màn hình Safari.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <span style={{ width: '24px', height: '24px', backgroundColor: '#2563eb', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>2</span>
                                <span style={{ fontSize: '0.9rem', color: '#0f172a' }}>Trong danh sách hiện lên, vuốt xuống và chọn mục <strong>"Thêm vào MH chính" (Add to Home Screen)</strong> ➕.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <span style={{ width: '24px', height: '24px', backgroundColor: '#2563eb', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>3</span>
                                <span style={{ fontSize: '0.9rem', color: '#0f172a' }}>Nhấn chữ <strong>"Thêm" (Add)</strong> ở góc trên bên phải màn hình để hoàn tất.</span>
                            </li>
                        </ul>
                    </div>
                ) : (
                    /* TH 4: TRÌNH DUYỆT CHROME ANDROID / DESKTOP */
                    <div style={{ padding: '20px 0' }}>
                        <button
                            onClick={handleInstallClick}
                            style={{
                                width: '100%',
                                padding: '16px 24px',
                                backgroundColor: '#2563eb',
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
                                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                                transition: 'transform 0.1s ease'
                            }}
                            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <i className="fa-solid fa-download"></i>
                            CÀI ĐẶT ỨNG DỤNG NGAY
                        </button>
                        <p style={{ marginTop: '16px', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                            * Nếu không thấy thông báo bật lên, vui lòng bấm biểu tượng [3 chấm] ở góc trình duyệt và chọn "Thêm vào màn hình chính".
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default InstallApp;
