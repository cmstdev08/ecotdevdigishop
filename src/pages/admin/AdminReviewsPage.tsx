import React, { useEffect, useState } from 'react'
import { MessageSquare, Star, CheckCircle2, EyeOff, Trash2 } from 'lucide-react'
import { productService } from '@/services/productService'
import { Review, Product } from '@/types'
import { formatDate } from '@/utils/formatters'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'sonner'

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const loadData = async () => {
    const prodRes = await productService.getProducts({ pageSize: 100 })
    setProducts(prodRes.products)

    const allRevs: Review[] = []
    for (const p of prodRes.products.slice(0, 5)) {
      const revs = await productService.getReviews(p.id)
      allRevs.push(...revs)
    }
    setReviews(allRevs)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleToggleApprove = (revId: string) => {
    const updated = reviews.map((r) =>
      r.id === revId ? { ...r, is_approved: !r.is_approved } : r
    )
    setReviews(updated)
    toast.success('Đã cập nhật trạng thái duyệt đánh giá!')
  }

  const handleDelete = (revId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return
    setReviews(reviews.filter((r) => r.id !== revId))
    toast.success('Đã xóa đánh giá!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-amber-400" />
          <span>Kiểm Duyệt Đánh Giá Khách Hàng</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Duyệt các nhận xét từ người mua đã xác thực, ẩn đánh giá vi phạm hoặc phản hồi khách hàng
        </p>
      </div>

      <div className="space-y-3">
        {reviews.map((rev) => (
          <div key={rev.id} className="rounded-2xl bg-card border border-slate-800 p-5 space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <img
                  src={rev.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={rev.author_name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <span className="font-bold text-white block">{rev.author_name}</span>
                  <span className="text-[10px] text-slate-500">{formatDate(rev.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex text-amber-400 mr-2">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>

                <Badge variant={rev.is_approved ? 'success' : 'secondary'} size="sm">
                  {rev.is_approved ? 'ĐÃ DUYỆT' : 'CHỜ DUYỆT'}
                </Badge>

                <button
                  onClick={() => handleToggleApprove(rev.id)}
                  className="px-2.5 py-1 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-[11px]"
                >
                  {rev.is_approved ? 'Tạm ẩn' : 'Duyệt'}
                </button>

                <button
                  onClick={() => handleDelete(rev.id)}
                  className="p-1 text-slate-500 hover:text-rose-400"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              "{rev.content}"
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
