import React, { useEffect, useState } from 'react'
import { Tag, Plus, CheckCircle2, XCircle, Trash2 } from 'lucide-react'
import { adminService } from '@/services/adminService'
import { Coupon, DiscountType } from '@/types'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { toast } from 'sonner'

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [formCode, setFormCode] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formType, setFormType] = useState<DiscountType>('PERCENTAGE')
  const [formValue, setFormValue] = useState<number>(10)
  const [formMinValue, setFormMinValue] = useState<number>(200000)
  const [formMaxDiscount, setFormMaxDiscount] = useState<number>(300000)
  const [formMaxUses, setFormMaxUses] = useState<number>(100)

  const loadData = async () => {
    const list = await adminService.getAllCoupons()
    setCoupons(list)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleToggle = async (c: Coupon) => {
    await adminService.toggleCoupon(c.id, !c.is_active)
    toast.success(`Đã ${c.is_active ? 'tắt' : 'bật'} mã giảm giá ${c.code}`)
    loadData()
  }

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formCode.trim()) return

    await adminService.createCoupon({
      code: formCode.trim().toUpperCase(),
      description: formDesc.trim(),
      discount_type: formType,
      discount_value: formValue,
      min_order_value: formMinValue,
      max_discount_amount: formType === 'PERCENTAGE' ? formMaxDiscount : undefined,
      max_uses: formMaxUses,
    })

    toast.success('Đã tạo mã giảm giá mới!')
    setIsModalOpen(false)
    loadData()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-emerald-400" />
            <span>Quản Lý Mã Khuyến Mãi (Coupons)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Thiết lập mã giảm giá phần trăm hoặc tiền mặt, giới hạn lượt dùng và đơn tối thiểu
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="primary" size="md" className="font-bold shrink-0">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Tạo Mã Giảm Giá Mới</span>
        </Button>
      </div>

      <div className="rounded-2xl bg-card border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Mã Code</th>
                <th className="p-4">Loại giảm giá</th>
                <th className="p-4">Mức giảm</th>
                <th className="p-4">Đơn tối thiểu</th>
                <th className="p-4">Lượt dùng</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Bật / Tắt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-slate-850/40 transition">
                  <td className="p-4">
                    <span className="font-mono font-bold text-accent bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700">
                      {c.code}
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-1">{c.description}</span>
                  </td>

                  <td className="p-4 font-mono">
                    {c.discount_type === 'PERCENTAGE' ? 'Phần trăm (%)' : 'Số tiền cố định (₫)'}
                  </td>

                  <td className="p-4 font-mono font-bold text-white">
                    {c.discount_type === 'PERCENTAGE' ? `${c.discount_value}%` : formatCurrency(c.discount_value)}
                  </td>

                  <td className="p-4 font-mono text-slate-400">
                    {formatCurrency(c.min_order_value)}
                  </td>

                  <td className="p-4 font-mono text-slate-300">
                    {c.used_count} / {c.max_uses}
                  </td>

                  <td className="p-4">
                    <Badge variant={c.is_active ? 'success' : 'secondary'} size="sm">
                      {c.is_active ? 'Hoạt động' : 'Tạm tắt'}
                    </Badge>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggle(c)}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg border transition ${
                        c.is_active
                          ? 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
                          : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {c.is_active ? 'Tắt' : 'Bật'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo Mã Giảm Giá Mới"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Mã Code (Chữ in hoa) *</label>
            <input
              type="text"
              required
              placeholder="VD: ECOTDEV2026"
              value={formCode}
              onChange={(e) => setFormCode(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-slate-100 font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Mô tả mã</label>
            <input
              type="text"
              placeholder="Giảm 10% mừng năm mới"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Loại giảm giá</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100"
              >
                <option value="PERCENTAGE">Phần trăm (%)</option>
                <option value="FIXED_AMOUNT">Số tiền cố định (₫)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Giá trị giảm *</label>
              <input
                type="number"
                required
                value={formValue}
                onChange={(e) => setFormValue(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Đơn tối thiểu (₫)</label>
              <input
                type="number"
                value={formMinValue}
                onChange={(e) => setFormMinValue(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Giới hạn lượt dùng</label>
              <input
                type="number"
                value={formMaxUses}
                onChange={(e) => setFormMaxUses(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              Tạo Mã Khuyến Mãi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
