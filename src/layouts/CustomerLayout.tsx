import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/common/Navbar'
import { Footer } from '@/components/common/Footer'
import { Toaster } from 'sonner'
import { Sparkles } from 'lucide-react'

export const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-primary-900 via-primary-700 to-indigo-900 text-white text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
        <span>
          Khuyến mãi lập trình viên 2026: Nhập mã <strong className="font-mono text-accent">ECOTDEV10</strong> giảm ngay 10% đơn hàng đầu tiên!
        </span>
      </div>

      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

      {/* Global Notification Toast */}
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
