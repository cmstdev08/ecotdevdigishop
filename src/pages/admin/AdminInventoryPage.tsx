import React, { useEffect, useState } from 'react'
import {
  KeyRound,
  Plus,
  Search,
  Upload,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react'
import { adminService } from '@/services/adminService'
import { productService } from '@/services/productService'
import { LicenseKey, Product } from '@/types'
import { formatDate } from '@/utils/formatters'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { toast } from 'sonner'

export const AdminInventoryPage: React.FC = () => {
  const [keys, setKeys] = useState<LicenseKey[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  // Batch import modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importTargetProduct, setImportTargetProduct] = useState('')
  const [importKeysText, setImportKeysText] = useState('')
  const [isSubmittingImport, setIsSubmittingImport] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [allKeys, prodRes] = await Promise.all([
        adminService.getLicenseInventory(),
        productService.getProducts({ pageSize: 100 }),
      ])
      setKeys(allKeys)
      // Filter products that can take license keys
      const licenseProducts = prodRes.products.filter(
        (p) => p.product_type === 'LICENSE_KEY' || p.product_type === 'DIGITAL_SERVICE'
      )
      setProducts(licenseProducts)
      if (licenseProducts.length > 0 && !importTargetProduct) {
        setImportTargetProduct(licenseProducts[0].id)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleImportKeys = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!importTargetProduct || !importKeysText.trim()) return

    setIsSubmittingImport(true)
    try {
      const keyList = importKeysText
        .split('\n')
        .map((k) => k.trim())
        .filter((k) => k.length > 0)

      if (keyList.length === 0) {
        toast.error('Vui lòng nhập ít nhất 1 mã key!')
        return
      }

      const count = await adminService.addLicenseKeys(importTargetProduct, keyList)
      toast.success(`Đã nhập thành công ${count} mã key mới vào kho!`)
      setIsImportModalOpen(false)
      setImportKeysText('')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi nhập kho')
    } finally {
      setIsSubmittingImport(false)
    }
  }

  const availableCount = keys.filter((k) => k.status === 'AVAILABLE').length
  const assignedCount = keys.filter((k) => k.status === 'ASSIGNED').length

  const filteredKeys = keys.filter((k) => {
    if (selectedProductId !== 'all' && k.product_id !== selectedProductId) return false
    if (statusFilter !== 'all' && k.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-accent" />
            <span>Quản Lý Kho Kỹ Thuật Số & License Keys</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Theo dõi tồn kho, nhập mã kích hoạt hàng loạt và quản lý cấp phát tự động
          </p>
        </div>

        <Button
          onClick={() => setIsImportModalOpen(true)}
          variant="primary"
          size="md"
          className="shrink-0 font-bold glow-primary"
        >
          <Upload className="w-4 h-4 mr-1.5" />
          <span>Nhập Mã Key Hàng Loạt (CSV/Text)</span>
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-card border border-slate-800 p-5 shadow-xl">
          <span className="text-xs text-slate-400 block mb-1">Mã Key Sẵn Sàng (Available)</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">
            {availableCount}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Sẵn sàng cấp cho khách</span>
        </div>

        <div className="rounded-2xl bg-card border border-slate-800 p-5 shadow-xl">
          <span className="text-xs text-slate-400 block mb-1">Mã Key Đã Cấp (Assigned)</span>
          <span className="text-2xl font-black text-accent font-mono">
            {assignedCount}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Đã giao tới đơn hàng</span>
        </div>

        <div className="rounded-2xl bg-card border border-slate-800 p-5 shadow-xl">
          <span className="text-xs text-slate-400 block mb-1">Tổng Số Key Quản Lý</span>
          <span className="text-2xl font-black text-white font-mono">
            {keys.length}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Chống trùng lặp tuyệt đối</span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3 bg-card border border-slate-800 p-4 rounded-2xl">
        <div className="w-full sm:w-64">
          <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Lọc theo sản phẩm</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
          >
            <option value="all">Tất cả sản phẩm License</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-48">
          <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Trạng thái kho</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="AVAILABLE">AVAILABLE (Còn hàng)</option>
            <option value="ASSIGNED">ASSIGNED (Đã cấp phát)</option>
            <option value="REVOKED">REVOKED (Đã thu hồi)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Sản phẩm</th>
                <th className="p-4">Mã License Key</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Ngày cấp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredKeys.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    Không tìm thấy mã key nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredKeys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-850/40 transition">
                    <td className="p-4 font-semibold text-white">
                      {k.product_name}
                    </td>
                    <td className="p-4">
                      <span className="font-mono bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 text-accent font-bold">
                        {k.encrypted_key}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={k.status === 'AVAILABLE' ? 'success' : 'secondary'} size="sm">
                        {k.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-[11px]">
                      {k.assigned_at ? formatDate(k.assigned_at) : 'Chưa cấp'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Nhập License Key Hàng Loạt Vào Kho"
        description="Dán danh sách mã kích hoạt (mỗi dòng một key). Hệ thống tự động khử trùng lặp."
        maxWidth="lg"
      >
        <form onSubmit={handleImportKeys} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Chọn sản phẩm nhận Key *</label>
            <select
              required
              value={importTargetProduct}
              onChange={(e) => setImportTargetProduct(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-slate-100"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Danh sách License Key (Mỗi dòng 1 mã key) *
            </label>
            <textarea
              rows={8}
              required
              placeholder="JB2026-AP-99X8-44A2-KLM9&#10;JB2026-AP-88B1-77Z4-QP21&#10;VK7JG-NPHTM-C97JM-9MPGT-3V66T"
              value={importKeysText}
              onChange={(e) => setImportKeysText(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3.5 text-slate-100 font-mono text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsImportModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingImport}>
              Lưu Vào Kho Hàng
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
