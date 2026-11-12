-- ====================================================================
-- ECOTDEV DIGITAL STORE - DATABASE FUNCTIONS & TRIGGERS
-- ====================================================================

-- 1. Automatic Timestamp Updater
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Automatically Create Profile & Role on User Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    is_first_user BOOLEAN;
BEGIN
    -- Insert profile
    INSERT INTO public.profiles (id, full_name, email, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || NEW.id)
    );

    -- Check if this is the very first user in the database (grant SUPER_ADMIN if so)
    SELECT count(*) = 0 INTO is_first_user FROM public.user_roles;

    IF is_first_user THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'SUPER_ADMIN');
    ELSE
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'CUSTOMER');
    END IF;

    -- Create an empty cart for this user
    INSERT INTO public.carts (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Recalculate Product Ratings on Review Changes
CREATE OR REPLACE FUNCTION public.recalculate_product_ratings()
RETURNS TRIGGER AS $$
DECLARE
    target_product_id UUID;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_product_id := OLD.product_id;
    ELSE
        target_product_id := NEW.product_id;
    END IF;

    UPDATE public.products
    SET 
        rating_avg = COALESCE((
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM public.reviews
            WHERE product_id = target_product_id AND is_approved = true
        ), 5.00),
        rating_count = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE product_id = target_product_id AND is_approved = true
        )
    WHERE id = target_product_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_change ON public.reviews;
CREATE TRIGGER on_review_change
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.recalculate_product_ratings();

-- 4. Automated Product Delivery on Order PAID
CREATE OR REPLACE FUNCTION public.fulfill_order(order_id_param UUID)
RETURNS VOID AS $$
DECLARE
    item_record RECORD;
    license_record RECORD;
    asset_record RECORD;
    order_record RECORD;
BEGIN
    SELECT * INTO order_record FROM public.orders WHERE id = order_id_param;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found: %', order_id_param;
    END IF;

    -- Loop through each item in the order
    FOR item_record IN 
        SELECT oi.*, p.product_type AS p_type, p.name AS p_name
        FROM public.order_items oi
        JOIN public.products p ON p.id = oi.product_id
        WHERE oi.order_id = order_id_param
    LOOP
        -- 1. LICENSE_KEY delivery
        IF item_record.product_type = 'LICENSE_KEY' THEN
            FOR i IN 1..item_record.quantity LOOP
                -- Find one available license key atomically
                SELECT * INTO license_record
                FROM public.license_keys
                WHERE product_id = item_record.product_id AND status = 'AVAILABLE'
                FOR UPDATE SKIP LOCKED
                LIMIT 1;

                IF FOUND THEN
                    -- Mark key as assigned
                    UPDATE public.license_keys
                    SET status = 'ASSIGNED', order_item_id = item_record.id, assigned_at = NOW()
                    WHERE id = license_record.id;

                    -- Insert delivery record
                    INSERT INTO public.deliveries (
                        order_item_id, delivery_type, delivery_status, license_key_text, delivered_at
                    ) VALUES (
                        item_record.id, 'LICENSE_KEY', 'DELIVERED', license_record.encrypted_key, NOW()
                    );
                ELSE
                    -- Out of keys in inventory, notify admin / record pending
                    INSERT INTO public.deliveries (
                        order_item_id, delivery_type, delivery_status, license_key_text, delivered_at
                    ) VALUES (
                        item_record.id, 'LICENSE_KEY', 'PENDING', 'Hệ thống đang bổ sung key mới. Quý khách vui lòng chờ CSKH liên hệ!', NOW()
                    );
                END IF;
            END LOOP;

        -- 2. SOURCE_CODE or TEMPLATE delivery
        ELSIF item_record.product_type IN ('SOURCE_CODE', 'TEMPLATE') THEN
            SELECT * INTO asset_record
            FROM public.digital_assets
            WHERE product_id = item_record.product_id
            ORDER BY created_at DESC
            LIMIT 1;

            INSERT INTO public.deliveries (
                order_item_id,
                delivery_type,
                delivery_status,
                download_url_info,
                delivered_at
            ) VALUES (
                item_record.id,
                'FILE_DOWNLOAD',
                'DELIVERED',
                jsonb_build_object(
                    'file_name', COALESCE(asset_record.file_name, item_record.product_name || '.zip'),
                    'version', COALESCE(asset_record.version, '1.0.0'),
                    'storage_path', COALESCE(asset_record.storage_path, 'packages/' || item_record.product_id || '.zip')
                ),
                NOW()
            );

        -- 3. DIGITAL_SERVICE or OTHER
        ELSE
            INSERT INTO public.deliveries (
                order_item_id, delivery_type, delivery_status, credentials_info, delivered_at
            ) VALUES (
                item_record.id,
                'SERVICE_ACTIVATION',
                'DELIVERED',
                jsonb_build_object('instructions', 'Dịch vụ đã được kích hoạt thành công cho tài khoản: ' || order_record.customer_email),
                NOW()
            );
        END IF;

        -- Update product sales count
        UPDATE public.products
        SET sales_count = sales_count + item_record.quantity
        WHERE id = item_record.product_id;

    END LOOP;

    -- Send in-app notification to customer
    INSERT INTO public.notifications (user_id, title, content, link)
    VALUES (
        order_record.user_id,
        'Đơn hàng #' || order_record.order_code || ' đã được giao thành công!',
        'Cảm ơn bạn đã mua hàng tại ECOTDEV STORE. Sản phẩm kỹ thuật số của bạn đã sẵn sàng trong Kho lưu trữ cá nhân.',
        '/account/downloads'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger order fulfillment when status changes to 'PAID'
CREATE OR REPLACE FUNCTION public.on_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status = 'PAID' AND OLD.status != 'PAID') THEN
        PERFORM public.fulfill_order(NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_order_paid_fulfillment ON public.orders;
CREATE TRIGGER trigger_order_paid_fulfillment
    AFTER UPDATE OF status ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.on_order_status_change();
