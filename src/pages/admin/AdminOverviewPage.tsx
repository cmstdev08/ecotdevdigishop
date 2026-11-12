import React, { useEffect, useState } from 'react'
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react'
import { adminService } from '@/services/adminService'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

export const AdminOverviewPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await adminService.getDashboardStats()
        setStats(data)
      } finally {
        setIsLoading(false)
      }
    }
    loadStats()
  }, [])

  if (isLoading || !stats) {
    return <div className="p-8 text-center text-slate-400">Đang tổng hợp dữ liệu thống kê...</div>
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Dashboard Tổng Quan Doanh Thu & Hệ Thống
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Báo cáo thống kê hiệu suất kinh doanh thời gian thực từ Supabase PostgreSQL
        </p>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="rounded-2xl bg-card border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Tổng Doanh Thu</span>
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white font-mono">
              {formatCurrency(stats.totalRevenue)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% so với tháng trước</span>
          </div>
        </div>

        {/* Today Revenue */}
        <div className="rounded-2xl bg-card border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Doanh Thu Hôm Nay</span>
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-accent font-mono">
              {formatCurrency(stats.todayRevenue)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Tháng này: <strong className="text-slate-300 font-mono">{formatCurrency(stats.monthRevenue)}</strong>
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-2xl bg-card border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Đơn Hàng Thành Công</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {stats.paidOrders}
            </span>
            <span className="text-xs text-slate-400">/ {stats.totalOrders} đơn</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{stats.pendingOrders} đơn chờ thanh toán</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="rounded-2xl bg-card border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Khách Hàng Đăng Ký</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {stats.totalCustomers}
            </span>
            <span className="text-xs text-slate-400">Devs</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Tổng sản phẩm: <strong className="text-slate-200 font-mono">{stats.totalProducts}</strong>
          </div>
        </div>
      </div>

      {/* 2 Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Area Chart (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-card border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Biểu Đồ Doanh Thu 7 Ngày Gần Nhất</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Xu hướng thanh toán tự động qua VietQR & VNPay</p>
            </div>
            <span className="text-xs font-mono font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-lg border border-accent/20">
              VNĐ
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueChart}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#374151',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                  }}
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Doanh thu']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366F1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Sales Distribution (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-card border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Tỷ Lệ Bán Theo Danh Mục</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Phân bổ nguồn thu theo nhóm sản phẩm</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {stats.categoryDistribution.map((item: any, i: number) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.name}</span>
                  <span className="font-mono text-accent font-bold">{item.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-2xl bg-card border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Đơn Hàng Mới Nhất</h3>
          <span className="text-xs text-slate-400 font-mono">Tự động cập nhật</span>
        </div>

        <div className="divide-y divide-slate-800 text-xs">
          {stats.recentOrders.length === 0 ? (
            <div className="p-6 text-center text-slate-400">Chưa có đơn hàng phát sinh</div>
          ) : (
            stats.recentOrders.map((ord: any) => (
              <div key={ord.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-accent">{ord.order_code}</span>
                  <span className="text-slate-200">{ord.customer_name}</span>
                  <span className="text-slate-500 hidden md:inline">({ord.customer_email})</span>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant={ord.status === 'PAID' ? 'success' : 'warning'} size="sm">
                    {ord.status}
                  </Badge>
                  <span className="font-mono font-bold text-white">{formatCurrency(ord.total)}</span>
                  <span className="text-slate-500 text-[11px]">{formatDate(ord.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
