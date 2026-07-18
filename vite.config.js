import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', /* Tự động cập nhật app khi có code mới */
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Quản lý Ngoại Ngữ Nghiêm Linh',
        short_name: 'UET Nghiêm Linh',
        description: 'Hệ thống Quản lý & Giảng dạy Trung tâm Ngoại Ngữ Nghiêm Linh',
        theme_color: '#2563eb', /* Màu chủ đạo của Topbar */
        background_color: '#ffffff', /* Màu nền lúc màn hình khởi động (Splash Screen) */
        display: 'standalone', /* QUAN TRỌNG: Ẩn thanh địa chỉ trình duyệt, chạy như App thật */
        orientation: 'portrait', /* Khóa hướng màn hình dọc trên điện thoại */
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' /* Giúp icon tự bo tròn đẹp trên Android */
          }
        ]
      }
    })
  ]
})
