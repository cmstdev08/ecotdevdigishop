import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product, Coupon } from '@/types'

interface CartState {
  items: CartItem[]
  coupon: Coupon | null
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  applyCoupon: (coupon: Coupon | null) => void
  clearCart: () => void
  getSubtotal: () => number
  getDiscount: () => number
  getTotal: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

      addItem: (product, quantity = 1) => {
        const currentItems = get().items
        const existingIndex = currentItems.findIndex((item) => item.product.id === product.id)

        if (existingIndex > -1) {
          // If product type is single license or account, limit quantity or increase
          const updated = [...currentItems]
          updated[existingIndex].quantity += quantity
          set({ items: updated })
        } else {
          set({ items: [...currentItems, { product, quantity }] })
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.product.id !== productId),
        })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        })
      },

      applyCoupon: (coupon) => {
        set({ coupon })
      },

      clearCart: () => {
        set({ items: [], coupon: null })
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const effectivePrice = item.product.sale_price !== null && item.product.sale_price !== undefined
            ? Number(item.product.sale_price)
            : Number(item.product.price)
          return sum + effectivePrice * item.quantity
        }, 0)
      },

      getDiscount: () => {
        const subtotal = get().getSubtotal()
        const coupon = get().coupon
        if (!coupon || !coupon.is_active || subtotal < coupon.min_order_value) return 0

        if (coupon.discount_type === 'PERCENTAGE') {
          const calculated = (subtotal * coupon.discount_value) / 100
          if (coupon.max_discount_amount) {
            return Math.min(calculated, coupon.max_discount_amount)
          }
          return calculated
        } else {
          return Math.min(coupon.discount_value, subtotal)
        }
      },

      getTotal: () => {
        const subtotal = get().getSubtotal()
        const discount = get().getDiscount()
        return Math.max(0, subtotal - discount)
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'ecotdev-cart-storage',
    }
  )
)
