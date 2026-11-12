import React, { useEffect, useState } from 'react'
import { CreditCard, CheckCircle2, Clock, ShieldCheck, Search } from 'lucide-react'
import { adminService } from '@/services/adminService'
import { Order } from '@/types'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { Badge } from '@/components/ui/Badge'

export const AdminPaymentsPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadData() {
      const allOrders = await adminService.getAllOrders()
      setOrders(allOrders)
    }
    loadData()
  }, [])

  const filtered = orders.filter(
    (o) =>
      o.order_code.toLowerCase().includes(search.toLowerCase()) ||
      o.payment_method.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-accent" />
          <span>Lịch Sử Giao Dịch & Xác Minh Cổng Thanh Toán</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Nhật ký giao dịch chuyển khoản VietQR, VNPay và MoMo với mã định danh duy nhất
        </p>
      </div>

      <div className="relative max-w-sm">
        <input
          type="text"
          placeholder="Tìm theo mã đơn hoặc cổng thanh toán..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl bg-slate-900 border border-slate-700/80 pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      <div className="rounded-2xl bg-card border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Mã Giao Dịch / Đơn Hàng</th>
                <th className="p-4">Người thanh toán</th>
                <th className="p-4">Cổng giao dịch</th>
                <th className="p-4">Số tiền xác minh</th>
                <th className="p-4">Trạng thái thanh toán</th>
                <th className="p-4">Thời gian ghi nhận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-850/40 transition">
                  <td className="p-4">
                    <span className="font-mono text-white font-bold block">TXN-{ord.order_code}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">Đơn: {ord.order_code}</span>
                  </td>

                  <td className="p-4">
                    <div className="font-semibold text-white">{ord.customer_name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{ord.customer_email}</div>
                  </td>

                  <td className="p-4">
                    <Badge variant="primary" size="sm">{ord.payment_method}</Badge>
                  </td>

                  <td className="p-4 font-mono font-bold text-accent">
                    {formatCurrency(ord.total)}
                  </td>

                  <td className="p-4">
                    <Badge variant={ord.status === 'PAID' ? 'success' : 'warning'} size="sm">
                      {ord.status === 'PAID' ? 'THÀNH CÔNG (SUCCESS)' : 'CHỜ XÁC MINH'}
                    </Badge>
                  </td>

                  <td className="p-4 text-slate-500 font-mono text-[11px]">
                    {formatDate(ord.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
