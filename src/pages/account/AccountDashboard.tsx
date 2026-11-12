import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Package,
  KeyRound,
  Download,
  ShoppingBag,
  Heart,
  User,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  LifeBuoy,
  LogOut,
  Calendar,
  AlertCircle,
  FileCode,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { orderService } from '@/services/orderService'
import { useWishlistStore } from '@/stores/useWishlistStore'
import { useCartStore } from '@/stores/useCartStore'
import { Order, Delivery, SupportTicket } from '@/types'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'sonner'

export const AccountDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { profile, updateProfile, signOut } = useAuth()
  const { wishlist, removeFromWishlist } = useWishlistStore()
  const { addItem } = useCartStore()

  const tabParam = searchParams.get('tab') || 'downloads'

  const [orders, setOrders] = useState<Order[]>([])
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState<string | null>(null)

  // Edit profile form state
  const [editName, setEditName] = useState(profile?.full_name || '')
  const [editPhone, setEditPhone] = useState(profile?.phone || '')
  const [editAvatar, setEditAvatar] = useState(profile?.avatar_url || '')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Support ticket form state
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 't-1',
      user_id: profile?.id || 'u-1',
      ticket_code: 'TCK-8821',
      subject: 'Hỗ trợ cấu hình Docker deploy cho E-Commerce Pro',
      content: 'Chào Admin, mình cần tư vấn cấu hình file docker-compose để chạy trên VPS Ubuntu 24.04.',
      status: 'RESOLVED',
      admin_response: 'Chào bạn, đội ngũ kỹ thuật đã gửi kèm file cấu hình docker-compose.prod.yml tối ưu qua email. Bạn vui lòng kiểm tra hộp thư nhé!',
      created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    },
  ])
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketContent, setTicketContent] = useState('')

  useEffect(() => {
    async function loadUserData() {
      if (!profile) return
      const [userOrders, userDels] = await Promise.all([
        orderService.getUserOrders(profile.id),
        orderService.getUserDeliveries(profile.id),
      ])
      setOrders(userOrders)
      setDeliveries(userDels)
    }
    loadUserData()
  }, [profile])

  const handleCopyKey = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKeyId(id)
    toast.success('Đã sao chép License Key vào bộ nhớ tạm!')
    setTimeout(() => setCopiedKeyId(null), 2000)
  }

  const handleDownloadFile = async (deliveryId: string) => {
    setIsDownloading(deliveryId)
    try {
      const res = await orderService.requestSignedDownloadUrl(deliveryId)
      toast.success(`Đang tải file ${res.fileName}...`, {
        description: `Link bảo mật có hiệu lực trong ${res.expiresIn}`,
      })
      // Open / trigger download
      window.open(res.downloadUrl, '_blank')
    } catch (err: any) {
      toast.error(err.message || 'Không thể tạo link tải xuống')
    } finally {
      setIsDownloading(null)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProfile(true)
    try {
      await updateProfile({
        full_name: editName,
        phone: editPhone,
        avatar_url: editAvatar,
      })
      toast.success('Đã cập nhật thông tin tài khoản thành công!')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketSubject.trim() || !ticketContent.trim()) return
    const newTicket: SupportTicket = {
      id: `t-${Date.now()}`,
      user_id: profile?.id || 'u-1',
      ticket_code: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: ticketSubject.trim(),
      content: ticketContent.trim(),
      status: 'OPEN',
      created_at: new Date().toISOString(),
    }
    setTickets([newTicket, ...tickets])
    setTicketSubject('')
    setTicketContent('')
    toast.success('Đã gửi yêu cầu hỗ trợ. Kỹ thuật viên sẽ phản hồi sớm!')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* User Header Profile Card */}
      <div className="rounded-3xl bg-card border border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <img
            src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
            alt={profile?.full_name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-primary/50 shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-xl sm:text-2xl font-black text-white">{profile?.full_name}</h1>
              <Badge variant="primary" size="sm">{profile?.role}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">{profile?.email}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Số điện thoại: {profile?.phone || 'Chưa cập nhật'}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-6 border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-8 text-center">
          <div>
            <div className="text-xl sm:text-2xl font-black text-accent font-mono">
              {deliveries.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Sản phẩm số</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-primary font-mono">
              {orders.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Đơn hàng</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
              {wishlist.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Yêu thích</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 sm:gap-3 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'downloads', label: 'Kho Lưu Trữ Sản Phẩm', icon: Package },
          { id: 'orders', label: 'Lịch Sử Đơn Hàng', icon: ShoppingBag },
          { id: 'profile', label: 'Hồ Sơ & Bảo Mật', icon: User },
          { id: 'wishlist', label: 'Danh Sách Yêu Thích', icon: Heart },
          { id: 'tickets', label: 'Yêu Cầu Hỗ Trợ', icon: LifeBuoy },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = tabParam === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition shrink-0 ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: DIGITAL VAULT & DOWNLOADS */}
      {tabParam === 'downloads' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-accent" />
              <span>Sản Phẩm Đã Mua & Giấy Phép Bản Quyền</span>
            </h2>
          </div>

          {deliveries.length === 0 ? (
            <div className="p-8 text-center bg-card border border-slate-800 rounded-3xl">
              <Package className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-xs text-slate-400 mb-4">Bạn chưa sở hữu sản phẩm nào trong kho lưu trữ.</p>
              <Link to="/products">
                <Button size="sm" variant="primary">Mua sắm sản phẩm</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deliveries.map((del) => (
                <div key={del.id} className="rounded-2xl bg-card border border-slate-800 p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge variant="accent" size="sm">{del.delivery_type}</Badge>
                      <h3 className="font-bold text-white text-sm mt-2">{del.product_name || 'Gói kỹ thuật số'}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Bàn giao lúc: {formatDate(del.delivered_at || del.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Type Content: License key vs File Download */}
                  {del.delivery_type === 'LICENSE_KEY' ? (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">License Key Bản Quyền:</span>
                      <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-accent/40">
                        <span className="font-mono text-xs font-bold text-accent truncate">
                          {del.license_key_text}
                        </span>
                        <button
                          onClick={() => handleCopyKey(del.id, del.license_key_text || '')}
                          className="p-1 text-slate-400 hover:text-white ml-2 shrink-0"
                          title="Sao chép"
                        >
                          {copiedKeyId === del.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-mono font-bold text-slate-200">
                          {del.download_url_info?.file_name || 'source-code.zip'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Đã tải: {del.download_count}/{del.max_downloads} lượt
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="primary"
                        isLoading={isDownloading === del.id}
                        onClick={() => handleDownloadFile(del.id)}
                        className="text-xs font-semibold"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        <span>Tải về (Signed URL)</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ORDERS HISTORY */}
      {tabParam === 'orders' && (
        <div className="rounded-3xl bg-card border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-slate-800 font-bold text-sm text-white">
            Danh Sách Đơn Hàng Của Bạn
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Bạn chưa có đơn hàng nào.
            </div>
          ) : (
            <div className="divide-y divide-slate-800 text-xs">
              {orders.map((order) => (
                <div key={order.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-accent text-sm">{order.order_code}</span>
                      <Badge variant={order.status === 'PAID' ? 'success' : 'warning'} size="sm">
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Ngày đặt: {formatDate(order.created_at)} • Cổng: {order.payment_method}
                    </p>
                    <div className="mt-2 space-y-0.5">
                      {order.items?.map((it, i) => (
                        <p key={i} className="text-slate-300">
                          • {it.product_name} (x{it.quantity})
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">Tổng thanh toán:</span>
                    <span className="font-mono font-bold text-base text-white">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROFILE & SECURITY */}
      {tabParam === 'profile' && (
        <div className="max-w-xl mx-auto rounded-3xl bg-card border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
          <h2 className="text-base font-bold text-white tracking-tight">Cập Nhật Thông Tin Cá Nhân</h2>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Họ và tên</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Email đăng nhập (Cố định)</label>
              <input
                type="email"
                disabled
                value={profile?.email}
                className="w-full rounded-xl bg-slate-900/50 border border-slate-800 px-3.5 py-2.5 text-slate-500 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Số điện thoại</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Avatar URL</label>
              <input
                type="url"
                value={editAvatar}
                onChange={(e) => setEditAvatar(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-slate-100"
              />
            </div>

            <Button type="submit" variant="primary" isLoading={isSavingProfile} className="w-full">
              Lưu thay đổi thông tin
            </Button>
          </form>
        </div>
      )}

      {/* TAB 4: WISHLIST */}
      {tabParam === 'wishlist' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <span>Sản Phẩm Đang Theo Dõi ({wishlist.length})</span>
          </h2>

          {wishlist.length === 0 ? (
            <div className="p-8 text-center bg-card border border-slate-800 rounded-3xl text-xs text-slate-400">
              Danh sách yêu thích của bạn chưa có sản phẩm nào.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlist.map((prod) => (
                <div key={prod.id} className="rounded-2xl bg-card border border-slate-800 p-4 space-y-3">
                  <img
                    src={prod.thumbnail}
                    alt={prod.name}
                    className="w-full aspect-[16/10] object-cover rounded-xl bg-slate-900"
                  />
                  <h4 className="font-semibold text-white text-xs line-clamp-2">{prod.name}</h4>
                  <div className="text-xs font-bold text-accent font-mono">
                    {formatCurrency(prod.sale_price ?? prod.price)}
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => addItem(prod, 1)}
                      className="flex-1 text-xs"
                    >
                      Thêm vào giỏ
                    </Button>
                    <button
                      onClick={() => removeFromWishlist(prod.id)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-rose-400 text-xs"
                    >
                      Bỏ lưu
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SUPPORT TICKETS */}
      {tabParam === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* New Ticket Form (5 cols) */}
          <form onSubmit={handleCreateTicket} className="lg:col-span-5 rounded-3xl bg-card border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-accent" />
              <span>Gửi Yêu Cầu Hỗ Trợ Kỹ Thuật</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Tiêu đề yêu cầu</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cần hỗ trợ deploy mã nguồn lên máy chủ"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Nội dung chi tiết</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Mô tả cụ thể lỗi gặp phải hoặc câu hỏi cần giải đáp..."
                  value={ticketContent}
                  onChange={(e) => setTicketContent(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3.5 text-slate-100"
                />
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full font-bold">
                Gửi Ticket Hỗ Trợ
              </Button>
            </div>
          </form>

          {/* Existing Tickets (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-bold text-white">Lịch Sử Yêu Cầu Của Bạn</h3>
            {tickets.map((t) => (
              <div key={t.id} className="rounded-2xl bg-card border border-slate-800 p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-accent">{t.ticket_code}</span>
                    <Badge variant={t.status === 'RESOLVED' ? 'success' : 'warning'} size="sm">
                      {t.status}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-500">{formatDate(t.created_at)}</span>
                </div>

                <h4 className="font-bold text-white text-sm">{t.subject}</h4>
                <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  {t.content}
                </p>

                {t.admin_response && (
                  <div className="mt-3 p-3.5 rounded-xl bg-primary/10 border border-primary/30 space-y-1">
                    <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Phản hồi từ Kỹ thuật viên ECOTDEV:
                    </span>
                    <p className="text-slate-200 leading-relaxed">{t.admin_response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
