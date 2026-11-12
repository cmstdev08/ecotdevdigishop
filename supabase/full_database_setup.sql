-- ====================================================================
-- ECOTDEV DIGITAL STORE - ALL-IN-ONE COMPLETE SUPABASE SETUP
-- (Chạy toàn bộ file này trong Supabase SQL Editor để khởi tạo 100%)
-- ====================================================================

-- BƯỚC 1: KÍCH HOẠT EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- BƯỚC 2: TẠO CÁC KIỂU ENUM DỮ LIỆU
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('SUPER_ADMIN', 'ADMIN', 'PRODUCT_MANAGER', 'ORDER_MANAGER', 'SUPPORT', 'CUSTOMER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_type_enum AS ENUM ('SOURCE_CODE', 'TEMPLATE', 'LICENSE_KEY', 'DIGITAL_SERVICE', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_status_enum AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status_enum AS ENUM ('PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_enum AS ENUM ('VNPAY', 'MOMO', 'BANK_TRANSFER', 'STRIPE', 'CRYPTO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE license_status_enum AS ENUM ('AVAILABLE', 'ASSIGNED', 'REVOKED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE delivery_type_enum AS ENUM ('FILE_DOWNLOAD', 'LICENSE_KEY', 'ACCOUNT_CREDENTIALS', 'SERVICE_ACTIVATION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE delivery_status_enum AS ENUM ('PENDING', 'DELIVERED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE discount_type_enum AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status_enum AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- BƯỚC 3: TẠO CẤU TRÚC BẢNG (TABLES)

-- 1. PROFILES (Liên kết auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT '',
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    is_banned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. USER ROLES (Phân quyền RBAC)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role user_role_type NOT NULL DEFAULT 'CUSTOMER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- 3. CATEGORIES (Danh mục sản phẩm)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    icon_name TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PRODUCTS (Sản phẩm kỹ thuật số)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    short_description TEXT,
    price NUMERIC(15, 2) NOT NULL CHECK (price >= 0),
    sale_price NUMERIC(15, 2) CHECK (sale_price IS NULL OR sale_price < price),
    thumbnail TEXT NOT NULL,
    product_type product_type_enum NOT NULL DEFAULT 'SOURCE_CODE',
    status product_status_enum NOT NULL DEFAULT 'PUBLISHED',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    version TEXT DEFAULT '1.0.0',
    demo_url TEXT,
    documentation_url TEXT,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    tech_stack JSONB NOT NULL DEFAULT '[]'::jsonb,
    license_terms TEXT,
    support_period_days INT DEFAULT 365,
    sales_count INT NOT NULL DEFAULT 0,
    rating_avg NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    rating_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PRODUCT IMAGES (Bộ sưu tập ảnh)
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. DIGITAL ASSETS (Kho file mã nguồn lưu trữ Private Bucket)
CREATE TABLE IF NOT EXISTS public.digital_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0.0',
    file_size BIGINT NOT NULL DEFAULT 0,
    checksum TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. LICENSE KEYS (Kho mã bản quyền)
CREATE TABLE IF NOT EXISTS public.license_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    encrypted_key TEXT NOT NULL,
    status license_status_enum NOT NULL DEFAULT 'AVAILABLE',
    order_item_id UUID,
    assigned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. CARTS (Giỏ hàng)
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. CART ITEMS (Mặt hàng trong giỏ)
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_cart_product UNIQUE (cart_id, product_id)
);

-- 10. COUPONS (Mã giảm giá)
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type discount_type_enum NOT NULL DEFAULT 'PERCENTAGE',
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    min_order_value NUMERIC(15, 2) NOT NULL DEFAULT 0,
    max_discount_amount NUMERIC(15, 2),
    max_uses INT NOT NULL DEFAULT 100,
    used_count INT NOT NULL DEFAULT 0,
    per_user_limit INT NOT NULL DEFAULT 1,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. ORDERS (Đơn hàng)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    order_code TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    subtotal NUMERIC(15, 2) NOT NULL CHECK (subtotal >= 0),
    discount NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
    total NUMERIC(15, 2) NOT NULL CHECK (total >= 0),
    coupon_id UUID REFERENCES public.coupons(id),
    status order_status_enum NOT NULL DEFAULT 'PENDING',
    payment_method payment_method_enum NOT NULL DEFAULT 'BANK_TRANSFER',
    ip_address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. ORDER ITEMS (Chi tiết sản phẩm mua trong đơn)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    product_type product_type_enum NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    subtotal NUMERIC(15, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. PAYMENTS (Xác thực giao dịch thanh toán)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method payment_method_enum NOT NULL,
    transaction_code TEXT NOT NULL UNIQUE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    status payment_status_enum NOT NULL DEFAULT 'PENDING',
    gateway_response JSONB DEFAULT '{}'::jsonb,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. DELIVERIES (Bàn giao sản phẩm số tự động)
CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
    delivery_type delivery_type_enum NOT NULL,
    delivery_status delivery_status_enum NOT NULL DEFAULT 'PENDING',
    download_url_info JSONB,
    license_key_text TEXT,
    credentials_info JSONB,
    download_count INT NOT NULL DEFAULT 0,
    max_downloads INT NOT NULL DEFAULT 10,
    expires_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. REVIEWS (Đánh giá)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    is_verified_purchase BOOLEAN NOT NULL DEFAULT true,
    is_approved BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. WISHLISTS (Sản phẩm yêu thích)
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_wishlist UNIQUE (user_id, product_id)
);

-- 17. SUPPORT TICKETS (Hỗ trợ kỹ thuật)
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    ticket_code TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    status ticket_status_enum NOT NULL DEFAULT 'OPEN',
    admin_response TEXT,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. NOTIFICATIONS (Thông báo)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. AUDIT LOGS (Nhật ký kiểm toán hệ thống)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. SITE SETTINGS (Cài đặt website & thanh toán)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- BƯỚC 4: TẠO INDEXES TỐI ƯU HIỆU NĂNG
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_code ON public.orders(order_code);
CREATE INDEX IF NOT EXISTS idx_license_keys_product ON public.license_keys(product_id, status);

-- BƯỚC 5: THIẾT LẬP BẢO MẬT RLS (ROW LEVEL SECURITY)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION public.has_role(target_role user_role_type)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND (role = target_role OR role = 'SUPER_ADMIN')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRODUCT_MANAGER', 'ORDER_MANAGER', 'SUPPORT')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies (Xóa policy cũ nếu có để tránh trùng lặp)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public profiles are readable" ON public.profiles;
    DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
    DROP POLICY IF EXISTS "Anyone can view published products" ON public.products;
    DROP POLICY IF EXISTS "Anyone can view product images" ON public.product_images;
    DROP POLICY IF EXISTS "Anyone can check active coupons" ON public.coupons;
    DROP POLICY IF EXISTS "Public settings readable by everyone" ON public.site_settings;
    DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.reviews;
    DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
    DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
    DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
    DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
    DROP POLICY IF EXISTS "Users can view own deliveries" ON public.deliveries;
    DROP POLICY IF EXISTS "Users can manage own wishlist" ON public.wishlists;
END $$;

CREATE POLICY "Public profiles are readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view published products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Anyone can view product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Anyone can check active coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Public settings readable by everyone" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own deliveries" ON public.deliveries FOR SELECT USING (true);
CREATE POLICY "Users can manage own wishlist" ON public.wishlists FOR ALL USING (true);

-- BƯỚC 6: DATABASE FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    is_first_user BOOLEAN;
BEGIN
    INSERT INTO public.profiles (id, full_name, email, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || NEW.id)
    )
    ON CONFLICT (id) DO NOTHING;

    SELECT count(*) = 0 INTO is_first_user FROM public.user_roles;

    IF is_first_user THEN
        INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'SUPER_ADMIN') ON CONFLICT DO NOTHING;
    ELSE
        INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'CUSTOMER') ON CONFLICT DO NOTHING;
    END IF;

    INSERT INTO public.carts (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- BƯỚC 7: NẠP DỮ LIỆU SEED DATA (DANH MỤC & SẢN PHẨM MẪU)

-- 1. SEED CATEGORIES
INSERT INTO public.categories (id, name, slug, description, image_url, icon_name, sort_order, is_active)
VALUES
    ('c1000000-0000-0000-0000-000000000001', 'Source Code Toàn Diện', 'source-code', 'Source code hoàn chỉnh hệ sinh thái E-commerce, SaaS, Booking, Fintech sẵn sàng triển khai.', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80', 'Code2', 1, true),
    ('c1000000-0000-0000-0000-000000000002', 'Website Templates', 'website-templates', 'Giao diện React, Next.js, Tailwind, Vue siêu tốc độ, chuẩn SEO và tối ưu chuyển đổi.', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80', 'LayoutTemplate', 2, true),
    ('c1000000-0000-0000-0000-000000000003', 'UI/UX Assets & Design Systems', 'ui-ux-assets', 'Bộ UI Kit Figma, Design Token, 3D Icon Pack và Wireframe hiện đại cho Designer & Developer.', 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80', 'Palette', 3, true),
    ('c1000000-0000-0000-0000-000000000004', 'Developer Tools & Scripts', 'developer-tools', 'Bộ CLI, thư viện tự động hóa, Microservice boilerplates tối ưu quy trình phát triển.', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80', 'Terminal', 4, true),
    ('c1000000-0000-0000-0000-000000000005', 'Bản Quyền & License Keys', 'licenses-digital-services', 'Mã bản quyền IDE, JetBrains, Windows, Server, Cloud VPS và các dịch vụ bản quyền số chính ngạch.', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80', 'KeyRound', 5, true)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED PRODUCTS (12 Sản phẩm thực tế)
INSERT INTO public.products (
    id, category_id, name, slug, description, short_description, price, sale_price, 
    thumbnail, product_type, status, is_featured, version, demo_url, documentation_url, 
    features, tech_stack, license_terms, sales_count, rating_avg, rating_count
) VALUES
(
    'p1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'E-Commerce Pro Enterprise (React 19, Supabase, Tailwind, Stripe/VNPay)',
    'ecommerce-pro-enterprise-react-supabase',
    'Giải pháp thương mại điện tử trọn gói cho doanh nghiệp. Hỗ trợ đa ngôn ngữ, thanh toán tự động VNPay/MoMo/Stripe, giỏ hàng thời gian thực, quản lý kho tự động và phân quyền Admin RBAC cao cấp.',
    'Hệ sinh thái E-commerce hoàn chỉnh với React 19, Supabase, đa cổng thanh toán và Admin Pro.',
    1890000, 1290000,
    'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&auto=format&fit=crop&q=80',
    'SOURCE_CODE', 'PUBLISHED', true, '2.4.0', 'https://demo-shop.ecotdev.com', 'https://docs.ecotdev.com/ecommerce-pro',
    '["Tích hợp sẵn cổng VNPay, MoMo, VietQR và Stripe", "Quản lý tồn kho tự động theo thời gian thực (Supabase Realtime)", "Hệ thống Admin Dashboard chi tiết với biểu đồ thống kê", "Tối ưu chuẩn SEO 100/100 Google Lighthouse", "Hỗ trợ Dark/Light theme sang trọng"]'::jsonb,
    '["React 19", "TypeScript", "Tailwind CSS", "Supabase", "PostgreSQL", "Zustand"]'::jsonb,
    'Giấy phép sử dụng thương mại không giới hạn dự án (Single Developer License). Không được bán lại mã nguồn dưới dạng nguyên bản.',
    142, 4.95, 28
),
(
    'p1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000001',
    'NexusSaaS - Multi-Tenant Subscription Platform (Next.js 15, Prisma)',
    'nexussaas-multi-tenant-platform',
    'Bộ source code nền tảng SaaS Multi-tenant hoàn chỉnh, hỗ trợ thanh toán định kỳ hàng tháng/năm, phân quyền tổ chức (Workspace & Teams), xác thực SSO và RESTful API webhook.',
    'Nền tảng SaaS đa người dùng, tính phí định kỳ và phân quyền thành viên tổ chức.',
    2490000, 1850000,
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    'SOURCE_CODE', 'PUBLISHED', true, '3.1.2', 'https://demo-saas.ecotdev.com', 'https://docs.ecotdev.com/nexussaas',
    '["Multi-tenant architecture cách ly dữ liệu từng tổ chức", "Thanh toán gói cước định kỳ Recurring Billing", "Tích hợp Resend gửi email xác thực và hóa đơn", "Giao diện Workspace switcher phong cách Linear", "Bảo mật 2FA và Single Sign-On"]'::jsonb,
    '["Next.js 15", "Prisma ORM", "PostgreSQL", "Tailwind CSS", "Stripe API"]'::jsonb,
    'Được quyền triển khai cho công ty và khách hàng cá nhân. Không resale.',
    89, 4.88, 17
),
(
    'p1000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000002',
    'ApexFin - Fintech Banking & Crypto Portfolio Template (React + Vite)',
    'apexfin-fintech-crypto-dashboard-template',
    'Giao diện Dashboard tài chính ngân hàng số và theo dõi danh mục đầu tư tiền mã hóa. Hơn 45 màn hình chuyên biệt với biểu đồ nến TradingView, quản lý giao dịch và lịch sử sao kê.',
    '45+ màn hình Dashboard tài chính chuyên sâu với biểu đồ phân tích thời gian thực.',
    950000, 690000,
    'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=80',
    'TEMPLATE', 'PUBLISHED', true, '1.5.0', 'https://demo-apexfin.ecotdev.com', 'https://docs.ecotdev.com/apexfin',
    '["45+ Component & Layout tài chính cao cấp", "Tích hợp biểu đồ Recharts và Chart.js tinh xảo", "Giao diện Dark Mode siêu chuẩn phong cách Web3", "Hỗ trợ Responsive 100% Mobile & Tablet", "Tài liệu hướng dẫn tích hợp API từng bước"]'::jsonb,
    '["React", "TypeScript", "Tailwind CSS", "Recharts", "Framer Motion"]'::jsonb,
    'Commercial Use allowed for 1 live project.',
    215, 4.92, 43
),
(
    'p1000000-0000-0000-0000-000000000004',
    'c1000000-0000-0000-0000-000000000003',
    'Cosmos Design System & UI Kit 2026 (Figma 1500+ Components)',
    'cosmos-design-system-figma-ui-kit',
    'Design System Figma đồ sộ với hơn 1.500 component Auto-layout v5, Design Tokens đồng bộ mã CSS, bộ biến Variables đổi theme sáng tối 1-click và 80+ mẫu ứng dụng mẫu sẵn.',
    '1500+ component Figma Auto-layout mới nhất với Token đồng bộ trực tiếp mã Tailwind.',
    750000, 490000,
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    'TEMPLATE', 'PUBLISHED', true, '4.0.0', 'https://www.figma.com/@ecotdev', 'https://docs.ecotdev.com/cosmos-ui',
    '["1500+ Component Figma Auto-layout chuẩn mực", "Figma Variables Dark/Light mode chuyển đổi 1-click", "Bao gồm bộ 200+ icon 3D render độc quyền", "Tương thích 100% với Tailwind CSS 3/4", "Update miễn phí trọn đời phiên bản mới"]'::jsonb,
    '["Figma", "Design Tokens", "Auto Layout 5.0", "SVG Vectors"]'::jsonb,
    'Sử dụng tự do cho các dự án thiết kế cá nhân và thương mại của team.',
    380, 5.00, 76
),
(
    'p1000000-0000-0000-0000-000000000005',
    'c1000000-0000-0000-0000-000000000005',
    'JetBrains All Products Pack - Bản Quyền 1 Năm Kích Hoạt Chính Chủ',
    'jetbrains-all-products-pack-1-year-license',
    'Mã kích hoạt bản quyền trọn bộ công cụ JetBrains 1 năm (IntelliJ IDEA Ultimate, WebStorm, PyCharm Pro, PhpStorm, GoLand, DataGrip, CLion...). Kích hoạt trực tiếp vào tài khoản JetBrains chính chủ.',
    'Bản quyền chính chủ 1 năm trọn bộ công cụ JetBrains IDE cao cấp nhất.',
    1200000, 890000,
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    'LICENSE_KEY', 'PUBLISHED', true, '2026.1', NULL, 'https://www.jetbrains.com',
    '["Kích hoạt trên email tài khoản JetBrains cá nhân", "Sử dụng đầy đủ mọi IDE của JetBrains không giới hạn", "Tự động cập nhật các phiên bản mới nhất từ hãng", "Bảo hành 1 đổi 1 suốt 365 ngày sử dụng", "Giao mã key tự động ngay sau khi thanh toán"]'::jsonb,
    '["JetBrains Ecosystem", "Cloud License Management"]'::jsonb,
    'Bản quyền 1 năm dành cho 1 cá nhân lập trình viên.',
    520, 4.98, 112
),
(
    'p1000000-0000-0000-0000-000000000006',
    'c1000000-0000-0000-0000-000000000004',
    'OmniScraper AI - Enterprise Web Scraping & Data Pipeline (Python/FastAPI)',
    'omniscraper-ai-web-scraping-pipeline',
    'Bộ mã nguồn thu thập dữ liệu thông minh ứng dụng AI xử lý CAPTCHA, chống chặn IP proxy xoay vòng, tự động bóc tách cấu trúc dữ liệu và đẩy về PostgreSQL/BigQuery/Google Sheets.',
    'Engine cào dữ liệu tự động với AI bóc tách thông tin và bypass anti-bot.',
    1350000, 990000,
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    'SOURCE_CODE', 'PUBLISHED', false, '1.8.0', NULL, 'https://docs.ecotdev.com/omniscraper',
    '["Tích hợp Playwright & Puppeteer stealth mode", "Bypass anti-bot Cloudflare, Datadome và Akamai", "Giao diện quản lý job dashboard qua FastAPI Swagger", "Pipeline xuất dữ liệu tự động ra JSON, Excel, DB", "Sẵn Docker Compose deploy 1 lệnh"]'::jsonb,
    '["Python 3.12", "FastAPI", "Playwright", "Celery", "Redis", "Docker"]'::jsonb,
    'Được phép triển khai nội bộ doanh nghiệp.',
    94, 4.86, 14
),
(
    'p1000000-0000-0000-0000-000000000007',
    'c1000000-0000-0000-0000-000000000001',
    'NovaBank - Cross-Platform Mobile Banking (React Native & Expo 52)',
    'novabank-mobile-banking-react-native-expo',
    'Source code ứng dụng mobile ngân hàng số và ví điện tử đa nền tảng iOS & Android. Tích hợp xác thực sinh trắc học FaceID/Vân tay, quét mã QR thanh toán, chuyển khoản và quản lý thẻ tín dụng.',
    'Source code Mobile App iOS/Android ngân hàng số với Expo 52 và FaceID.',
    2200000, 1690000,
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    'SOURCE_CODE', 'PUBLISHED', true, '2.0.1', 'https://expo.dev/@ecotdev/novabank', 'https://docs.ecotdev.com/novabank',
    '["Tương thích hoàn toàn Expo SDK 52 & React Native 0.76", "Tích hợp sinh trắc học Face ID & Fingerprint", "Quét mã QR Pay chuẩn EMVCo ngân hàng", "Hiệu ứng chuyển động mượt mà với React Native Reanimated", "Đầy đủ 60+ màn hình luồng giao dịch thực tế"]'::jsonb,
    '["React Native", "Expo 52", "TypeScript", "NativeWind", "Zustand"]'::jsonb,
    'Bao gồm source code đầy đủ không mã hóa.',
    78, 4.91, 19
),
(
    'p1000000-0000-0000-0000-000000000008',
    'c1000000-0000-0000-0000-000000000005',
    'Cloud VPS NVMe Server Pro (4 vCPU, 8GB RAM, 100GB NVMe) - 6 Tháng',
    'cloud-vps-nvme-server-pro-6-months',
    'Gói máy chủ ảo Cloud VPS cấu hình cao tại Datacenter FPT/Viettel Tier 3, tốc độ mạng 10Gbps trong nước, IP riêng Dedicated, quản trị qua portal hiện đại kèm backup tự động hàng tuần.',
    'VPS tốc độ cao 4 vCPU / 8GB RAM đặt tại Việt Nam, băng thông không giới hạn.',
    1800000, 1350000,
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
    'DIGITAL_SERVICE', 'PUBLISHED', false, 'Standard', NULL, 'https://vps.ecotdev.com',
    '["4 vCPU Intel Xeon Gold / AMD EPYC", "8GB RAM ECC thế hệ mới", "100GB SSD NVMe Enterprise Read/Write 3500MB/s", "Băng thông mạng trong nước 10Gbps không giới hạn", "Hỗ trợ cài đặt tự động Ubuntu, Debian, CentOS, Windows Server"]'::jsonb,
    '["KVM Virtualization", "NVMe Storage", "Tier 3 Datacenter"]'::jsonb,
    'Dịch vụ 6 tháng, gia hạn ưu đãi sau khi hết chu kỳ.',
    164, 4.97, 33
),
(
    'p1000000-0000-0000-0000-000000000009',
    'c1000000-0000-0000-0000-000000000002',
    'DevCraft - Portfolio & Tech Blog Template (Next.js 15, MDX)',
    'devcraft-developer-portfolio-blog-template',
    'Giao diện Portfolio cá nhân và Blog kỹ thuật chuẩn SEO dành cho Senior Software Engineers, Tech Leads và Designers.',
    'Giao diện hồ sơ năng lực cá nhân và Blog công nghệ đỉnh cao chuẩn SEO.',
    450000, 290000,
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    'TEMPLATE', 'PUBLISHED', false, '1.2.0', 'https://demo-devcraft.ecotdev.com', 'https://docs.ecotdev.com/devcraft',
    '["Next.js 15 App Router & Server Components", "Tự động sinh OpenGraph image linh hoạt", "Hỗ trợ viết bài bằng MDX kèm cú pháp highlight code đẹp mắt", "Đạt điểm 100/100 trên toàn bộ tiêu chí Google Lighthouse", "Tích hợp biểu đồ hoạt động GitHub commit"]'::jsonb,
    '["Next.js 15", "MDX", "Tailwind CSS", "Framer Motion", "TypeScript"]'::jsonb,
    'Single personal use.',
    410, 4.94, 62
),
(
    'p1000000-0000-0000-0000-000000000010',
    'c1000000-0000-0000-0000-000000000003',
    'Cyber3D - Futuristic Tech & Finance 3D Asset Pack (Blender + PNG + GLTF)',
    'cyber3d-tech-crypto-asset-pack',
    'Bộ sưu tập 120+ hình ảnh 3D cao cấp chủ đề công nghệ, blockchain, fintech và server.',
    '120+ model và ảnh render 3D chủ đề tương lai độ phân giải 4K nền trong suốt.',
    650000, 390000,
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80',
    'OTHER', 'PUBLISHED', false, '2.1.0', NULL, NULL,
    '["120+ Asset 3D độc quyền chất lượng cao", "File Blender (.blend) dựng sẵn ánh sáng Cycles & Eevee", "Render PNG tách nền độ phân giải 4096x4096px", "Format GLTF/GLB nhẹ sẵn sàng nhúng trực tiếp Three.js", "Tương thích Figma, Photoshop, After Effects"]'::jsonb,
    '["Blender 4.2", "GLTF / GLB", "PNG 4K Transparent"]'::jsonb,
    'Miễn phí bản quyền thương mại cho sản phẩm số và video.',
    195, 4.89, 27
),
(
    'p1000000-0000-0000-0000-000000000011',
    'c1000000-0000-0000-0000-000000000005',
    'Windows 11 Professional Retail - Bản Quyền Vĩnh Viễn Theo Mainboard',
    'windows-11-pro-retail-permanent-license',
    'Mã bản quyền Windows 11 Pro dạng Retail kích hoạt vĩnh viễn, gắn liền vào phần cứng bo mạch chủ (Digital License). Hỗ trợ cài đặt lại Windows không mất bản quyền, update Microsoft liên tục.',
    'Key bản quyền Windows 11 Pro Retail vĩnh viễn, hỗ trợ cài lại Win thoải mái.',
    350000, 220000,
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
    'LICENSE_KEY', 'PUBLISHED', false, 'Retail OEM', NULL, 'https://support.microsoft.com',
    '["Mã bản quyền Retail chính ngạch kích hoạt online 1-click", "Bản quyền vĩnh viễn trọn đời máy tính", "Hỗ trợ nâng cấp từ Win 10 Pro hoặc cài mới hoàn toàn", "Được cập nhật tính năng bảo mật mới nhất từ Microsoft", "Bảo hành đổi key mới nếu phát sinh lỗi"]'::jsonb,
    '["Microsoft Windows", "Retail License Architecture"]'::jsonb,
    'Sử dụng cho 1 thiết bị máy tính cá nhân.',
    890, 4.97, 185
),
(
    'p1000000-0000-0000-0000-000000000012',
    'c1000000-0000-0000-0000-000000000004',
    'GoMicro - Cloud-Native Microservices Production Starter (Golang, gRPC, K8s)',
    'gomicro-golang-grpc-microservices-starter',
    'Khung kiến trúc Microservice chuẩn doanh nghiệp bằng Golang, giao tiếp nội bộ siêu tốc qua gRPC, API Gateway REST, tích hợp sẵn Prometheus metrics, Jaeger distributed tracing và Helm charts deploy Kubernetes.',
    'Bộ khung Microservices bằng Golang & gRPC chuẩn Cloud-Native chịu tải hàng triệu req/s.',
    1650000, 1190000,
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    'SOURCE_CODE', 'PUBLISHED', false, '1.4.0', 'https://demo-grpc.ecotdev.com', 'https://docs.ecotdev.com/gomicro',
    '["Giao tiếp dịch vụ hiệu năng cao với gRPC và Protocol Buffers", "API Gateway xử lý auth JWT, rate limiting và reverse proxy", "Quan sát hệ thống toàn diện: Prometheus, Grafana, OpenTelemetry", "CI/CD GitHub Actions sẵn sàng deploy lên AWS/GCP Kubernetes", "Clean Architecture tách bạch rõ ràng Domain, UseCase, Repository"]'::jsonb,
    '["Go 1.23", "gRPC", "PostgreSQL", "Kafka", "Kubernetes", "Docker"]'::jsonb,
    'Được áp dụng trực tiếp cho dự án phần mềm công ty.',
    67, 4.96, 12
)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED COUPONS
INSERT INTO public.coupons (
    id, code, description, discount_type, discount_value, min_order_value, 
    max_discount_amount, max_uses, used_count, per_user_limit, starts_at, expires_at, is_active
) VALUES
    ('cp100000-0000-0000-0000-000000000001', 'ECOTDEV10', 'Giảm ngay 10% cho toàn bộ giỏ hàng', 'PERCENTAGE', 10.00, 200000, 300000, 500, 42, 1, NOW() - INTERVAL '10 days', NOW() + INTERVAL '180 days', true),
    ('cp100000-0000-0000-0000-000000000002', 'SUPERDEV20', 'Giảm 20% đơn từ 1.000.000đ dành cho Developer', 'PERCENTAGE', 20.00, 1000000, 500000, 200, 18, 1, NOW() - INTERVAL '5 days', NOW() + INTERVAL '90 days', true),
    ('cp100000-0000-0000-0000-000000000003', 'WELCOME50K', 'Giảm trực tiếp 50.000đ cho khách hàng mới', 'FIXED_AMOUNT', 50000.00, 150000, 50000, 1000, 115, 1, NOW() - INTERVAL '30 days', NOW() + INTERVAL '365 days', true)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED SITE SETTINGS
INSERT INTO public.site_settings (id, setting_key, setting_value, is_public, description)
VALUES
    ('s1000000-0000-0000-0000-000000000001', 'general_info', '{
        "store_name": "ECOTDEV DIGITAL STORE",
        "tagline": "Sàn Giao Dịch Sản Phẩm Kỹ Thuật Số & Bản Quyền Phần Mềm",
        "hotline": "0988.888.999",
        "support_email": "support@ecotdev.com",
        "business_address": "Tầng 12, Tòa nhà Công Nghệ Cao, Quận Cầu Giấy, Hà Nội",
        "operating_hours": "08:00 - 22:00 (Thứ 2 - Chủ Nhật)",
        "logo_url": "/favicon.svg",
        "is_maintenance": false
    }'::jsonb, true, 'Thông tin thương hiệu và liên hệ chung'),
    ('s1000000-0000-0000-0000-000000000002', 'payment_banking_info', '{
        "bank_name": "Techcombank (Ngân hàng TMCP Kỹ thương Việt Nam)",
        "bank_account_number": "19036888999999",
        "bank_account_name": "CONG TY TNHH CONG NGHE ECOTDEV",
        "bank_bin": "970407",
        "momo_phone": "0988888999",
        "momo_name": "ECOTDEV STORE",
        "payment_instruction": "Quý khách vui lòng ghi đúng Cú pháp chuyển khoản là Mã đơn hàng (Ví dụ: ECOT-88231) để hệ thống tự động giao hàng trong 30 giây."
    }'::jsonb, true, 'Thông tin tài khoản ngân hàng và ví điện tử tiếp nhận thanh toán')
ON CONFLICT (id) DO NOTHING;

-- 5. SEED LICENSE KEYS
INSERT INTO public.license_keys (id, product_id, encrypted_key, status)
VALUES
    ('k1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000005', 'JB2026-AP-99X8-44A2-KLM9', 'AVAILABLE'),
    ('k1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000005', 'JB2026-AP-88B1-77Z4-QP21', 'AVAILABLE'),
    ('k1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000005', 'JB2026-AP-55D9-33C6-XY88', 'AVAILABLE'),
    ('k1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000011', 'VK7JG-NPHTM-C97JM-9MPGT-3V66T', 'AVAILABLE'),
    ('k1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000011', 'W269N-WFGWX-YVC9B-4J6C9-T83GX', 'AVAILABLE')
ON CONFLICT (id) DO NOTHING;
