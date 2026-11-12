import React, { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Star,
  Download,
  Code2,
  KeyRound,
  LayoutTemplate,
  Check,
  X,
} from 'lucide-react'
import { productService } from '@/services/productService'
import { Product, ProductType, Category } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { toast } from 'sonner'

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form Fields
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formType, setFormType] = useState<ProductType>('SOURCE_CODE')
  const [formPrice, setFormPrice] = useState<number>(0)
  const [formSalePrice, setFormSalePrice] = useState<number | undefined>(undefined)
  const [formThumbnail, setFormThumbnail] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formShortDesc, setFormShortDesc] = useState('')
  const [formVersion, setFormVersion] = useState('1.0.0')
  const [formDemoUrl, setFormDemoUrl] = useState('')
  const [formTechStack, setFormTechStack] = useState('')
  const [formFeatures, setFormFeatures] = useState('')
  const [formIsFeatured, setFormIsFeatured] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [cats, prodRes] = await Promise.all([
        productService.getCategories(),
        productService.getProducts({ pageSize: 100 }),
      ])
      setCategories(cats)
      setProducts(prodRes.products)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreateModal = () => {
    setEditingProduct(null)
    setFormName('')
    setFormSlug('')
    setFormCategory(categories[0]?.id || '')
    setFormType('SOURCE_CODE')
    setFormPrice(990000)
    setFormSalePrice(690000)
    setFormThumbnail('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800')
    setFormDesc('Mô tả chi tiết sản phẩm mã nguồn...')
    setFormShortDesc('Mô tả ngắn gọn sản phẩm...')
    setFormVersion('1.0.0')
    setFormDemoUrl('')
    setFormTechStack('React, TypeScript, Tailwind')
    setFormFeatures('Tự động hóa, Tối ưu SEO, Sẵn sàng triển khai')
    setFormIsFeatured(false)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p)
    setFormName(p.name)
    setFormSlug(p.slug)
    setFormCategory(p.category_id)
    setFormType(p.product_type)
    setFormPrice(p.price)
    setFormSalePrice(p.sale_price ?? undefined)
    setFormThumbnail(p.thumbnail)
    setFormDesc(p.description)
    setFormShortDesc(p.short_description || '')
    setFormVersion(p.version || '1.0.0')
    setFormDemoUrl(p.demo_url || '')
    setFormTechStack(p.tech_stack?.join(', ') || '')
    setFormFeatures(p.features?.join('\n') || '')
    setFormIsFeatured(p.is_featured)
    setIsModalOpen(true)
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return

    const productData: Partial<Product> = {
      name: formName.trim(),
      slug: formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category_id: formCategory,
      product_type: formType,
      price: Number(formPrice),
      sale_price: formSalePrice ? Number(formSalePrice) : null,
      thumbnail: formThumbnail.trim(),
      description: formDesc.trim(),
      short_description: formShortDesc.trim(),
      version: formVersion.trim(),
      demo_url: formDemoUrl.trim() || null,
      tech_stack: formTechStack.split(',').map((t) => t.trim()).filter(Boolean),
      features: formFeatures.split('\n').map((f) => f.trim()).filter(Boolean),
      is_featured: formIsFeatured,
      status: 'PUBLISHED',
    }

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, productData)
        toast.success('Đã cập nhật sản phẩm thành công!')
      } else {
        await productService.createProduct(productData)
        toast.success('Đã thêm sản phẩm mới thành công!')
      }
      setIsModalOpen(false)
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Lỗi lưu sản phẩm')
    }
  }

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" không?`)) return
    try {
      await productService.deleteProduct(id)
      toast.success('Đã xóa sản phẩm thành công')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa')
    }
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.product_type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Quản Lý Sản Phẩm Kỹ Thuật Số
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Toàn quyền thêm mới, chỉnh sửa giá, cập nhật phiên bản và phân loại sản phẩm
          </p>
        </div>

        <Button onClick={handleOpenCreateModal} variant="primary" size="md" className="shrink-0 font-bold">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Thêm Sản Phẩm Mới</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc loại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-700/80 pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-card border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Sản phẩm</th>
                <th className="p-4">Phân loại</th>
                <th className="p-4">Giá bán / Khuyến mãi</th>
                <th className="p-4">Đã bán</th>
                <th className="p-4">Đánh giá</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-850/40 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.thumbnail}
                        alt={p.name}
                        className="w-12 h-9 rounded-lg object-cover bg-slate-900 shrink-0 border border-slate-800"
                      />
                      <div className="min-w-0 max-w-xs">
                        <span className="font-bold text-white block truncate">{p.name}</span>
                        <span className="text-[10px] text-cyan-400 font-mono">v{p.version || '1.0.0'}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <Badge variant={p.product_type === 'LICENSE_KEY' ? 'accent' : 'primary'} size="sm">
                      {p.product_type}
                    </Badge>
                  </td>

                  <td className="p-4 font-mono">
                    <div className="font-bold text-white">
                      {formatCurrency(p.sale_price ?? p.price)}
                    </div>
                    {p.sale_price && (
                      <div className="text-[10px] text-slate-500 line-through">
                        {formatCurrency(p.price)}
                      </div>
                    )}
                  </td>

                  <td className="p-4 font-mono font-bold text-slate-200">
                    {p.sales_count}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-bold">{p.rating_avg.toFixed(1)}</span>
                      <span className="text-slate-500 text-[10px]">({p.rating_count})</span>
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 text-slate-400 hover:text-accent rounded-lg hover:bg-slate-800 transition"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Kỹ Thuật Số'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Tên sản phẩm *</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Danh mục</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Loại sản phẩm</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100"
              >
                <option value="SOURCE_CODE">SOURCE_CODE (Mã nguồn)</option>
                <option value="TEMPLATE">TEMPLATE (Giao diện)</option>
                <option value="LICENSE_KEY">LICENSE_KEY (Mã kích hoạt)</option>
                <option value="DIGITAL_SERVICE">DIGITAL_SERVICE (Dịch vụ số)</option>
                <option value="OTHER">OTHER (Tài nguyên khác)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Giá gốc (VND) *</label>
              <input
                type="number"
                required
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Giá khuyến mãi (VND)</label>
              <input
                type="number"
                value={formSalePrice ?? ''}
                onChange={(e) => setFormSalePrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Phiên bản (Version)</label>
              <input
                type="text"
                value={formVersion}
                onChange={(e) => setFormVersion(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Demo Live URL</label>
              <input
                type="url"
                value={formDemoUrl}
                onChange={(e) => setFormDemoUrl(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-slate-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Thumbnail Image URL *</label>
            <input
              type="url"
              required
              value={formThumbnail}
              onChange={(e) => setFormThumbnail(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-slate-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Công nghệ (Tech stack, phân cách bằng dấu phẩy)</label>
            <input
              type="text"
              value={formTechStack}
              onChange={(e) => setFormTechStack(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Mô tả ngắn</label>
            <input
              type="text"
              value={formShortDesc}
              onChange={(e) => setFormShortDesc(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Danh sách tính năng (Mỗi dòng một tính năng)</label>
            <textarea
              rows={3}
              value={formFeatures}
              onChange={(e) => setFormFeatures(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Mô tả chi tiết (Markdown)</label>
            <textarea
              rows={4}
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-slate-100 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formIsFeatured}
              onChange={(e) => setFormIsFeatured(e.target.checked)}
              className="rounded text-primary focus:ring-0"
            />
            <label htmlFor="isFeatured" className="text-slate-200">
              Ghim sản phẩm nổi bật (Featured on Homepage)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              Lưu Sản Phẩm
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
