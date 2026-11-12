import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Tag,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { useCartStore } from '@/stores/useCartStore'
import { formatCurrency } from '@/utils/formatters'
import { Button } from '@/components/ui/Button'
import { INITIAL_COUPONS } from '@/data/mockData'
import { toast } from 'sonner'

export const CartPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    items,
    removeItem,
    updateQuantity,
    coupon,
    applyCoupon,
    clearCart,
    getSubtotal,
    getDiscount,
    getTotal,
  } = useCartStore()

  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')

  const subtotal = getSubtotal()
  const discount = getDiscount()
  const total = getTotal()

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    setCouponError('')
    const code = couponInput.trim().toUpperCase()
    if (!code) return

    const matched = INITIAL_COUPONS.find((c) => c.code === code && c.is_active)
    if (!matched) {
      setCouponError('Mã giảm giá không tồn tại hoặc đã hết hạn!')
      return
    }

    if (subtotal < matched.min_order_value) {
      setCouponError(`Đơn hàng phải tối thiểu ${formatCurrency(matched.min_order_value)} để áp dụng mã này!`)
      return
    }

    applyCoupon(matched)
    setCouponInput('')
    toast.success(`Đã áp dụng mã giảm giá: ${matched.code}`)
  }

  const handleRemoveCoupon = () => {
    applyCoupon(null)
    toast.info('Đã hủy áp dụng mã giảm giá')
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 sm:p-12 text-center bg-card border border-slate-800 rounded-3xl shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Giỏ hàng của bạn đang trống</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
          Chưa có sản phẩm kỹ thuật số nào trong giỏ hàng. Hãy khám phá kho source code và license key chất lượng cao của chúng tôi.
        </p>
        <Link to="/products">
          <Button variant="primary">Khám phá sản phẩm ngay</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-8 flex items-center gap-2">
        <ShoppingBag className="w-7 h-7 text-primary" />
        <span>Giỏ Hàng Của Bạn</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-3xl bg-card border border-slate-800 overflow-hidden">
            <div className="divide-y divide-slate-800">
              {items.map((item) => {
                const effectivePrice = item.product.sale_price !== null && item.product.sale_price !== undefined
                  ? Number(item.product.sale_price)
                  : Number(item.product.price)
                return (
                  <div key={item.product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={item.product.thumbnail}
                      alt={item.product.name}
                      className="w-20 h-16 rounded-xl object-cover bg-slate-900 shrink-0 border border-slate-800"
                    />

                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <Link
                        to={`/products/${item.product.slug}`}
                        className="text-sm font-bold text-white hover:text-primary transition line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <span className="text-[11px] font-mono text-cyan-400 block mt-0.5">
                        {item.product.product_type}
                      </span>
                      <div className="text-xs font-semibold text-accent mt-1">
                        {formatCurrency(effectivePrice)}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right sm:w-28 font-bold text-sm text-white font-mono">
                      {formatCurrency(effectivePrice * item.quantity)}
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="p-4 bg-slate-950/40 border-t border-slate-800 flex justify-between items-center text-xs">
              <Link to="/products" className="text-slate-400 hover:text-white">
                ← Tiếp tục xem sản phẩm khác
              </Link>
              <button
                onClick={clearCart}
                className="text-slate-500 hover:text-rose-400 font-semibold"
              >
                Xóa toàn bộ giỏ hàng
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary & Coupon (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-card border border-slate-800 p-6 space-y-6 shadow-2xl">
          <h2 className="text-base font-bold text-white tracking-tight">Tóm Tắt Đơn Hàng</h2>

          {/* Coupon Input */}
          <div>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Mã giảm giá (ECOTDEV10)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white placeholder:text-slate-500 font-mono uppercase focus:outline-none focus:border-accent"
              />
              <Button type="submit" variant="secondary" size="sm">
                Áp dụng
              </Button>
            </form>
            {couponError && <p className="text-[11px] text-rose-400 mt-1.5">{couponError}</p>}

            {/* Applied Coupon Tag */}
            {coupon && (
              <div className="mt-3 p-3 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-between text-xs text-accent">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4" />
                  <span className="font-mono font-bold">{coupon.code}</span>
                  <span className="text-[11px] text-slate-400">(-{coupon.discount_value}%)</span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-slate-400 hover:text-rose-400 text-[11px]"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>

          {/* Calculations */}
          <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Tạm tính ({items.length} món)</span>
              <span className="text-slate-200 font-mono font-semibold">{formatCurrency(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Tiết kiệm</span>
                <span className="font-mono">-{formatCurrency(discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-400">
              <span>Phí giao hàng</span>
              <span className="text-emerald-400 font-semibold">Miễn phí (Tự động 0đ)</span>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
              <span className="text-sm font-bold text-white">Tổng thanh toán</span>
              <span className="text-2xl font-black text-accent font-mono">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <Button
            onClick={() => navigate('/checkout')}
            size="lg"
            variant="primary"
            className="w-full text-sm font-bold glow-primary"
          >
            <span>Tiến Hành Thanh Toán</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Thanh toán bảo mật chuẩn SSL 256-bit, giao hàng tự động tức thì.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
