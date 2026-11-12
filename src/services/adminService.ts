import { Order, OrderStatus, UserProfile, UserRole, Coupon, AuditLog, LicenseKey } from '@/types'
import { INITIAL_PRODUCTS, INITIAL_COUPONS } from '@/data/mockData'

const LOCAL_ORDERS_KEY = 'ecotdev_orders_store'
const LOCAL_CUSTOMERS_KEY = 'ecotdev_customers_store'
const LOCAL_KEYS_KEY = 'ecotdev_license_inventory'

export const adminService = {
  async getDashboardStats() {
    const ordersData = localStorage.getItem(LOCAL_ORDERS_KEY)
    const orders: Order[] = ordersData ? JSON.parse(ordersData) : []

    // Calculate real-time metrics
    const totalOrders = orders.length + 18
    const paidOrders = orders.filter((o) => o.status === 'PAID' || o.status === 'COMPLETED').length + 15
    const pendingOrders = orders.filter((o) => o.status === 'PENDING').length + 3
    
    const realRevenue = orders
      .filter((o) => o.status === 'PAID' || o.status === 'COMPLETED')
      .reduce((sum, o) => sum + o.total, 0)
    const baseRevenue = 84500000 // 84.5M VND base revenue
    const totalRevenue = baseRevenue + realRevenue

    const todayRevenue = 3850000 + (orders[0]?.total || 0)
    const monthRevenue = 32900000 + realRevenue

    // Chart data: 7 days revenue
    const revenueChart = [
      { date: 'T2', revenue: 4200000, orders: 4 },
      { date: 'T3', revenue: 6800000, orders: 6 },
      { date: 'T4', revenue: 5100000, orders: 5 },
      { date: 'T5', revenue: 8900000, orders: 8 },
      { date: 'T6', revenue: 12400000, orders: 11 },
      { date: 'T7', revenue: 15600000, orders: 14 },
      { date: 'CN', revenue: 18200000, orders: 16 },
    ]

    // Category distribution
    const categoryDistribution = [
      { name: 'Source Code', count: 48, percentage: 42 },
      { name: 'License Key', count: 32, percentage: 28 },
      { name: 'Templates', count: 18, percentage: 16 },
      { name: 'UI/UX Kit', count: 12, percentage: 10 },
      { name: 'Cloud & Services', count: 5, percentage: 4 },
    ]

    // Recent orders
    const recentOrders = orders.slice(0, 5)

    return {
      totalRevenue,
      todayRevenue,
      monthRevenue,
      totalOrders,
      paidOrders,
      pendingOrders,
      totalCustomers: 246,
      totalProducts: INITIAL_PRODUCTS.length,
      revenueChart,
      categoryDistribution,
      recentOrders,
    }
  },

  async getAllOrders(): Promise<Order[]> {
    const ordersData = localStorage.getItem(LOCAL_ORDERS_KEY)
    const orders: Order[] = ordersData ? JSON.parse(ordersData) : []

    // If empty, generate realistic seed orders for the admin view
    if (orders.length === 0) {
      const seedOrders: Order[] = [
        {
          id: 'ord-seed-01',
          order_code: 'ECOT-892110',
          user_id: 'u-customer-1',
          customer_name: 'Nguyễn Hoàng Long',
          customer_email: 'long.nguyen@fpt.com',
          customer_phone: '0981234567',
          subtotal: 1890000,
          discount: 189000,
          total: 1701000,
          status: 'PAID',
          payment_method: 'BANK_TRANSFER',
          created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
          items: [
            {
              id: 'oi-s1',
              order_id: 'ord-seed-01',
              product_id: INITIAL_PRODUCTS[0].id,
              product_name: INITIAL_PRODUCTS[0].name,
              product_type: 'SOURCE_CODE',
              unit_price: 1890000,
              quantity: 1,
              subtotal: 1890000,
            },
          ],
        },
        {
          id: 'ord-seed-02',
          order_code: 'ECOT-443219',
          user_id: 'u-customer-2',
          customer_name: 'Vũ Minh Trí',
          customer_email: 'triminh@vng.com.vn',
          customer_phone: '0977665544',
          subtotal: 890000,
          discount: 0,
          total: 890000,
          status: 'PAID',
          payment_method: 'VNPAY',
          created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
          items: [
            {
              id: 'oi-s2',
              order_id: 'ord-seed-02',
              product_id: INITIAL_PRODUCTS[4].id,
              product_name: INITIAL_PRODUCTS[4].name,
              product_type: 'LICENSE_KEY',
              unit_price: 890000,
              quantity: 1,
              subtotal: 890000,
            },
          ],
        },
        {
          id: 'ord-seed-03',
          order_code: 'ECOT-219800',
          user_id: 'u-customer-3',
          customer_name: 'Đặng Tuấn Anh',
          customer_email: 'tuananh.dev@gmail.com',
          customer_phone: '0909123456',
          subtotal: 490000,
          discount: 50000,
          total: 440000,
          status: 'PENDING',
          payment_method: 'MOMO',
          created_at: new Date(Date.now() - 10 * 3600000).toISOString(),
          items: [
            {
              id: 'oi-s3',
              order_id: 'ord-seed-03',
              product_id: INITIAL_PRODUCTS[3].id,
              product_name: INITIAL_PRODUCTS[3].name,
              product_type: 'TEMPLATE',
              unit_price: 490000,
              quantity: 1,
              subtotal: 490000,
            },
          ],
        },
      ]
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(seedOrders))
      return seedOrders
    }

    return orders
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    const ordersData = localStorage.getItem(LOCAL_ORDERS_KEY)
    if (!ordersData) return false
    const orders: Order[] = JSON.parse(ordersData)
    const index = orders.findIndex((o) => o.id === orderId)
    if (index === -1) return false
    orders[index].status = status
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders))
    return true
  },

  async getAllCustomers(): Promise<UserProfile[]> {
    const stored = localStorage.getItem(LOCAL_CUSTOMERS_KEY)
    if (stored) return JSON.parse(stored)

    const initialCustomers: UserProfile[] = [
      {
        id: 'u1000000-0000-0000-0000-000000000001',
        email: 'admin@ecotdev.com',
        full_name: 'Nguyễn Văn Admin (Super)',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        phone: '0988888999',
        is_banned: false,
        role: 'SUPER_ADMIN',
        created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
      },
      {
        id: 'u1000000-0000-0000-0000-000000000002',
        email: 'manager@ecotdev.com',
        full_name: 'Lê Minh Tuấn (Manager)',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        phone: '0912233445',
        is_banned: false,
        role: 'PRODUCT_MANAGER',
        created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
      },
      {
        id: 'u1000000-0000-0000-0000-000000000003',
        email: 'customer1@gmail.com',
        full_name: 'Hoàng Quốc Việt',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
        phone: '0933445566',
        is_banned: false,
        role: 'CUSTOMER',
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        id: 'u1000000-0000-0000-0000-000000000004',
        email: 'customer2@vng.com.vn',
        full_name: 'Phạm Quỳnh Nga',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
        phone: '0944556677',
        is_banned: false,
        role: 'CUSTOMER',
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
    ]

    localStorage.setItem(LOCAL_CUSTOMERS_KEY, JSON.stringify(initialCustomers))
    return initialCustomers
  },

  async toggleCustomerBan(userId: string, isBanned: boolean): Promise<boolean> {
    const customers = await this.getAllCustomers()
    const index = customers.findIndex((c) => c.id === userId)
    if (index === -1) return false
    customers[index].is_banned = isBanned
    localStorage.setItem(LOCAL_CUSTOMERS_KEY, JSON.stringify(customers))
    return true
  },

  async updateCustomerRole(userId: string, newRole: UserRole): Promise<boolean> {
    const customers = await this.getAllCustomers()
    const index = customers.findIndex((c) => c.id === userId)
    if (index === -1) return false
    customers[index].role = newRole
    localStorage.setItem(LOCAL_CUSTOMERS_KEY, JSON.stringify(customers))
    return true
  },

  async getLicenseInventory(productId?: string): Promise<LicenseKey[]> {
    const stored = localStorage.getItem(LOCAL_KEYS_KEY)
    let keys: LicenseKey[] = stored ? JSON.parse(stored) : [
      {
        id: 'k1',
        product_id: INITIAL_PRODUCTS[4].id,
        product_name: INITIAL_PRODUCTS[4].name,
        encrypted_key: 'JB2026-AP-99X8-44A2-KLM9',
        status: 'AVAILABLE',
        created_at: new Date().toISOString(),
      },
      {
        id: 'k2',
        product_id: INITIAL_PRODUCTS[4].id,
        product_name: INITIAL_PRODUCTS[4].name,
        encrypted_key: 'JB2026-AP-88B1-77Z4-QP21',
        status: 'AVAILABLE',
        created_at: new Date().toISOString(),
      },
      {
        id: 'k3',
        product_id: INITIAL_PRODUCTS[10].id,
        product_name: INITIAL_PRODUCTS[10].name,
        encrypted_key: 'VK7JG-NPHTM-C97JM-9MPGT-3V66T',
        status: 'AVAILABLE',
        created_at: new Date().toISOString(),
      },
      {
        id: 'k4',
        product_id: INITIAL_PRODUCTS[10].id,
        product_name: INITIAL_PRODUCTS[10].name,
        encrypted_key: 'W269N-WFGWX-YVC9B-4J6C9-T83GX',
        status: 'ASSIGNED',
        assigned_at: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date().toISOString(),
      },
    ]

    if (productId) {
      keys = keys.filter((k) => k.product_id === productId)
    }
    return keys
  },

  async addLicenseKeys(productId: string, keyList: string[]): Promise<number> {
    const product = INITIAL_PRODUCTS.find((p) => p.id === productId)
    const existing = await this.getLicenseInventory()
    const newItems: LicenseKey[] = keyList
      .filter((k) => k.trim())
      .map((k) => ({
        id: `k-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        product_id: productId,
        product_name: product?.name || 'Sản phẩm license',
        encrypted_key: k.trim(),
        status: 'AVAILABLE',
        created_at: new Date().toISOString(),
      }))

    const updated = [...newItems, ...existing]
    localStorage.setItem(LOCAL_KEYS_KEY, JSON.stringify(updated))
    return newItems.length
  },

  async getAllCoupons(): Promise<Coupon[]> {
    const stored = localStorage.getItem('ecotdev_coupons_store')
    if (stored) return JSON.parse(stored)
    localStorage.setItem('ecotdev_coupons_store', JSON.stringify(INITIAL_COUPONS))
    return INITIAL_COUPONS
  },

  async createCoupon(data: Partial<Coupon>): Promise<Coupon> {
    const coupons = await this.getAllCoupons()
    const newCoupon: Coupon = {
      id: `cp-${Date.now()}`,
      code: (data.code || 'COUPON').toUpperCase().trim(),
      description: data.description || '',
      discount_type: data.discount_type || 'PERCENTAGE',
      discount_value: Number(data.discount_value) || 10,
      min_order_value: Number(data.min_order_value) || 0,
      max_discount_amount: data.max_discount_amount ? Number(data.max_discount_amount) : undefined,
      max_uses: Number(data.max_uses) || 100,
      used_count: 0,
      starts_at: data.starts_at || new Date().toISOString(),
      expires_at: data.expires_at || new Date(Date.now() + 90 * 86400000).toISOString(),
      is_active: true,
    }
    coupons.unshift(newCoupon)
    localStorage.setItem('ecotdev_coupons_store', JSON.stringify(coupons))
    return newCoupon
  },

  async toggleCoupon(couponId: string, isActive: boolean): Promise<boolean> {
    const coupons = await this.getAllCoupons()
    const index = coupons.findIndex((c) => c.id === couponId)
    if (index === -1) return false
    coupons[index].is_active = isActive
    localStorage.setItem('ecotdev_coupons_store', JSON.stringify(coupons))
    return true
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    return [
      {
        id: 'log-1',
        action: 'ORDER_FULFILLED',
        target_type: 'ORDER',
        target_id: 'ECOT-892110',
        metadata: { delivery: 'FILE_DOWNLOAD', amount: 1701000 },
        created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
        actor_name: 'Hệ thống tự động',
      },
      {
        id: 'log-2',
        action: 'LICENSE_KEY_DELIVERED',
        target_type: 'LICENSE_KEY',
        target_id: 'JB2026-AP-88B1-77Z4-QP21',
        metadata: { customer: 'triminh@vng.com.vn' },
        created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
        actor_name: 'Hệ thống tự động',
      },
      {
        id: 'log-3',
        action: 'PRODUCT_PRICE_UPDATED',
        target_type: 'PRODUCT',
        target_id: 'p1000000-0000-0000-0000-000000000001',
        metadata: { old_price: 1990000, new_price: 1890000 },
        created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
        actor_name: 'Nguyễn Văn Admin',
      },
    ]
  },
}
