// ====================================================================
// ECOTDEV DIGITAL STORE - CORE TYPES
// ====================================================================

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'PRODUCT_MANAGER' 
  | 'ORDER_MANAGER' 
  | 'SUPPORT' 
  | 'CUSTOMER'

export type ProductType = 
  | 'SOURCE_CODE' 
  | 'TEMPLATE' 
  | 'LICENSE_KEY' 
  | 'DIGITAL_SERVICE' 
  | 'OTHER'

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export type OrderStatus = 
  | 'PENDING' 
  | 'PAID' 
  | 'PROCESSING' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'REFUNDED' 
  | 'FAILED'

export type PaymentMethod = 'VNPAY' | 'MOMO' | 'BANK_TRANSFER' | 'STRIPE'

export type DeliveryType = 
  | 'FILE_DOWNLOAD' 
  | 'LICENSE_KEY' 
  | 'ACCOUNT_CREDENTIALS' 
  | 'SERVICE_ACTIVATION'

export type DeliveryStatus = 'PENDING' | 'DELIVERED' | 'FAILED'

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT'

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  phone?: string
  is_banned: boolean
  role: UserRole
  created_at?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  icon_name?: string
  sort_order: number
  is_active: boolean
  product_count?: number
}

export interface Product {
  id: string
  category_id: string
  name: string
  slug: string
  description: string
  short_description?: string
  price: number
  sale_price?: number | null
  thumbnail: string
  product_type: ProductType
  status: ProductStatus
  is_featured: boolean
  version?: string
  demo_url?: string | null
  documentation_url?: string | null
  features: string[]
  tech_stack: string[]
  license_terms?: string
  support_period_days?: number
  sales_count: number
  rating_avg: number
  rating_count: number
  created_at: string
  updated_at?: string
  category?: Category
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  sort_order: number
}

export interface DigitalAsset {
  id: string
  product_id: string
  storage_path: string
  file_name: string
  version: string
  file_size: number
  created_at?: string
}

export interface LicenseKey {
  id: string
  product_id: string
  encrypted_key: string
  status: 'AVAILABLE' | 'ASSIGNED' | 'REVOKED' | 'EXPIRED'
  order_item_id?: string | null
  assigned_at?: string | null
  created_at?: string
  product_name?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Coupon {
  id: string
  code: string
  description?: string
  discount_type: DiscountType
  discount_value: number
  min_order_value: number
  max_discount_amount?: number
  max_uses: number
  used_count: number
  starts_at: string
  expires_at: string
  is_active: boolean
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_type: ProductType
  unit_price: number
  quantity: number
  subtotal: number
  product?: Product
  delivery?: Delivery
}

export interface Order {
  id: string
  order_code: string
  user_id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  subtotal: number
  discount: number
  total: number
  coupon_id?: string | null
  status: OrderStatus
  payment_method: PaymentMethod
  created_at: string
  items?: OrderItem[]
  deliveries?: Delivery[]
}

export interface Delivery {
  id: string
  order_item_id: string
  delivery_type: DeliveryType
  delivery_status: DeliveryStatus
  download_url_info?: {
    file_name: string
    version: string
    storage_path: string
  }
  license_key_text?: string
  credentials_info?: any
  download_count: number
  max_downloads: number
  delivered_at?: string
  created_at?: string
  product_name?: string
}

export interface Review {
  id: string
  user_id: string
  product_id: string
  order_id?: string
  rating: number
  content: string
  images?: string[]
  is_verified_purchase: boolean
  is_approved: boolean
  created_at: string
  author_name?: string
  author_avatar?: string
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  product?: Product
  created_at: string
}

export interface SupportTicket {
  id: string
  user_id: string
  ticket_code: string
  subject: string
  content: string
  status: TicketStatus
  admin_response?: string
  responded_at?: string
  created_at: string
  user_email?: string
}

export interface NotificationItem {
  id: string
  user_id: string
  title: string
  content: string
  link?: string
  is_read: boolean
  created_at: string
}

export interface AuditLog {
  id: string
  actor_id?: string
  actor_name?: string
  action: string
  target_type: string
  target_id?: string
  metadata?: any
  created_at: string
}

export interface SiteSettings {
  general_info: {
    store_name: string
    tagline: string
    hotline: string
    support_email: string
    business_address: string
    operating_hours: string
    logo_url?: string
    is_maintenance: boolean
  }
  payment_banking_info: {
    bank_name: string
    bank_account_number: string
    bank_account_name: string
    bank_bin: string
    momo_phone: string
    momo_name: string
    payment_instruction: string
  }
}
