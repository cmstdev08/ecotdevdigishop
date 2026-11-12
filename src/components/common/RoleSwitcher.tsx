import React from 'react'
import { Shield, UserCheck, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'sonner'

export const RoleSwitcher: React.FC = () => {
  const { role, switchDemoRole } = useAuth()
  const [isOpen, setIsOpen] = React.useState(false)

  const roles: { id: UserRole; label: string; desc: string; badge: string }[] = [
    { id: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Toàn quyền quản trị hệ thống', badge: 'destructive' },
    { id: 'ADMIN', label: 'Admin Quản Trị', desc: 'Quản lý đơn hàng, sản phẩm, cài đặt', badge: 'primary' },
    { id: 'PRODUCT_MANAGER', label: 'Product Manager', desc: 'Chuyên trách sản phẩm & kho', badge: 'warning' },
    { id: 'CUSTOMER', label: 'Khách Hàng', desc: 'Giao diện khách hàng mua sắm', badge: 'secondary' },
  ]

  const handleSelectRole = (r: UserRole) => {
    switchDemoRole(r)
    setIsOpen(false)
    toast.success(`Đã chuyển vai trò: ${r}`)
  }

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white hover:border-primary/50 transition"
        title="Chuyển đổi Role để kiểm tra phân quyền RBAC"
      >
        <Shield className="w-3.5 h-3.5 text-accent" />
        <span className="hidden sm:inline font-mono">{role}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 rounded-xl bg-brand-darkCard border border-slate-700 shadow-2xl p-2 z-40 space-y-1">
            <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Kiểm tra phân quyền RBAC
            </div>
            {roles.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectRole(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                  role === item.id
                    ? 'bg-primary/20 text-primary-300 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    {item.label}
                    {role === item.id && <UserCheck className="w-3.5 h-3.5 text-accent" />}
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">{item.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
