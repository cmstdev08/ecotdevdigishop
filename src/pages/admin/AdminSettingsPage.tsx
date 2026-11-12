import React, { useState } from 'react'
import { Settings, Save, Building, Phone, Mail, MapPin, ShieldCheck, AlertTriangle } from 'lucide-react'
import { INITIAL_SETTINGS } from '@/data/mockData'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

export const AdminSettingsPage: React.FC = () => {
  const [storeName, setStoreName] = useState(INITIAL_SETTINGS.general_info.store_name)
  const [hotline, setHotline] = useState(INITIAL_SETTINGS.general_info.hotline)
  const [supportEmail, setSupportEmail] = useState(INITIAL_SETTINGS.general_info.support_email)
  const [businessAddress, setBusinessAddress] = useState(INITIAL_SETTINGS.general_info.business_address)
  const [isMaintenance, setIsMaintenance] = useState(INITIAL_SETTINGS.general_info.is_maintenance)

  // Bank Info
  const [bankName, setBankName] = useState(INITIAL_SETTINGS.payment_banking_info.bank_name)
  const [bankAccount, setBankAccount] = useState(INITIAL_SETTINGS.payment_banking_info.bank_account_number)
  const [bankAccountName, setBankAccountName] = useState(INITIAL_SETTINGS.payment_banking_info.bank_account_name)
  const [bankBin, setBankBin] = useState(INITIAL_SETTINGS.payment_banking_info.bank_bin)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Đã lưu cấu hình hệ thống website thành công!')
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-accent" />
          <span>Cài Đặt Hệ Thống & Cổng Thanh Toán</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Cấu hình thông tin thương hiệu, tài khoản nhận chuyển khoản VietQR và chế độ bảo trì
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* General Store Info */}
        <div className="rounded-3xl bg-card border border-slate-800 p-6 sm:p-8 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-primary" />
            <span>Thông Tin Thương Hiệu ECOTDEV</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Tên cửa hàng</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-slate-100 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Hotline CSKH</label>
              <input
                type="text"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Email hỗ trợ</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Địa chỉ trụ sở</label>
              <input
                type="text"
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Banking Info for VietQR */}
        <div className="rounded-3xl bg-card border border-slate-800 p-6 sm:p-8 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Tài Khoản Ngân Hàng Tiếp Nhận VietQR Tự Động</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Tên ngân hàng</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Mã BIN ngân hàng (Techcombank = 970407)</label>
              <input
                type="text"
                value={bankBin}
                onChange={(e) => setBankBin(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Số tài khoản nhận tiền</label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-slate-100 font-mono text-sm font-bold text-accent"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Tên chủ tài khoản (In hoa không dấu)</label>
              <input
                type="text"
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-slate-100 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Maintenance mode */}
        <div className="rounded-3xl bg-card border border-slate-800 p-6 flex items-center justify-between shadow-xl">
          <div>
            <h3 className="font-bold text-white text-sm">Chế độ bảo trì hệ thống</h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Khi bật, khách hàng truy cập website sẽ thấy màn hình thông báo nâng cấp.
            </p>
          </div>
          <input
            type="checkbox"
            checked={isMaintenance}
            onChange={(e) => setIsMaintenance(e.target.checked)}
            className="w-5 h-5 rounded text-primary focus:ring-0 cursor-pointer"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" variant="primary" className="font-bold glow-primary">
            <Save className="w-4 h-4 mr-2" />
            <span>Lưu Toàn Bộ Cấu Hình</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
