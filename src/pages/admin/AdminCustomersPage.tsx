import React, { useEffect, useState } from 'react'
import { Users, Search, ShieldCheck, Lock, Unlock, ShieldAlert } from 'lucide-react'
import { adminService } from '@/services/adminService'
import { useAuth } from '@/contexts/AuthContext'
import { UserProfile, UserRole } from '@/types'
import { formatDate } from '@/utils/formatters'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

export const AdminCustomersPage: React.FC = () => {
  const { role: currentUserRole } = useAuth()
  const isSuperAdmin = currentUserRole === 'SUPER_ADMIN'

  const [customers, setCustomers] = useState<UserProfile[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadCustomers = async () => {
    setIsLoading(true)
    try {
      const list = await adminService.getAllCustomers()
      setCustomers(list)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const handleToggleBan = async (user: UserProfile) => {
    const nextBanState = !user.is_banned
    try {
      await adminService.toggleCustomerBan(user.id, nextBanState)
      toast.success(
        nextBanState
          ? `Đã khóa tài khoản ${user.full_name}!`
          : `Đã mở khóa tài khoản ${user.full_name}!`
      )
      loadCustomers()
    } catch (err: any) {
      toast.error(err.message || 'Lỗi thao tác')
    }
  }

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    if (!isSuperAdmin) {
      toast.error('Chỉ tài khoản SUPER_ADMIN mới có quyền thay đổi vai trò nhân viên!')
      return
    }
    try {
      await adminService.updateCustomerRole(userId, newRole)
      toast.success(`Đã cập nhật vai trò mới: ${newRole}`)
      loadCustomers()
    } catch (err: any) {
      toast.error(err.message || 'Lỗi cập nhật vai trò')
    }
  }

  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-400" />
          <span>Quản Lý Khách Hàng & Phân Quyền Quản Trị</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Kiểm soát danh sách người dùng, trạng thái khóa tài khoản và thiết lập phân quyền RBAC
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <input
          type="text"
          placeholder="Tìm theo họ tên, email hoặc vai trò..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl bg-slate-900 border border-slate-700/80 pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Người dùng</th>
                <th className="p-4">Email</th>
                <th className="p-4">Số điện thoại</th>
                <th className="p-4">Vai trò (Role)</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Ngày đăng ký</th>
                <th className="p-4 text-right">Khóa / Mở</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredCustomers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-850/40 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={user.full_name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <span className="font-bold text-white">{user.full_name}</span>
                    </div>
                  </td>

                  <td className="p-4 font-mono text-slate-400">
                    {user.email}
                  </td>

                  <td className="p-4 font-mono text-slate-400">
                    {user.phone || '—'}
                  </td>

                  <td className="p-4">
                    {isSuperAdmin ? (
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value as any)}
                        className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-slate-100 font-mono font-semibold"
                      >
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="PRODUCT_MANAGER">PRODUCT_MANAGER</option>
                        <option value="ORDER_MANAGER">ORDER_MANAGER</option>
                        <option value="SUPPORT">SUPPORT</option>
                        <option value="CUSTOMER">CUSTOMER</option>
                      </select>
                    ) : (
                      <Badge variant="primary" size="sm">{user.role}</Badge>
                    )}
                  </td>

                  <td className="p-4">
                    <Badge variant={user.is_banned ? 'destructive' : 'success'} size="sm">
                      {user.is_banned ? 'Đang bị khóa' : 'Hoạt động'}
                    </Badge>
                  </td>

                  <td className="p-4 text-slate-500 font-mono text-[11px]">
                    {user.created_at ? formatDate(user.created_at) : 'N/A'}
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleBan(user)}
                      className={`p-1.5 rounded-lg transition ${
                        user.is_banned
                          ? 'text-emerald-400 hover:bg-emerald-500/10'
                          : 'text-rose-400 hover:bg-rose-500/10'
                      }`}
                      title={user.is_banned ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                    >
                      {user.is_banned ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </button>
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
