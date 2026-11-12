import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Star, Check, Sparkles, Download, KeyRound, Code2, LayoutTemplate } from 'lucide-react'
import { Product, ProductType } from '@/types'
import { formatCurrency, calculateDiscountPercent } from '@/utils/formatters'
import { Badge } from '@/components/ui/Badge'
import { useCartStore } from '@/stores/useCartStore'
import { useWishlistStore } from '@/stores/useWishlistStore'
import { toast } from 'sonner'

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addItem } = useCartStore()
  const { isInWishlist, toggleWishlist } = useWishlistStore()

  const discountPercent = calculateDiscountPercent(product.price, product.sale_price)
  const isWishlisted = isInWishlist(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, 1)
    toast.success('Đã thêm vào giỏ hàng', {
      description: product.name,
      icon: <ShoppingCart className="w-4 h-4 text-primary" />,
    })
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const added = toggleWishlist(product)
    if (added) {
      toast.success('Đã lưu vào danh sách yêu thích', { description: product.name })
    } else {
      toast.info('Đã xóa khỏi danh sách yêu thích')
    }
  }

  const getTypeBadge = (type: ProductType) => {
    switch (type) {
      case 'SOURCE_CODE':
        return (
          <Badge variant="primary" size="sm" className="flex items-center gap-1">
            <Code2 className="w-3 h-3" /> Source Code
          </Badge>
        )
      case 'LICENSE_KEY':
        return (
          <Badge variant="accent" size="sm" className="flex items-center gap-1">
            <KeyRound className="w-3 h-3" /> License Key
          </Badge>
        )
      case 'TEMPLATE':
        return (
          <Badge variant="secondary" size="sm" className="flex items-center gap-1">
            <LayoutTemplate className="w-3 h-3" /> Template
          </Badge>
        )
      case 'DIGITAL_SERVICE':
        return (
          <Badge variant="success" size="sm" className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Cloud & Service
          </Badge>
        )
      default:
        return <Badge variant="outline" size="sm">Asset</Badge>
    }
  }

  return (
    <div className="group relative rounded-2xl bg-card border border-slate-800/80 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 flex flex-col h-full overflow-hidden">
      {/* Thumbnail */}
      <Link to={`/products/${product.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-900">
        <img
          src={product.thumbnail}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {getTypeBadge(product.product_type)}
          {discountPercent > 0 && (
            <Badge variant="destructive" size="sm">
              -{discountPercent}%
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label="Yêu thích"
          className="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/60 backdrop-blur-md border border-white/10 text-slate-300 hover:text-rose-400 hover:bg-slate-900 transition z-10"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Version / Sales count pill */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 z-10">
          {product.version && (
            <span className="bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-700/60 font-mono">
              v{product.version}
            </span>
          )}
          <span className="bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-700/60 flex items-center gap-1">
            <Download className="w-3 h-3 text-cyan-400" /> {product.sales_count} đã bán
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold ml-1 text-slate-200">{product.rating_avg.toFixed(1)}</span>
            </div>
            <span className="text-xs text-slate-500">({product.rating_count} đánh giá)</span>
          </div>

          {/* Title */}
          <Link to={`/products/${product.slug}`} className="block">
            <h3 className="font-semibold text-slate-100 group-hover:text-primary transition-colors line-clamp-2 text-sm sm:text-base leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Tech stack tags */}
          {product.tech_stack && product.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {product.tech_stack.slice(0, 3).map((tech, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/40"
                >
                  {tech}
                </span>
              ))}
              {product.tech_stack.length > 3 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800/80 text-slate-500">
                  +{product.tech_stack.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-accent">
                {formatCurrency(product.sale_price ?? product.price)}
              </span>
            </div>
            {product.sale_price && (
              <span className="text-xs text-slate-500 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-semibold shadow-md shadow-primary/20 active:scale-95 transition"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Thêm</span>
          </button>
        </div>
      </div>
    </div>
  )
}
