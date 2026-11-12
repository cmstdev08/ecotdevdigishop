import React, { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  KeyRound,
  ShoppingBag,
  Users,
  FolderTree,
  Tag,
  CreditCard,
  MessageSquare,
  Settings,
  ArrowLeft,
  ShieldCheck,
  Menu,
  X,
  Bell,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { RoleSwitcher } from '@/components/common/RoleSwitcher'
import { Toaster } from 'sonner'

export const AdminLayout: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, isStaff, signOut } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Strict RBAC protection check
  if (!isStaff) {
    return (
      <div className="min-h-screen bg-brand-darkBg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-brand-darkCard border border-rose-500/30 rounded-2xl p-6 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Quyền truy cập bị từ chối</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Tài khoản hiện tại của bạn không có quyền Quản trị viên (Admin/Staff). Hãy sử dụng nút <strong>Role Switcher</strong> trên góc phải để đổi sang SUPER_ADMIN hoặc ADMIN.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <RoleSwitcher />
            <Link
              to="/"
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-600 transition"
            >
              Về trang chủ khách hàng
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const menuItems = [
    { label: 'Tổng quan', path: '/admin', icon: LayoutDashboard },
    { label: 'Sản phẩm', path: '/admin/products', icon: Package },
    { label: 'Kho số & License', path: '/admin/inventory', icon: KeyRound },
    { label: 'Đơn hàng', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Khách hàng', path: '/admin/customers', icon: Users },
    { label: 'Danh mục', path: '/admin/categories', icon: FolderTree },
    { label: 'Mã giảm giá', path: '/admin/coupons', icon: Tag },
    { label: 'Giao dịch', path: '/admin/payments', icon: CreditCard },
    { label: 'Đánh giá', path: '/admin/reviews', icon: MessageSquare },
    { label: 'Cài đặt hệ thống', path: '/admin/settings', icon: Settings },
  ]

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-brand-darkBg text-foreground flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-brand-darkCard shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center p-0.5">
              <span className="font-mono font-black text-white text-xs">EC</span>
            </div>
            <div>
              <span className="font-extrabold text-white text-sm">ECOTDEV ADMIN</span>
              <span className="block text-[10px] text-accent font-mono">Control Center</span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                  active
                    ? 'bg-primary text-white font-semibold shadow-md shadow-primary/25'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom User info & exit */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
          <div className="flex items-center gap-2.5">
            <img
              src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={profile?.full_name}
              className="w-9 h-9 rounded-xl object-cover border border-slate-700"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-100 truncate">{profile?.full_name}</p>
              <p className="text-[10px] text-accent font-mono">{profile?.role}</p>
            </div>
          </div>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về Customer Store</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-slate-800/80 bg-brand-darkCard/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Bảng Quản Trị Hệ Thống</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <RoleSwitcher />

            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Xem Cửa Hàng</span>
            </Link>

            <button
              onClick={() => {
                signOut()
                navigate('/')
              }}
              title="Đăng xuất"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile Drawer Menu */}
        {isSidebarOpen && (
          <div className="md:hidden border-b border-slate-800 bg-brand-darkCard p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium ${
                    active ? 'bg-primary text-white font-semibold' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          className: 'bg-brand-darkCard border border-slate-700 text-slate-100 text-xs shadow-2xl',
        }}
      />
    </div>
  )
}
