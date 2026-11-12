# ECOTDEV DIGITAL STORE 🚀
> **Sàn Thương Mại Điện Tử Chuyên Nghiệp Dành Cho Sản Phẩm Kỹ Thuật Số & Bản Quyền Phần Mềm**

ECOTDEV DIGITAL STORE là nền tảng thương mại điện tử hiện đại, tốc độ cao và bảo mật nghiêm ngặt, chuyên kinh doanh:
- **Source Code:** Hệ thống Web, Mobile App, Microservices (React, Next.js, Node.js, Python, Go).
- **Website Templates:** Giao diện tối ưu SEO, chuyển đổi cao (React, Tailwind, Figma Design Systems).
- **UI/UX Assets:** Figma Kits, Design Tokens, bộ icon 3D render 4K.
- **License Keys:** Mã kích hoạt bản quyền chính hãng (JetBrains All Products, Windows 11 Pro Retail, v.v.).
- **Digital Services:** Cloud VPS NVMe, máy chủ ảo, API Credits.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

### Frontend
- **React 19** + **Vite 6** + **TypeScript**
- **Tailwind CSS v3** (Hệ màu Modern Digital Marketplace: Dark Mode mặc định, Background `#090D18`, Card `#111827`, Primary `#6366F1`, Accent `#22D3EE`)
- **React Router DOM v7** (Nested routing, Layouts, 404 handler)
- **TanStack Query v5** (Server state, caching, synchronization)
- **Zustand** (Persistent Cart & Wishlist state, Theme store)
- **Recharts** (Biểu đồ doanh thu AreaChart & BarChart trực quan trên Admin Dashboard)
- **Sonner** (Toast notifications) + **Canvas-confetti** (Hiệu ứng chúc mừng thanh toán thành công)
- **Lucide React** (Bộ icon đồ họa công nghệ cao)

### Backend & Database (Supabase)
- **PostgreSQL Database:** Chuẩn hóa với UUID, Foreign Keys, Indexes, Checks, Enums và Timestamps.
- **Supabase Authentication:** Quản lý phiên làm việc JWT, phân quyền đa cấp độ.
- **Row Level Security (RLS):** Toàn bộ bảng dữ liệu nhạy cảm được bảo vệ tuyệt đối bằng RLS Policies.
- **Database Functions & Triggers:** Tự động tạo hồ sơ khách hàng, tự động cấp phát License Key và link tải file mã nguồn khi trạng thái đơn hàng chuyển sang `PAID`.
- **Supabase Storage:** Private Bucket `digital-packages` sinh Signed URL có thời hạn (1 giờ), giới hạn lượt tải theo đơn hàng.
- **Edge Functions (Deno):**
  - `create-payment`: Xác thực giá tiền ở server, kiểm tra coupon, tạo đơn hàng.
  - `payment-webhook`: Lắng nghe webhook ngân hàng, chống xử lý trùng lặp (Idempotent), kích hoạt bàn giao sản phẩm tự động.
  - `deliver-product`: Cấp signed URL có token bảo mật.
  - `admin-actions`: Thao tác đặc quyền dành cho Super Admin.

---

## 📂 KIẾN TRÚC THƯ MỤC

```text
ECOTDEVDIGISHOP/
├── public/
│   ├── favicon.svg             # Logo biểu tượng ECOTDEV
├── src/
│   ├── assets/                 # Hình ảnh tĩnh và tài nguyên
│   ├── components/
│   │   ├── common/             # Navbar, Footer, RoleSwitcher (RBAC Switcher)
│   │   ├── product/            # ProductCard, ProductGrid
│   │   └── ui/                 # Button, Badge, Card, Modal, Input, Skeleton
│   ├── contexts/               # AuthContext (Supabase Auth + Session + Demo Roles)
│   ├── data/                   # Initial Seed Data (12 sản phẩm chi tiết, 5 danh mục)
│   ├── layouts/
│   │   ├── CustomerLayout.tsx  # Layout khách hàng (Announcement, Navbar, Outlet, Footer)
│   │   └── AdminLayout.tsx     # Layout quản trị (Sidebar, RBAC Guard, Staff info)
│   ├── lib/
│   │   ├── supabase/           # Supabase client wrapper & offline/sandbox fallback
│   │   └── validators/         # Zod schemas xác thực dữ liệu
│   ├── pages/
│   │   ├── home/               # Trang chủ (Hero, Danh mục, Nổi bật, Bán chạy, FAQ)
│   │   ├── products/           # Danh sách sản phẩm, Tìm kiếm, Lọc giá, Chi tiết sản phẩm
│   │   ├── cart/               # Giỏ hàng, Áp dụng mã giảm giá, Tính tiền tự động
│   │   ├── checkout/           # Thanh toán, Tạo mã VietQR tự động, Sandbox Verify
│   │   ├── account/            # Kho sản phẩm đã mua, Tải mã nguồn, Xem License Key, Đơn hàng, Tickets
│   │   ├── support/            # Trung tâm trợ giúp, Chính sách hoàn tiền, Form liên hệ
│   │   ├── auth/               # Đăng nhập & Đăng ký (Có sẵn nút đăng nhập 1-Click test)
│   │   └── admin/              # Dashboard tổng quan, Sản phẩm, Kho số & Key, Đơn hàng, Khách hàng, Coupons, Cài đặt
│   ├── routes/                 # Cấu hình React Router DOM
│   ├── services/               # productService, orderService, adminService
│   ├── stores/                 # useCartStore, useWishlistStore, useThemeStore
│   ├── types/                  # TypeScript Types đầy đủ
│   ├── utils/                  # Format tiền tệ VND, ngày tháng, bytes, cn
│   ├── App.tsx
│   ├── index.css               # Tailwind CSS Base & Components
│   └── main.tsx
├── supabase/
│   ├── migrations/
│   │   ├── 01_initial_schema.sql       # 20 bảng chuẩn hóa & Indexes
│   │   ├── 02_security_rls.sql         # Toàn bộ chính sách bảo mật RLS
│   │   └── 03_functions_triggers.sql   # Trigger auto-profile & auto-fulfillment
│   ├── functions/
│   │   ├── create-payment/index.ts
│   │   ├── payment-webhook/index.ts
│   │   ├── deliver-product/index.ts
│   │   └── admin-actions/index.ts
│   └── seed.sql                        # 12 sản phẩm mẫu, danh mục, coupon, cài đặt
├── .env.example
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## ⚡ HƯỚNG DẪN KHỞI CHẠY LOCAL

### 1. Cài đặt Dependencies
```bash
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env` từ `.env.example`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
VITE_STORE_NAME=ECOTDEV DIGITAL STORE
VITE_ENABLE_SANDBOX_PAYMENTS=true
```
*(Lưu ý: Ứng dụng đã tích hợp sẵn chế độ Offline/Sandbox Fallback thông minh, có thể chạy và trải nghiệm toàn bộ tính năng mua hàng, thanh toán QR mô phỏng và quản trị Admin ngay cả khi chưa kết nối Supabase từ xa).*

### 3. Chạy môi trường phát triển (Dev Server)
```bash
npm run dev
```
Mở trình duyệt tại: `http://localhost:5173`

### 4. Build Production
```bash
npm run build
```

---

## 🗄️ HƯỚNG DẪN TRIỂN KHAI SUPABASE POSTGRESQL

1. **Tạo Project mới trên Supabase:**
   - Truy cập [https://supabase.com](https://supabase.com) và tạo một project mới.
   - Lấy `Project URL` và `anon public key` trong mục **Settings -> API** dán vào `.env`.

2. **Chạy Migration Database:**
   Mở **SQL Editor** trên Supabase Dashboard và thực thi tuần tự các file:
   - `supabase/migrations/01_initial_schema.sql` (Tạo bảng và Enums)
   - `supabase/migrations/02_security_rls.sql` (Thiết lập toàn bộ bảo mật RLS)
   - `supabase/migrations/03_functions_triggers.sql` (Thiết lập hàm tự động bàn giao)
   - `supabase/seed.sql` (Nạp 12 sản phẩm mẫu, coupons, tài khoản ngân hàng)

3. **Cấu hình Storage Bucket:**
   - Tạo một Bucket mới tên là `digital-packages`.
   - Đặt chế độ **Private Bucket** (Không chọn Public).
   - Chỉ cho phép service role hoặc hàm `deliver-product` sinh Signed URL để tải file.

4. **Triển khai Supabase Edge Functions:**
   ```bash
   npx supabase functions deploy create-payment
   npx supabase functions deploy payment-webhook
   npx supabase functions deploy deliver-product
   npx supabase functions deploy admin-actions
   ```

5. **Thiết lập tài khoản SUPER_ADMIN an toàn:**
   - Sau khi đăng ký tài khoản đầu tiên trên website hoặc qua Supabase Auth, trigger `handle_new_user` sẽ tự động cấp quyền `SUPER_ADMIN` cho người dùng đầu tiên.
   - Để gán quyền admin cho bất kỳ email nào khác, chạy lệnh SQL sau trong SQL Editor:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('<USER_UUID>', 'SUPER_ADMIN')
   ON CONFLICT (user_id, role) DO NOTHING;
   ```

---

## 💳 QUY TRÌNH THANH TOÁN & GIAO HÀNG TỰ ĐỘNG

1. **Khách hàng chọn sản phẩm và thanh toán:**
   - Frontend gửi giỏ hàng đến server (`createOrder`).
   - Server tính toán lại toàn bộ giá dựa trên cơ sở dữ liệu (chống gian lận sửa giá từ Client).
   - Hệ thống tạo mã đơn hàng độc nhất: `ECOT-XXXXXX`.
2. **Quét mã VietQR / VNPay:**
   - Mã VietQR được sinh tự động theo chuẩn EMVCo của ngân hàng (Techcombank BIN: 970407, Số tài khoản: 19036888999999, Nội dung chuyển khoản: Mã đơn hàng).
3. **Kích hoạt tự động (Fulfillment):**
   - Webhook ngân hàng hoặc nút **Xác Nhận Đã Chuyển Khoản (Sandbox)** gửi tín hiệu xác minh.
   - Trạng thái đơn hàng chuyển sang `PAID`.
   - **Với License Key:** Hệ thống gắp 1 key chưa sử dụng trong bảng `license_keys` (`status = 'AVAILABLE'`), gán vào `order_item_id` và lưu vào `deliveries` với `status = 'DELIVERED'`.
   - **Với Source Code:** Hệ thống cấp bản ghi quyền tải file và sinh Signed URL bảo mật có hiệu lực 60 phút.
   - Khách hàng có thể truy cập ngay mục **Kho lưu trữ cá nhân** để tải code và sao chép key.

---

## 🚀 TRIỂN KHAI LÊN VERCEL

1. Push mã nguồn lên GitHub.
2. Đăng nhập vào [Vercel](https://vercel.com) và chọn **Add New Project**.
3. Chọn repo `ECOTDEVDIGISHOP`.
4. Điền các biến môi trường trong phần **Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STORE_NAME`
5. Nhấn **Deploy**. Vercel sẽ tự động build và cung cấp domain HTTPS miễn phí.

---
© 2026 **ECOTDEV DIGITAL STORE**. Phát triển bởi Senior Full-stack Architecture Team.
