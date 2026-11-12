import React, { useEffect, useState } from 'react'
import {
  ShoppingBag,
  Search,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react'
import { adminService } from '@/services/adminService'
import { Order, OrderStatus } from '@/types'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { toast } from 'sonner'

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  // View modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadOrders = async () => {
    setIsLoading(true)
    try {
      const data = await adminService.getAllOrders()
      setOrders(data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus)
      toast.success(`Đã cập nhật trạng thái đơn hàng sang: ${newStatus}`)
      loadOrders()
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi cập nhật trạng thái')
    }
  }

  const exportCSV = () => {
    const headers = ['Order Code', 'Customer', 'Email', 'Total', 'Payment Method', 'Status', 'Date']
    const rows = orders.map((o) => [
      o.order_code,
      o.customer_name,
      o.customer_email,
      o.total,
      o.payment_method,
      o.status,
      o.created_at,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `ecotdev_orders_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Đã xuất dữ liệu đơn hàng thành công ra file CSV!')
  }

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_code.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <span>Quản Lý Đơn Hàng & Giao Dịch</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Theo dõi luồng thanh toán, chuyển trạng thái đơn hàng và xử lý giao hàng số
          </p>
        </div>

        <Button onClick={exportCSV} variant="outline" size="md" className="shrink-0 text-xs">
          <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-400" />
          <span>Xuất File CSV</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-card border border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Tìm theo mã đơn, email, họ tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-700/80 pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-slate-200"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="PENDING">PENDING (Chờ thanh toán)</option>
          <option value="PAID">PAID (Đã thanh toán)</option>
          <option value="COMPLETED">COMPLETED (Hoàn tất)</option>
          <option value="CANCELLED">CANCELLED (Đã hủy)</option>
          <option value="REFUNDED">REFUNDED (Đã hoàn tiền)</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-card border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Mã đơn hàng</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Cổng thanh toán</th>
                <th className="p-4">Tổng tiền</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Thời gian</th>
                <th className="p-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Không tìm thấy đơn hàng nào
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-850/40 transition">
                    <td className="p-4 font-mono font-bold text-accent">
                      {ord.order_code}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{ord.customer_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{ord.customer_email}</div>
                    </td>
                    <td className="p-4 font-mono text-slate-400">
                      {ord.payment_method}
                    </td>
                    <td className="p-4 font-mono font-bold text-white">
                      {formatCurrency(ord.total)}
                    </td>
                    <td className="p-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value as any)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border ${
                          ord.status === 'PAID' || ord.status === 'COMPLETED'
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                            : ord.status === 'REFUNDED'
                            ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                            : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                        }`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PAID">PAID</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="REFUNDED">REFUNDED</option>
                      </select>
                    </td>
                    <td className="p-4 text-slate-500 text-[11px]">
                      {formatDate(ord.created_at)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(ord)
                          setIsModalOpen(true)
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Chi Tiết Đơn Hàng: ${selectedOrder?.order_code}`}
        maxWidth="lg"
      >
        {selectedOrder && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Khách hàng:</span>
                <span className="font-bold text-white">{selectedOrder.customer_name}</span>
                <span className="text-slate-500 block font-mono text-[10px]">{selectedOrder.customer_email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Số điện thoại:</span>
                <span className="font-mono text-slate-200">{selectedOrder.customer_phone || 'N/A'}</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-200 block mb-2">Danh sách sản phẩm mua:</span>
              <div className="rounded-xl border border-slate-800 divide-y divide-slate-800 overflow-hidden">
                {selectedOrder.items?.map((it, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{it.product_name}</p>
                      <span className="text-[10px] text-cyan-400 font-mono">
                        Số lượng: {it.quantity} x {formatCurrency(it.unit_price)}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-100">
                      {formatCurrency(it.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Tạm tính</span>
                <span className="font-mono">{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Giảm giá</span>
                <span className="font-mono">-{formatCurrency(selectedOrder.discount)}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-800">
                <span>Tổng cộng</span>
                <span className="font-mono text-accent text-base">{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setIsModalOpen(false)} variant="primary" size="sm">
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
