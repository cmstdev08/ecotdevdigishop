import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ShoppingCart,
  Heart,
  Search,
  Sun,
  Moon,
  User,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  Package,
  KeyRound,
  Menu,
  X,
  Code2,
} from 'lucide-react'
import { useCartStore } from '@/stores/useCartStore'
import { useWishlistStore } from '@/stores/useWishlistStore'
import { useThemeStore } from '@/stores/useThemeStore'
import { useAuth } from '@/contexts/AuthContext'
import { RoleSwitcher } from './RoleSwitcher'

export const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { getTotalItems } = useCartStore()
  const { wishlist } = useWishlistStore()
  const { theme, toggleTheme } = useThemeStore()
  const { profile, signOut, isStaff } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const cartCount = getTotalItems()
  const wishlistCount = wishlist.length

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsMobileMenuOpen(false)
    }
  }

  const navLinks = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Sản phẩm', path: '/products' },
    { label: 'Source Code', path: '/products?type=SOURCE_CODE' },
    { label: 'Templates', path: '/products?type=TEMPLATE' },
    { label: 'License Keys', path: '/products?type=LICENSE_KEY' },
    { label: 'Hỗ trợ & FAQ', path: '/support' },
  ]

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname + location.search === path) return true
    return false
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-brand-darkBg/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center p-0.5 shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-brand-darkBg rounded-[10px] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-accent" />
              </div>
            </div>
            <div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center">
                ECOT<span className="text-accent">DEV</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block -mt-1">
                Digital Store
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive(link.path)
                    ? 'text-accent bg-accent/10 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xs relative">
            <input
              type="text"
              placeholder="Tìm source code, key, template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-900/90 border border-slate-700/80 pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* RBAC Role Switcher */}
            <RoleSwitcher />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Đổi theme"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
            </button>

            {/* Wishlist Link */}
            <Link
              to="/account/wishlist"
              className="relative p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition"
              title="Danh sách yêu thích"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-slate-800/60 transition"
              title="Giỏ hàng"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account / Auth Dropdown */}
            {profile ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/60 transition"
                >
                  <img
                    src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={profile.full_name}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                  />
                  <span className="hidden sm:inline text-xs font-medium text-slate-200 max-w-[100px] truncate">
                    {profile.full_name}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-brand-darkCard border border-slate-700 shadow-2xl p-2 z-40 space-y-1">
                      <div className="px-3 py-2 border-b border-slate-800">
                        <p className="text-xs font-semibold text-slate-100">{profile.full_name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{profile.email}</p>
                      </div>

                      {isStaff && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-amber-400 hover:bg-amber-500/10 transition"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      <Link
                        to="/account"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-primary" />
                        <span>Tổng quan tài khoản</span>
                      </Link>

                      <Link
                        to="/account/downloads"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                      >
                        <Package className="w-4 h-4 text-cyan-400" />
                        <span>Kho sản phẩm đã mua</span>
                      </Link>

                      <Link
                        to="/account/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                      >
                        <KeyRound className="w-4 h-4 text-emerald-400" />
                        <span>Lịch sử đơn hàng</span>
                      </Link>

                      <div className="border-t border-slate-800 pt-1">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            signOut()
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/auth/login"
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/auth/register"
                  className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-semibold shadow-md shadow-primary/20 transition"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 pl-9 pr-4 py-2 text-xs text-slate-100"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive(link.path)
                      ? 'text-accent bg-accent/10'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {isStaff && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-amber-400 bg-amber-500/10"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
