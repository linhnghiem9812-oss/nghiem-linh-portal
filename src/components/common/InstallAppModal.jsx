import React, { useState, useEffect } from "react";

export function InstallAppModal({ onClose }) {
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
            e.preventDefault(); // Ngăn trình duyệt tự hiện bảng thông báo mặc định xấu xí
            setDeferredPrompt(e); // Lưu sự kiện lại để kích hoạt khi người dùng bấm nút của chúng ta
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
        // Hiển thị bảng xác nhận của hệ thống
        deferredPrompt.prompt();
        // Chờ người dùng phản hồi
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            console.log("Người dùng đã đồng ý cài đặt PWA");
            setIsStandalone(true);
        }
        setDeferredPrompt(null);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[99999] flex justify-center items-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-blue-100">
                {/* Nút đóng */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
                >
                    ✕
                </button>

                {/* Tiêu đề & Logo */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner font-extrabold">
                        N
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-800">Cài đặt App Nghiêm Linh</h3>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                        Thêm vào màn hình chính để truy cập nhanh chóng như App thật
                    </p>
                </div>

                {/* NỘI DUNG HIỂN THỊ THEO TRẠNG THÁI */}
                {isStandalone ? (
                    /* TRƯỜNG HỢP 1: ĐÃ CÀI ĐẶT RỒI */
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                        <div className="text-green-600 text-3xl mb-2">🎉</div>
                        <h4 className="font-bold text-green-800 text-sm">Tuyệt vời! Bạn đang sử dụng App</h4>
                        <p className="text-xs text-green-700 mt-1">
                            Ứng dụng đã được cài đặt trên màn hình điện thoại của bạn. Bạn không cần thao tác gì thêm!
                        </p>
                    </div>
                ) : isIOS ? (
                    /* TRƯỜNG HỢP 2: DÀNH RIÊNG CHO iPHONE / iPAD (Vì Apple không cho bấm tự động) */
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3 border-b border-blue-200 pb-2">
                            <span className="text-lg">📱</span>
                            <span className="font-bold text-blue-900 text-xs uppercase">Hướng dẫn cho iPhone / iPad:</span>
                        </div>
                        <ul className="text-xs text-slate-700 space-y-3 font-medium">
                            <li className="flex items-start gap-2">
                                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 font-bold text-[10px] mt-0.5">1</span>
                                <span>Bấm vào nút <strong>Chia sẻ (Share)</strong> <i className="fa-solid fa-arrow-up-from-bracket text-blue-600 text-sm mx-1"></i> ở thanh bên dưới hoặc góc trên trình duyệt Safari.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 font-bold text-[10px] mt-0.5">2</span>
                                <span>Cuộn xuống dưới và chọn mục <strong>"Thêm vào MH chính" (Add to Home Screen)</strong> <i className="fa-regular fa-square-plus text-slate-800 text-sm mx-1"></i>.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 font-bold text-[10px] mt-0.5">3</span>
                                <span>Bấm nút <strong>"Thêm" (Add)</strong> ở góc trên bên phải màn hình để hoàn tất.</span>
                            </li>
                        </ul>
                    </div>
                ) : (
                    /* TRƯỜNG HỢP 3: ANDROID / DESKTOP (Bấm nút là hiện bảng cài đặt) */
                    <div className="text-center">
                        <button
                            onClick={handleInstallClick}
                            className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 text-sm flex items-center justify-center gap-2"
                        >
                            <i className="fa-solid fa-download"></i>
                            CÀI ĐẶT ỨNG DỤNG NGAY
                        </button>
                        <p className="text-[11px] text-slate-400 mt-2 italic">
                            * Nhấn nút và chọn "Cài đặt" / "Thêm" khi hệ thống yêu cầu
                        </p>
                    </div>
                )}

                <div className="mt-5 text-center border-t border-slate-100 pt-3">
                    <button
                        onClick={onClose}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 underline"
                    >
                        Tôi sẽ cài đặt sau, quay lại trang chính
                    </button>
                </div>
            </div>
        </div>
    );
}