-- ====================================================================
-- ECOTDEV DIGITAL STORE - ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- 1. Helper function to check if current user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(target_role user_role_type)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND (role = target_role OR role = 'SUPER_ADMIN')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Helper function to check if current user is any admin / staff
CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRODUCT_MANAGER', 'ORDER_MANAGER', 'SUPPORT')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Enable RLS on all tables
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

-- ====================================================================
-- PROFILES POLICIES
-- ====================================================================
CREATE POLICY "Public profiles are readable by authenticated users"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
    ON public.profiles FOR UPDATE
    USING (public.is_admin_or_staff());

-- ====================================================================
-- USER ROLES POLICIES (Strict RBAC protection)
-- ====================================================================
CREATE POLICY "Users can read own role"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin_or_staff());

CREATE POLICY "Only SUPER_ADMIN can insert or alter roles"
    ON public.user_roles FOR ALL
    USING (public.has_role('SUPER_ADMIN'));

-- ====================================================================
-- CATEGORIES POLICIES
-- ====================================================================
CREATE POLICY "Anyone can view active categories"
    ON public.categories FOR SELECT
    USING (is_active = true OR public.is_admin_or_staff());

CREATE POLICY "Admins can manage categories"
    ON public.categories FOR ALL
    USING (public.is_admin_or_staff());

-- ====================================================================
-- PRODUCTS & IMAGES POLICIES
-- ====================================================================
CREATE POLICY "Anyone can view published products"
    ON public.products FOR SELECT
    USING (status = 'PUBLISHED' OR public.is_admin_or_staff());

CREATE POLICY "Admins can insert, update, delete products"
    ON public.products FOR ALL
    USING (public.is_admin_or_staff());

CREATE POLICY "Anyone can view product images"
    ON public.product_images FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage product images"
    ON public.product_images FOR ALL
    USING (public.is_admin_or_staff());

-- ====================================================================
-- DIGITAL ASSETS & LICENSE KEYS POLICIES (High security)
-- ====================================================================
CREATE POLICY "Only staff can directly query raw digital assets"
    ON public.digital_assets FOR SELECT
    USING (public.is_admin_or_staff());

CREATE POLICY "Admins can manage digital assets"
    ON public.digital_assets FOR ALL
    USING (public.is_admin_or_staff());

CREATE POLICY "Only staff can directly view license inventory"
    ON public.license_keys FOR SELECT
    USING (public.is_admin_or_staff());

CREATE POLICY "Admins can manage license keys"
    ON public.license_keys FOR ALL
    USING (public.is_admin_or_staff());

-- ====================================================================
-- CARTS & ITEMS POLICIES
-- ====================================================================
CREATE POLICY "Users can manage own cart"
    ON public.carts FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart items"
    ON public.cart_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()
        )
    );

-- ====================================================================
-- COUPONS POLICIES
-- ====================================================================
CREATE POLICY "Anyone can check active coupons"
    ON public.coupons FOR SELECT
    USING (is_active = true OR public.is_admin_or_staff());

CREATE POLICY "Admins can manage coupons"
    ON public.coupons FOR ALL
    USING (public.is_admin_or_staff());

-- ====================================================================
-- ORDERS & ITEMS POLICIES
-- ====================================================================
CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin_or_staff());

CREATE POLICY "Users can create own orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders"
    ON public.orders FOR UPDATE
    USING (public.is_admin_or_staff());

CREATE POLICY "Users can view own order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.is_admin_or_staff())
        )
    );

CREATE POLICY "Users can insert order items when creating order"
    ON public.order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
        )
    );

-- ====================================================================
-- PAYMENTS POLICIES
-- ====================================================================
CREATE POLICY "Users can view own payments"
    ON public.payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payments.order_id AND (orders.user_id = auth.uid() OR public.is_admin_or_staff())
        )
    );

CREATE POLICY "Admins can manage payments"
    ON public.payments FOR ALL
    USING (public.is_admin_or_staff());

-- ====================================================================
-- DELIVERIES POLICIES (Vault for downloaded code & keys)
-- ====================================================================
CREATE POLICY "Users can view own deliveries for paid orders"
    ON public.deliveries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.order_items
            JOIN public.orders ON orders.id = order_items.order_id
            WHERE order_items.id = deliveries.order_item_id
              AND (orders.user_id = auth.uid() OR public.is_admin_or_staff())
        )
    );

CREATE POLICY "Admins can manage deliveries"
    ON public.deliveries FOR ALL
    USING (public.is_admin_or_staff());

-- ====================================================================
-- REVIEWS POLICIES
-- ====================================================================
CREATE POLICY "Anyone can view approved reviews"
    ON public.reviews FOR SELECT
    USING (is_approved = true OR auth.uid() = user_id OR public.is_admin_or_staff());

CREATE POLICY "Authenticated users can create reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
    ON public.reviews FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can moderate reviews"
    ON public.reviews FOR ALL
    USING (public.is_admin_or_staff());

-- ====================================================================
-- WISHLISTS POLICIES
-- ====================================================================
CREATE POLICY "Users can manage own wishlist"
    ON public.wishlists FOR ALL
    USING (auth.uid() = user_id);

-- ====================================================================
-- SUPPORT TICKETS POLICIES
-- ====================================================================
CREATE POLICY "Users can view and create own tickets"
    ON public.support_tickets FOR ALL
    USING (auth.uid() = user_id OR public.is_admin_or_staff());

-- ====================================================================
-- NOTIFICATIONS POLICIES
-- ====================================================================
CREATE POLICY "Users can manage own notifications"
    ON public.notifications FOR ALL
    USING (auth.uid() = user_id);

-- ====================================================================
-- AUDIT LOGS POLICIES
-- ====================================================================
CREATE POLICY "Only staff can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin_or_staff());

CREATE POLICY "System and staff can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (true);

-- ====================================================================
-- SITE SETTINGS POLICIES
-- ====================================================================
CREATE POLICY "Public settings readable by everyone"
    ON public.site_settings FOR SELECT
    USING (is_public = true OR public.is_admin_or_staff());

CREATE POLICY "Admins can update site settings"
    ON public.site_settings FOR ALL
    USING (public.is_admin_or_staff());
