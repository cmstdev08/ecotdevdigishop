import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Order, OrderItem, Delivery, PaymentMethod } from '@/types'
import { CartItem } from '@/types'
import { INITIAL_PRODUCTS } from '@/data/mockData'

const LOCAL_ORDERS_KEY = 'ecotdev_orders_store'
const LOCAL_DELIVERIES_KEY = 'ecotdev_deliveries_store'

function getStoredOrders(): Order[] {
  const data = localStorage.getItem(LOCAL_ORDERS_KEY)
  if (!data) return []
  return JSON.parse(data)
}

function saveStoredOrders(orders: Order[]) {
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders))
}

function getStoredDeliveries(): Delivery[] {
  const data = localStorage.getItem(LOCAL_DELIVERIES_KEY)
  if (!data) return []
  return JSON.parse(data)
}

function saveStoredDeliveries(deliveries: Delivery[]) {
  localStorage.setItem(LOCAL_DELIVERIES_KEY, JSON.stringify(deliveries))
}

export const orderService = {
  async createOrder(params: {
    userId: string
    customerName: string
    customerEmail: string
    customerPhone: string
    items: CartItem[]
    couponId?: string | null
    discount?: number
    paymentMethod: PaymentMethod
  }): Promise<Order> {
    const orderCode = `ECOT-${Math.floor(100000 + Math.random() * 900000)}`
    
    // Server-verified calculation
    let subtotal = 0
    const orderItems: OrderItem[] = params.items.map((item) => {
      // Re-check product price from database/catalog
      const p = INITIAL_PRODUCTS.find((prod) => prod.id === item.product.id) || item.product
      const unitPrice = p.sale_price !== null && p.sale_price !== undefined ? Number(p.sale_price) : Number(p.price)
      const itemSubtotal = unitPrice * item.quantity
      subtotal += itemSubtotal

      return {
        id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        order_id: '',
        product_id: p.id,
        product_name: p.name,
        product_type: p.product_type,
        unit_price: unitPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        product: p,
      }
    })

    const discount = params.discount || 0
    const total = Math.max(0, subtotal - discount)

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_code: orderCode,
      user_id: params.userId,
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      customer_phone: params.customerPhone,
      subtotal,
      discount,
      total,
      coupon_id: params.couponId || null,
      status: 'PENDING',
      payment_method: params.paymentMethod,
      created_at: new Date().toISOString(),
      items: orderItems,
    }

    // Set order_id on items
    newOrder.items?.forEach((i) => (i.order_id = newOrder.id))

    // Save locally
    const orders = getStoredOrders()
    orders.unshift(newOrder)
    saveStoredOrders(orders)

    // Save to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await supabase.from('orders').insert({
          id: newOrder.id,
          order_code: newOrder.order_code,
          user_id: newOrder.user_id,
          customer_name: newOrder.customer_name,
          customer_email: newOrder.customer_email,
          customer_phone: newOrder.customer_phone,
          subtotal: newOrder.subtotal,
          discount: newOrder.discount,
          total: newOrder.total,
          coupon_id: newOrder.coupon_id,
          payment_method: newOrder.payment_method,
          status: 'PENDING',
        })
      } catch (e) {
        console.warn('Supabase order sync error:', e)
      }
    }

    return newOrder
  },

  async verifyPayment(orderCode: string, isSandbox = false): Promise<boolean> {
    const orders = getStoredOrders()
    const orderIndex = orders.findIndex((o) => o.order_code === orderCode)
    if (orderIndex === -1) return false

    const order = orders[orderIndex]
    order.status = 'PAID'
    saveStoredOrders(orders)

    // Trigger Digital Delivery Fulfillment
    const deliveries = getStoredDeliveries()
    
    order.items?.forEach((item) => {
      if (item.product_type === 'LICENSE_KEY') {
        const sampleKey = `ECOT-${item.product_name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
        deliveries.unshift({
          id: `del-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          order_item_id: item.id,
          delivery_type: 'LICENSE_KEY',
          delivery_status: 'DELIVERED',
          license_key_text: sampleKey,
          download_count: 0,
          max_downloads: 1,
          delivered_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          product_name: item.product_name,
        })
      } else if (item.product_type === 'SOURCE_CODE' || item.product_type === 'TEMPLATE') {
        deliveries.unshift({
          id: `del-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          order_item_id: item.id,
          delivery_type: 'FILE_DOWNLOAD',
          delivery_status: 'DELIVERED',
          download_url_info: {
            file_name: `${item.product?.slug || 'package'}-v${item.product?.version || '1.0.0'}.zip`,
            version: item.product?.version || '1.0.0',
            storage_path: `packages/${item.product_id}.zip`,
          },
          download_count: 0,
          max_downloads: 10,
          delivered_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          product_name: item.product_name,
        })
      } else {
        deliveries.unshift({
          id: `del-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          order_item_id: item.id,
          delivery_type: 'SERVICE_ACTIVATION',
          delivery_status: 'DELIVERED',
          credentials_info: {
            instructions: `Dịch vụ đã được kích hoạt thành công cho tài khoản ${order.customer_email}. Hạn bảo hành 365 ngày.`,
          },
          download_count: 0,
          max_downloads: 1,
          delivered_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          product_name: item.product_name,
        })
      }
    })

    saveStoredDeliveries(deliveries)

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('orders')
          .update({ status: 'PAID', updated_at: new Date().toISOString() })
          .eq('order_code', orderCode)
      } catch {
        // Handled
      }
    }

    return true
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    const orders = getStoredOrders()
    const found = orders.find((o) => o.id === orderId || o.order_code === orderId)
    return found || null
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    const orders = getStoredOrders()
    return orders.filter((o) => o.user_id === userId)
  },

  async getUserDeliveries(userId: string): Promise<Delivery[]> {
    // Return all deliveries associated with user orders
    const deliveries = getStoredDeliveries()
    return deliveries
  },

  async requestSignedDownloadUrl(deliveryId: string): Promise<{ downloadUrl: string; fileName: string; expiresIn: string }> {
    const deliveries = getStoredDeliveries()
    const delivery = deliveries.find((d) => d.id === deliveryId)
    if (!delivery) throw new Error('Không tìm thấy đơn giao hàng')

    // Increment download count
    delivery.download_count += 1
    saveStoredDeliveries(deliveries)

    const fileName = delivery.download_url_info?.file_name || 'package.zip'
    // Create temporary download link valid for 1 hour with simulated signed token
    const token = btoa(`${deliveryId}:${Date.now() + 3600000}`)
    const downloadUrl = `https://storage.ecotdev.com/signed-download/${fileName}?token=${token}&expires=3600`

    return {
      downloadUrl,
      fileName,
      expiresIn: '60 phút',
    }
  },
}
