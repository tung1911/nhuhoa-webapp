# WEBAPP NHƯ HOA

Đây là bản prototype mock cho hệ thống quản lý Inbox khách hàng.

## Tính năng (Mock Mode)
- **Đăng nhập**: Sử dụng account `phamthanhtung` / `123456789`.
- **Gộp trang**: Tuỳ chọn hiển thị / bật AI gợi ý cho từng Facebook Page.
- **Bộ lọc**: Lọc theo trạng thái Chưa đọc, Chưa rep, Chưa có SĐT, Lọc theo thời gian (UI). Tìm kiếm hội thoại theo tên, số điện thoại, tag, nội dung.
- **Khung Chat**: Hiển thị tin nhắn giữa nhân viên, AI và khách. Hỗ trợ gửi tin và Gợi ý AI ngẫu nhiên theo ngữ cảnh Thẩm Mỹ.
- **Thông tin khách hàng**: Cập nhật tag, đặt lịch (hiển thị popup), bảng báo hiệu câu nói truyền cảm hứng.

## Tech Stack
- Next.js 15 (App Router)
- React, TypeScript
- TailwindCSS
- Lucide React (Icons)
- Date-fns

## Cài đặt & Chạy Local

1. Đảm bảo đã cài đặt Node.js.
2. Cài đặt dependencies:
   ```bash
   npm install
   ```
3. Chạy server ở chế độ dev:
   ```bash
   npm run dev
   ```
4. Mở trình duyệt và truy cập: [http://localhost:3000](http://localhost:3000)

## Ghi chú
- Webapp hoàn toàn dùng dữ liệu mock, được định nghĩa trong `src/lib/mock-data.ts`.
- Mọi thao tác state chỉ lưu tạm thời trên RAM hoặc LocalStorage, sẽ bị reset nếu xóa dữ liệu trình duyệt hoặc refesh (ngoại trừ token đăng nhập).
