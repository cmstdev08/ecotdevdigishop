import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { CustomerLayout } from '@/layouts/CustomerLayout'
import { AdminLayout } from '@/layouts/AdminLayout'

// Customer pages
import { HomePage } from '@/pages/home/HomePage'
import { ProductListPage } from '@/pages/products/ProductListPage'
import { ProductDetailPage } from '@/pages/products/ProductDetailPage'
import { CartPage } from '@/pages/cart/CartPage'
import { CheckoutPage } from '@/pages/checkout/CheckoutPage'
import { AccountDashboard } from '@/pages/account/AccountDashboard'
import { SupportPage } from '@/pages/support/SupportPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'

// Admin pages
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage'
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage'
import { AdminInventoryPage } from '@/pages/admin/AdminInventoryPage'
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage'
import { AdminCustomersPage } from '@/pages/admin/AdminCustomersPage'
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage'
import { AdminCouponsPage } from '@/pages/admin/AdminCouponsPage'
import { AdminPaymentsPage } from '@/pages/admin/AdminPaymentsPage'
import { AdminReviewsPage } from '@/pages/admin/AdminReviewsPage'
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage'

// 404 Page
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'

const NotFoundPage: React.FC = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
    <div className="font-mono text-7xl font-black text-accent mb-2">404</div>
    <h2 className="text-xl font-bold text-white mb-2">Trang Không Tồn Tại</h2>
    <p className="text-xs text-slate-400 mb-6 max-w-sm">
      Đường dẫn bạn yêu cầu không tồn tại trên hệ thống ECOTDEV STORE hoặc đã được chuyển dời.
    </p>
    <Link to="/">
      <Button variant="primary">Về Trang Chủ</Button>
    </Link>
  </div>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <CustomerLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/:slug', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'account', element: <AccountDashboard /> },
      { path: 'account/*', element: <AccountDashboard /> },
      { path: 'support', element: <SupportPage /> },
      { path: 'auth/login', element: <LoginPage /> },
      { path: 'auth/register', element: <RegisterPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminOverviewPage /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'inventory', element: <AdminInventoryPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
      { path: 'customers', element: <AdminCustomersPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'coupons', element: <AdminCouponsPage /> },
      { path: 'payments', element: <AdminPaymentsPage /> },
      { path: 'reviews', element: <AdminReviewsPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
      { path: '*', element: <Navigate to="/admin" replace /> },
    ],
  },
])
