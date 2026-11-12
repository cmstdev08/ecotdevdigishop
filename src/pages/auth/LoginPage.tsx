import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Code2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { signIn, switchDemoRole } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { error } = await signIn(email, password)
      if (error) {
        toast.error(error.message || 'Đăng nhập thất bại')
      } else {
        toast.success('Đăng nhập thành công!')
        navigate('/')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = async (roleType: 'ADMIN' | 'CUSTOMER') => {
    setIsLoading(true)
    try {
      if (roleType === 'ADMIN') {
        await signIn('admin@ecotdev.com', 'admin123456')
        switchDemoRole('SUPER_ADMIN')
        toast.success('Đã đăng nhập quyền SUPER_ADMIN!')
        navigate('/admin')
      } else {
        await signIn('customer@gmail.com', 'customer123456')
        switchDemoRole('CUSTOMER')
        toast.success('Đã đăng nhập quyền Khách Hàng!')
        navigate('/account')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl bg-card border border-slate-800 p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent p-0.5 mx-auto flex items-center justify-center shadow-lg shadow-primary/20">
            <div className="w-full h-full bg-brand-darkBg rounded-[14px] flex items-center justify-center">
              <Code2 className="w-6 h-6 text-accent" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Đăng Nhập Tài Khoản</h1>
          <p className="text-xs text-slate-400">
            Truy cập kho mã nguồn và giấy phép bản quyền của bạn
          </p>
        </div>

        {/* Quick Demo Login Buttons */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block text-center font-bold">
            ⚡ Đăng nhập thử nghiệm 1-Click
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('ADMIN')}
              className="py-2 px-3 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary-300 text-[11px] font-bold border border-primary/40 flex items-center justify-center gap-1.5 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Super Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('CUSTOMER')}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Khách Hàng</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="developer@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 pl-10 pr-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-medium">Mật khẩu</label>
              <a href="#" className="text-accent text-[11px] hover:underline">Quên mật khẩu?</a>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 pl-10 pr-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary font-mono"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            variant="primary"
            isLoading={isLoading}
            className="w-full text-xs font-bold glow-primary mt-2"
          >
            <span>Đăng Nhập</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Chưa có tài khoản?{' '}
          <Link to="/auth/register" className="text-accent font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  )
}
