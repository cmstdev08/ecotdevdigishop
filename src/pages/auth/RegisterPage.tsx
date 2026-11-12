import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Mail, User, ArrowRight, Code2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await signUp(email, password, fullName)
      if (error) {
        toast.error(error.message || 'Đăng ký thất bại')
      } else {
        toast.success('Đăng ký tài khoản thành công!')
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
          <h1 className="text-2xl font-black text-white tracking-tight">Tạo Tài Khoản Mới</h1>
          <p className="text-xs text-slate-400">
            Tham gia cộng đồng hơn 12.000+ lập trình viên tại ECOTDEV
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Họ và tên</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 pl-10 pr-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="developer@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 pl-10 pr-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary font-mono"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Mật khẩu</label>
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

          <div>
            <label className="block text-slate-300 font-medium mb-1">Xác nhận mật khẩu</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            <span>Đăng Ký Tài Khoản</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Đã có tài khoản?{' '}
          <Link to="/auth/login" className="text-accent font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  )
}
