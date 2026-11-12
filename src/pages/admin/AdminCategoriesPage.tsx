import React, { useEffect, useState } from 'react'
import { FolderTree, Plus, Edit, Trash2 } from 'lucide-react'
import { productService } from '@/services/productService'
import { Category } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { toast } from 'sonner'

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formIcon, setFormIcon] = useState('Code2')

  const loadData = async () => {
    const list = await productService.getCategories()
    setCategories(list)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingCategory(null)
    setFormName('')
    setFormSlug('')
    setFormDesc('')
    setFormIcon('Code2')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c)
    setFormName(c.name)
    setFormSlug(c.slug)
    setFormDesc(c.description || '')
    setFormIcon(c.icon_name || 'Code2')
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return

    if (editingCategory) {
      const updated = categories.map((c) =>
        c.id === editingCategory.id
          ? {
              ...c,
              name: formName.trim(),
              slug: formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              description: formDesc.trim(),
              icon_name: formIcon,
            }
          : c
      )
      setCategories(updated)
      toast.success('Đã cập nhật danh mục thành công!')
    } else {
      const newCat: Category = {
        id: `c-${Date.now()}`,
        name: formName.trim(),
        slug: formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formDesc.trim(),
        icon_name: formIcon,
        sort_order: categories.length + 1,
        is_active: true,
        product_count: 0,
      }
      setCategories([...categories, newCat])
      toast.success('Đã tạo danh mục mới!')
    }
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-accent" />
            <span>Quản Lý Danh Mục Sản Phẩm</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Phân loại các dòng sản phẩm mã nguồn, template, license key và dịch vụ số
          </p>
        </div>

        <Button onClick={handleOpenCreate} variant="primary" size="md" className="font-bold shrink-0">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Thêm Danh Mục Mới</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="rounded-2xl bg-card border border-slate-800 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400 font-bold">
                  {c.slug}
                </span>
                <Badge variant={c.is_active ? 'success' : 'secondary'} size="sm">
                  {c.is_active ? 'Kích hoạt' : 'Tạm ẩn'}
                </Badge>
              </div>
              <h3 className="font-bold text-white text-sm">{c.name}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-500 text-[11px]">
                {c.product_count || 0} sản phẩm
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-1.5 text-slate-400 hover:text-accent rounded-lg hover:bg-slate-800"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Tên danh mục *</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Đường dẫn Slug (URL)</label>
            <input
              type="text"
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-slate-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Mô tả ngắn</label>
            <textarea
              rows={3}
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              Lưu Danh Mục
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
