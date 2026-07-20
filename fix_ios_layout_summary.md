# Báo cáo Cập nhật Sửa lỗi Layout & Cuộn trang trên iOS

Dưới đây là danh sách các thay đổi đã được thực hiện dựa trên hướng dẫn để khắc phục triệt để tình trạng lệch layout, lỗi trắng màn hình, và lỗi đơ cuộn trang (freeze) trên iOS Safari.

## 1. Cập nhật `src/App.jsx`
- **Thay đổi thực hiện:** Gỡ bỏ các thẻ inline style trong thẻ `div` chứa nội dung chính (`.main-layout-wrapper`) và thẻ `main` (`.main-content`). Thay thế cấu trúc của component `App` bằng khối lệnh chuẩn mực được cung cấp.
- **Giải thích:** Việc sử dụng Inline Style có độ ưu tiên cao nhất, khiến các lệnh CSS responsive (`@media`) trong file `globals.css` không thể ghi đè. Cụ thể, khi màn hình nhỏ (<1024px), lề trái `marginLeft: 260px` từ Inline Style vẫn giữ nguyên làm giao diện bị đẩy lệch 260px sang phải trên iOS, gây ra khoảng trắng trống trải. Việc loại bỏ Inline Style nhường quyền kiểm soát lề lại hoàn toàn cho file CSS.

## 2. "Đại phẫu" làm sạch `src/styles/globals.css`
- **Thay đổi thực hiện:** Xóa bỏ toàn bộ các đoạn mã CSS từ khối `/* --- Responsive Adjustments --- */` (dòng 960) tới cuối file. Thay thế bằng duy nhất một khối luật CSS chuẩn (Unified Rules) dành riêng cho Responsive và chống lỗi iOS Safari.
- **Giải thích:**
  - Khối mã cũ chứa nhiều chỉ thị `@media` lặp lại và mâu thuẫn (như kết hợp giữa `overflow-y: scroll`, `overflow: hidden`, và `overscroll-behavior-y: none`). Khi iOS Safari biên dịch các luật chồng chéo này trên hệ thống lồng thẻ (như `#root`, `body`, `.app-container`), nó gây ra tình trạng "Nested Scroll Trap" (Bẫy cuộn lồng nhau), làm tê liệt hoàn toàn cảm ứng vuốt dọc.
  - Mã CSS mới đồng nhất lại việc quản lý lề máy tính (`marginLeft: 260px`) và di động (`marginLeft: 0`), ép buộc đường ray thanh cuộn bằng lệnh `overflow-y: scroll !important` và giải phóng cảm ứng bằng `-webkit-overflow-scrolling: touch`.

## 3. Đồng bộ Responsive mốc 1024px tại `src/styles/components/BottomNav.css`
- **Thay đổi thực hiện:** Điều chỉnh mốc `max-width` cho thanh điều hướng đáy (Bottom Bar) từ `768px` thành `1024px`.
- **Giải thích:** Do `App.jsx` bắt đầu ẩn Sidebar ở mốc màn hình `1024px`, nhưng `BottomNav.css` cũ chỉ hiện thanh công cụ dưới đáy ở `768px`. Khoảng từ 768px đến 1024px (ví dụ trên iPad, máy tính bảng) bị rơi vào "điểm mù" mất cả Sidebar lẫn Bottom Bar. Cập nhật này giúp thanh điều hướng đáy hiện ngay lập tức khi Sidebar biến mất.

Mọi xung đột về CSS làm đơ giao diện trên trình duyệt Webkit / iOS Safari đều đã được giải quyết!
