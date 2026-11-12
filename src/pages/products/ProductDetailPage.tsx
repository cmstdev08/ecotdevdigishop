import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Star,
  ShoppingCart,
  Zap,
  Heart,
  ShieldCheck,
  Download,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ArrowLeft,
  MessageSquare,
  KeyRound,
  FileCode,
} from 'lucide-react'
import { productService } from '@/services/productService'
import { Product, Review } from '@/types'
import { formatCurrency, calculateDiscountPercent, formatDate } from '@/utils/formatters'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProductCard } from '@/components/product/ProductCard'
import { useCartStore } from '@/stores/useCartStore'
import { useWishlistStore } from '@/stores/useWishlistStore'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { addItem } = useCartStore()
  const { isInWishlist, toggleWishlist } = useWishlistStore()
  const { profile } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [activeTab, setActiveTab] = useState<'desc' | 'features' | 'tech' | 'reviews'>('desc')
  const [isLoading, setIsLoading] = useState(true)

  // New review form state
  const [ratingInput, setRatingInput] = useState(5)
  const [commentInput, setCommentInput] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return
      setIsLoading(true)
      try {
        const prod = await productService.getProductBySlug(slug)
        if (prod) {
          setProduct(prod)
          const [revs, related] = await Promise.all([
            productService.getReviews(prod.id),
            productService.getProducts({ categorySlug: prod.category?.slug, pageSize: 4 }),
          ])
          setReviews(revs)
          setRelatedProducts(related.products.filter((p) => p.id !== prod.id))
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadProduct()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [slug])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm">Đang tải thông tin sản phẩm...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-card border border-slate-800 rounded-3xl">
        <h2 className="text-xl font-bold text-white mb-2">Không tìm thấy sản phẩm</h2>
        <p className="text-xs text-slate-400 mb-6">Sản phẩm này có thể đã bị xóa hoặc tạm ẩn.</p>
        <Link to="/products">
          <Button variant="primary">Về danh mục sản phẩm</Button>
        </Link>
      </div>
    )
  }

  const discountPercent = calculateDiscountPercent(product.price, product.sale_price)
  const isWishlisted = isInWishlist(product.id)

  const handleAddToCart = () => {
    addItem(product, 1)
    toast.success('Đã thêm vào giỏ hàng', { description: product.name })
  }

  const handleBuyNow = () => {
    addItem(product, 1)
    navigate('/checkout')
  }

  const handleToggleWishlist = () => {
    const added = toggleWishlist(product)
    if (added) {
      toast.success('Đã lưu vào danh sách yêu thích', { description: product.name })
    } else {
      toast.info('Đã xóa khỏi danh sách yêu thích')
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentInput.trim()) return
    setIsSubmittingReview(true)
    try {
      const newRev = await productService.createReview({
        user_id: profile?.id || 'u-guest',
        product_id: product.id,
        rating: ratingInput,
        content: commentInput.trim(),
        is_verified_purchase: true,
        is_approved: true,
        author_name: profile?.full_name || 'Khách Hàng',
        author_avatar: profile?.avatar_url,
      })
      setReviews([newRev, ...reviews])
      setCommentInput('')
      toast.success('Cảm ơn bạn đã gửi đánh giá sản phẩm!')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-white transition">Trang chủ</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-white transition">Sản phẩm</Link>
        <span>/</span>
        <span className="text-slate-200 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Thumbnail & Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 aspect-[16/10] shadow-2xl">
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant="primary" size="md">
                {product.product_type}
              </Badge>
              {discountPercent > 0 && (
                <Badge variant="destructive" size="md">
                  Tiết kiệm {discountPercent}%
                </Badge>
              )}
            </div>
          </div>

          {/* Action Links Demo & Docs */}
          <div className="flex flex-wrap gap-3">
            {product.demo_url && (
              <a
                href={product.demo_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-accent text-xs font-semibold text-slate-200 hover:text-white transition"
              >
                <ExternalLink className="w-4 h-4 text-accent" />
                <span>Xem Demo Trực Tiếp</span>
              </a>
            )}
            {product.documentation_url && (
              <a
                href={product.documentation_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-primary text-xs font-semibold text-slate-200 hover:text-white transition"
              >
                <BookOpen className="w-4 h-4 text-primary" />
                <span>Tài Liệu Hướng Dẫn</span>
              </a>
            )}
          </div>
        </div>

        {/* Right: Pricing, Specs & Buy (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-card border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold text-cyan-400">
                Phiên bản v{product.version || '1.0.0'}
              </span>
              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{product.rating_avg.toFixed(1)}</span>
                <span className="text-slate-500 font-normal">({product.rating_count} đánh giá)</span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
              {product.name}
            </h1>

            <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
              {product.short_description || product.description.substring(0, 160)}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Giá bán kỹ thuật số</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-accent">
                  {formatCurrency(product.sale_price ?? product.price)}
                </span>
                {product.sale_price && (
                  <span className="text-sm text-slate-500 line-through">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> Giao hàng tức thì
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3">
            <Button onClick={handleBuyNow} size="lg" variant="primary" className="w-full text-sm font-bold glow-primary">
              <Zap className="w-4 h-4 mr-2" />
              <span>Mua Ngay Tức Thì</span>
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleAddToCart} variant="secondary" className="w-full text-xs">
                <ShoppingCart className="w-4 h-4 mr-1.5" />
                <span>Thêm vào giỏ</span>
              </Button>

              <Button onClick={handleToggleWishlist} variant="outline" className="w-full text-xs">
                <Heart className={`w-4 h-4 mr-1.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isWishlisted ? 'Đã lưu' : 'Yêu thích'}</span>
              </Button>
            </div>
          </div>

          {/* Specs Checklist */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-cyan-400" /> Hình thức bàn giao
              </span>
              <span className="font-semibold text-slate-200">
                {product.product_type === 'LICENSE_KEY' ? 'Cấp License Key tự động' : 'Tải file ZIP trực tiếp'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" /> Thời gian hỗ trợ
              </span>
              <span className="font-semibold text-slate-200">{product.support_period_days || 365} ngày</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" /> Bản quyền sử dụng
              </span>
              <span className="font-semibold text-slate-200">Thương mại mở rộng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-800">
        <div className="flex gap-4 sm:gap-8 overflow-x-auto">
          {[
            { id: 'desc', label: 'Mô tả chi tiết' },
            { id: 'features', label: 'Tính năng cốt lõi' },
            { id: 'tech', label: 'Công nghệ & Yêu cầu' },
            { id: 'reviews', label: `Đánh giá (${reviews.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="min-h-[250px]">
        {activeTab === 'desc' && (
          <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-card border border-slate-800 rounded-3xl p-6 sm:p-8">
            {product.description}
          </div>
        )}

        {activeTab === 'features' && (
          <div className="rounded-3xl bg-card border border-slate-800 p-6 sm:p-8">
            <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <span>Danh Sách Tính Năng Hoàn Chỉnh</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.features?.map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-200 leading-snug">{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tech' && (
          <div className="rounded-3xl bg-card border border-slate-800 p-6 sm:p-8 space-y-6">
            <div>
              <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-3">
                Tech Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {product.tech_stack?.map((tech, i) => (
                  <span
                    key={i}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-semibold text-accent"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-2">
                Điều Khoản Giấy Phép (License Agreement)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {product.license_terms || 'Giấy phép sử dụng cho 1 dự án thương mại của cá nhân hoặc tổ chức. Nghiêm cấm hành vi sao chép, phân phối lại hoặc bán lại mã nguồn dưới bất kỳ hình thức nào khi chưa có sự đồng ý bằng văn bản của ECOTDEV.'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* Review Input Box */}
            <form onSubmit={handleSubmitReview} className="rounded-3xl bg-card border border-slate-800 p-6 sm:p-8 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span>Viết đánh giá của bạn</span>
              </h3>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Chọn số sao:</span>
                <div className="flex gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRatingInput(s)}
                      className="p-1 hover:scale-125 transition"
                    >
                      <Star className={`w-5 h-5 ${s <= ratingInput ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={3}
                placeholder="Chia sẻ trải nghiệm sử dụng mã nguồn / bản quyền này..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="w-full rounded-2xl bg-slate-900 border border-slate-700 p-4 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary"
              />

              <div className="flex justify-end">
                <Button type="submit" size="sm" variant="primary" isLoading={isSubmittingReview}>
                  Gửi đánh giá xác thực
                </Button>
              </div>
            </form>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="rounded-2xl bg-brand-darkCard border border-slate-800 p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rev.author_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                        alt={rev.author_name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">{rev.author_name || 'Khách hàng'}</span>
                        <span className="text-[10px] text-slate-500">{formatDate(rev.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pt-1">{rev.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-slate-800 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Sản Phẩm Tương Tự</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
