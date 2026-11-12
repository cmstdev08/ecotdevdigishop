import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Copy,
  Check,
  CreditCard,
  Smartphone,
  Building,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { useCartStore } from '@/stores/useCartStore'
import { useAuth } from '@/contexts/AuthContext'
import { orderService } from '@/services/orderService'
import { PaymentMethod, Order } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { Button } from '@/components/ui/Button'
import { INITIAL_SETTINGS } from '@/data/mockData'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const { items, coupon, getSubtotal, getDiscount, getTotal, clearCart } = useCartStore()
  const { profile } = useAuth()

  const [customerName, setCustomerName] = useState(profile?.full_name || 'Nguyễn Văn Khách Hàng')
  const [customerEmail, setCustomerEmail] = useState(profile?.email || 'customer@gmail.com')
  const [customerPhone, setCustomerPhone] = useState(profile?.phone || '0981234567')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER')
  const [termsAccepted, setTermsAccepted] = useState(true)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null)
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false)
  const [copiedMemo, setCopiedMemo] = useState(false)

  const subtotal = getSubtotal()
  const discount = getDiscount()
  const total = getTotal()

  if (items.length === 0 && !createdOrder) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-card border border-slate-800 rounded-3xl">
        <h2 className="text-xl font-bold text-white mb-2">Giỏ hàng trống</h2>
        <p className="text-xs text-slate-400 mb-6">Bạn chưa có sản phẩm nào để tiến hành thanh toán.</p>
        <Link to="/products">
          <Button variant="primary">Khám phá sản phẩm</Button>
        </Link>
      </div>
    )
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerEmail.trim()) {
      toast.error('Vui lòng nhập email để nhận link tải và license key!')
      return
    }

    setIsSubmitting(true)
    try {
      const order = await orderService.createOrder({
        userId: profile?.id || 'u-guest',
        customerName,
        customerEmail,
        customerPhone,
        items,
        couponId: coupon?.id,
        discount,
        paymentMethod,
      })
      setCreatedOrder(order)
      clearCart()
      toast.success('Đơn hàng đã được tạo thành công!', { description: `Mã đơn: ${order.order_code}` })
    } catch (err: any) {
      toast.error(err.message || 'Không thể tạo đơn hàng')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Simulated Webhook Verification for Test / Production Sandbox
  const handleVerifyPayment = async () => {
    if (!createdOrder) return
    setIsVerifyingPayment(true)
    try {
      const success = await orderService.verifyPayment(createdOrder.order_code, true)
      if (success) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        })
        toast.success('Thanh toán thành công! Sản phẩm đã được bàn giao tự động.')
        setTimeout(() => {
          navigate('/account/downloads')
        }, 1500)
      }
    } catch (err: any) {
      toast.error(err.message || 'Chưa nhận được giao dịch. Vui lòng thử lại sau 30 giây!')
    } finally {
      setIsVerifyingPayment(false)
    }
  }

  const handleCopyMemo = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedMemo(true)
    toast.success('Đã sao chép nội dung chuyển khoản!')
    setTimeout(() => setCopiedMemo(false), 2000)
  }

  // VietQR generation url (NAPAS standard)
  const vietQrUrl = createdOrder
    ? `https://img.vietqr.io/image/970407-19036888999999-compact2.png?amount=${createdOrder.total}&addInfo=${createdOrder.order_code}&accountName=CONG%20TY%20TNHH%20CONG%20NGHE%20ECOTDEV`
    : ''

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-8 flex items-center gap-2">
        <Lock className="w-7 h-7 text-accent" />
        <span>Thanh Toán Đơn Hàng An Toàn</span>
      </h1>

      {createdOrder ? (
        /* STEP 2: PAYMENT COMPLETION & QR DISPLAY */
        <div className="max-w-3xl mx-auto bg-card border border-primary/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Đơn hàng đang chờ thanh toán
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Mã đơn hàng: <span className="font-mono text-accent">{createdOrder.order_code}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Quý khách vui lòng quét mã VietQR hoặc chuyển khoản đúng số tiền và nội dung bên dưới.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4 border-t border-slate-800">
            {/* VietQR Code */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-xl">
              <img
                src={vietQrUrl}
                alt="VietQR Code"
                className="w-full max-w-[260px] aspect-square object-contain"
              />
              <span className="text-[11px] font-bold text-slate-800 mt-2">
                Quét bằng mọi ứng dụng ngân hàng hoặc MoMo
              </span>
            </div>

            {/* Transfer details */}
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">Ngân hàng:</span>
                  <span className="font-bold text-white">Techcombank (Ngân hàng TMCP Kỹ thương VN)</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Số tài khoản:</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-bold text-accent">19036888999999</span>
                    <button
                      onClick={() => handleCopyMemo('19036888999999')}
                      className="p-1 hover:text-white text-slate-400"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Chủ tài khoản:</span>
                  <span className="font-semibold text-slate-200">CONG TY TNHH CONG NGHE ECOTDEV</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Số tiền chính xác:</span>
                  <span className="font-mono text-lg font-black text-accent">
                    {formatCurrency(createdOrder.total)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Nội dung chuyển khoản (bắt buộc):</span>
                  <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-primary/40 mt-1">
                    <span className="font-mono font-bold text-primary-300 text-sm">
                      {createdOrder.order_code}
                    </span>
                    <button
                      onClick={() => handleCopyMemo(createdOrder.order_code)}
                      className="flex items-center gap-1 text-[11px] text-accent hover:underline"
                    >
                      {copiedMemo ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedMemo ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulated verification button */}
              <div className="space-y-2">
                <Button
                  onClick={handleVerifyPayment}
                  isLoading={isVerifyingPayment}
                  variant="primary"
                  size="lg"
                  className="w-full text-xs font-bold glow-primary"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  <span>Xác Nhận Đã Chuyển Khoản (Tự động kích hoạt)</span>
                </Button>
                <p className="text-[10px] text-slate-500 text-center">
                  Hệ thống tự động lắng nghe Webhook ngân hàng. Bạn có thể bấm nút trên để kiểm tra xác thực ngay lập tức.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 1: CHECKOUT FORM */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Customer info & payment options (7 cols) */}
          <form onSubmit={handleCreateOrder} className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl bg-card border border-slate-800 p-6 sm:p-8 space-y-4">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>1. Thông Tin Nhận Hàng Kỹ Thuật Số</span>
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Họ và tên của bạn</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Email nhận mã nguồn / License key *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-slate-100 font-mono"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Đường dẫn tải file ZIP và mã bản quyền sẽ được gửi về email này.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Số điện thoại (Zalo)</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-slate-100 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="rounded-3xl bg-card border border-slate-800 p-6 sm:p-8 space-y-4">
              <h2 className="text-base font-bold text-white tracking-tight">
                2. Phương Thức Thanh Toán
              </h2>

              <div className="space-y-3">
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === 'BANK_TRANSFER'
                      ? 'bg-primary/10 border-primary text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'BANK_TRANSFER'}
                      onChange={() => setPaymentMethod('BANK_TRANSFER')}
                      className="text-primary focus:ring-0"
                    />
                    <Building className="w-5 h-5 text-accent" />
                    <div>
                      <span className="font-bold text-xs text-slate-100 block">Chuyển khoản VietQR tự động</span>
                      <span className="text-[11px] text-slate-400">Quét mã QR từ mọi ngân hàng, tự động xác nhận 15s</span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">Khuyên dùng</span>
                </label>

                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === 'VNPAY'
                      ? 'bg-primary/10 border-primary text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'VNPAY'}
                      onChange={() => setPaymentMethod('VNPAY')}
                      className="text-primary focus:ring-0"
                    />
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <span className="font-bold text-xs text-slate-100 block">Cổng VNPay (Thẻ ATM/Visa/Mastercard)</span>
                      <span className="text-[11px] text-slate-400">Thanh toán qua cổng trực tuyến bảo mật</span>
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === 'MOMO'
                      ? 'bg-primary/10 border-primary text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'MOMO'}
                      onChange={() => setPaymentMethod('MOMO')}
                      className="text-primary focus:ring-0"
                    />
                    <Smartphone className="w-5 h-5 text-rose-400" />
                    <div>
                      <span className="font-bold text-xs text-slate-100 block">Ví Điện Tử MoMo</span>
                      <span className="text-[11px] text-slate-400">Quét mã MoMo hoặc liên kết ví</span>
                    </div>
                  </div>
                </label>
              </div>

              {/* Terms checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="rounded text-primary focus:ring-0"
                  />
                  <span>
                    Tôi đồng ý với <Link to="/support#terms" className="text-accent underline">Điều khoản dịch vụ</Link> và <Link to="/support#refund-policy" className="text-accent underline">Chính sách bảo hành sản phẩm số</Link>.
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                size="lg"
                variant="primary"
                disabled={!termsAccepted}
                isLoading={isSubmitting}
                className="w-full text-sm font-bold glow-primary mt-4"
              >
                <span>Xác Nhận Đặt Hàng & Thanh Toán</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>

          {/* Order Review Summary (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl bg-card border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-white tracking-tight">Chi Tiết Đơn Hàng</h2>

            <div className="divide-y divide-slate-800">
              {items.map((item) => {
                const effectivePrice = item.product.sale_price !== null && item.product.sale_price !== undefined
                  ? Number(item.product.sale_price)
                  : Number(item.product.price)
                return (
                  <div key={item.product.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-200 line-clamp-1">{item.product.name}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        SL: {item.quantity} x {formatCurrency(effectivePrice)}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-100">
                      {formatCurrency(effectivePrice * item.quantity)}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Tạm tính</span>
                <span className="font-mono text-slate-200">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Giảm giá ({coupon?.code})</span>
                  <span className="font-mono">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Tổng cần thanh toán</span>
                <span className="text-2xl font-black text-accent font-mono">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
