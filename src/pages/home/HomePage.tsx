import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Code2,
  KeyRound,
  LayoutTemplate,
  Palette,
  Terminal,
  Sparkles,
  Zap,
  ShieldCheck,
  Download,
  ArrowRight,
  Search,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Star,
  Quote,
} from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { productService } from '@/services/productService'
import { Product, Category } from '@/types'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [newestProducts, setNewestProducts] = useState<Product[]>([])
  const [bestSellers, setBestSellers] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [heroSearch, setHeroSearch] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, featRes, newRes, popRes] = await Promise.all([
          productService.getCategories(),
          productService.getProducts({ featuredOnly: true, pageSize: 4 }),
          productService.getProducts({ sortBy: 'newest', pageSize: 4 }),
          productService.getProducts({ sortBy: 'popular', pageSize: 4 }),
        ])
        setCategories(cats)
        setFeaturedProducts(featRes.products)
        setNewestProducts(newRes.products)
        setBestSellers(popRes.products)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (heroSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(heroSearch.trim())}`)
    }
  }

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 className="w-6 h-6 text-primary" />
      case 'LayoutTemplate':
        return <LayoutTemplate className="w-6 h-6 text-accent" />
      case 'Palette':
        return <Palette className="w-6 h-6 text-rose-400" />
      case 'Terminal':
        return <Terminal className="w-6 h-6 text-amber-400" />
      case 'KeyRound':
      default:
        return <KeyRound className="w-6 h-6 text-emerald-400" />
    }
  }

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 border-b border-slate-800/80 bg-hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary-300 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Nền tảng thương mại điện tử sản phẩm số chuẩn Enterprise 2026</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Khám phá & Sở hữu <br />
            <span className="gradient-text">Mã Nguồn & Bản Quyền Phần Mềm</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Hơn 1.000+ source code website, templates React/Vue, bộ UI Kit và license keys chính hãng. Hệ thống xác thực thanh toán và tự động bàn giao tức thì trong 30 giây.
          </p>

          {/* Search Bar in Hero */}
          <form onSubmit={handleHeroSearch} className="mt-8 max-w-xl mx-auto relative flex items-center">
            <input
              type="text"
              placeholder="Nhập tên source code, công nghệ (React, Python, Golang), bản quyền..."
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              className="w-full rounded-2xl bg-slate-900/90 border border-slate-700/80 pl-11 pr-32 py-4 text-sm text-slate-100 placeholder:text-slate-500 shadow-2xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-400 text-brand-darkBg font-bold text-xs shadow-md transition"
            >
              Tìm kiếm
            </button>
          </form>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/products">
              <Button size="lg" variant="primary" className="glow-primary">
                <span>Khám phá sản phẩm</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/products?type=LICENSE_KEY">
              <Button size="lg" variant="outline">
                <KeyRound className="w-4 h-4 text-accent mr-2" />
                <span>Bản quyền & License Keys</span>
              </Button>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mt-14 pt-10 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">1.200+</div>
              <div className="text-xs text-slate-400 mt-1">Sản phẩm số tuyển chọn</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-accent font-mono">30 Giây</div>
              <div className="text-xs text-slate-400 mt-1">Giao hàng tự động</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">100%</div>
              <div className="text-xs text-slate-400 mt-1">Mã nguồn kiểm duyệt sạch</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">24/7</div>
              <div className="text-xs text-slate-400 mt-1">Senior Dev tư vấn</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-24">
        {/* 2. CATEGORIES OVERVIEW */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
                Danh Mục Nổi Bật
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Lựa chọn giải pháp phù hợp với kiến trúc dự án của bạn
              </p>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              <span>Xem tất cả danh mục</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group relative rounded-2xl bg-card border border-slate-800/80 p-5 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {getCategoryIcon(cat.icon_name)}
                  </div>
                  <h3 className="font-bold text-slate-100 group-hover:text-primary transition-colors text-sm">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-cyan-400 font-semibold">{cat.product_count || 12}+ sản phẩm</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. FEATURED PRODUCTS */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary mb-1">
                <Sparkles className="w-4 h-4" /> Tuyển chọn chất lượng cao
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
                Sản Phẩm Tiêu Biểu
              </h2>
            </div>
            <Link
              to="/products?featured=true"
              className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              <span>Xem thêm</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-80 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>

        {/* 4. PROMOTIONAL BANNER */}
        <section className="relative rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 border border-primary/30 p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent text-xs font-mono font-bold uppercase tracking-wider">
              Ưu đãi đặc quyền Developer
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
              Giảm ngay 20% cho đơn hàng mã nguồn từ 1.000.000 ₫
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Áp dụng cho mọi bộ mã nguồn E-commerce, SaaS Multi-tenant và Mobile Banking. Tích hợp thanh toán tự động, nhận mã kích hoạt và link tải GitHub repo trực tiếp.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-dashed border-accent/60 font-mono text-sm font-bold text-accent">
                MÃ: SUPERDEV20
              </div>
              <Link to="/products?type=SOURCE_CODE">
                <Button variant="accent">Áp dụng ngay</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 5. BEST SELLERS */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
                <Zap className="w-4 h-4" /> Bán chạy nhất tháng này
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
                Top Sản Phẩm Được Lựa Chọn
              </h2>
            </div>
            <Link
              to="/products?sort=popular"
              className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              <span>Xem danh sách</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* 6. NEWEST ARRIVALS */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
                <Download className="w-4 h-4" /> Cập nhật phiên bản mới
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
                Mới Lên Kệ
              </h2>
            </div>
            <Link
              to="/products?sort=newest"
              className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newestProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* 7. VERIFIED CUSTOMER TESTIMONIALS */}
        <section className="rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8 sm:p-12">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs uppercase font-mono tracking-widest text-primary font-bold">
              Đánh Giá Thực Tế
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">
              Khách Hàng Nói Gì Về ECOTDEV
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-brand-darkCard border border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "Hệ thống E-Commerce Pro Enterprise chạy siêu mượt. Đội ngũ support kỹ thuật phản hồi cực nhanh trên Telegram, code clean chuẩn TypeScript và Supabase RLS rất an toàn."
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                  alt="Trần Minh Hoàng"
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">Trần Minh Hoàng</h4>
                  <p className="text-[10px] text-slate-500">Tech Lead @ FPT Software</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-brand-darkCard border border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "Mua key JetBrains All Products Pack kích hoạt ngay vào email cá nhân trong chưa đầy 1 phút. Giá hợp lý, bảo hành rõ ràng, rất an tâm khi sử dụng cho công ty."
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100"
                  alt="Nguyễn Hải Nam"
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">Nguyễn Hải Nam</h4>
                  <p className="text-[10px] text-slate-500">Full-stack Developer @ VNG</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-brand-darkCard border border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "Bộ Cosmos Design System Figma tiết kiệm cho team mình hơn 2 tháng thiết kế. Auto Layout chuẩn, Dark mode chuyển đổi chỉ 1-click rất thông minh!"
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100"
                  alt="Lê Thùy Dung"
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">Lê Thùy Dung</h4>
                  <p className="text-[10px] text-slate-500">UI/UX Designer @ Viettel Digital</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. FAQ */}
        <section className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs uppercase font-mono tracking-widest text-accent font-bold">
              Giải Đáp Thắc Mắc
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">
              Câu Hỏi Thường Gặp
            </h2>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-card border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                <span>Sau khi thanh toán tôi nhận sản phẩm ở đâu?</span>
              </h3>
              <p className="text-xs text-slate-400 mt-2 pl-6 leading-relaxed">
                Ngay sau khi hệ thống xác nhận thanh toán (thường chỉ mất 15-30 giây qua VietQR hoặc VNPay), sản phẩm của bạn sẽ tự động xuất hiện trong mục <strong>Kho sản phẩm đã mua</strong> trong tài khoản. Bạn có thể tải file ZIP mã nguồn hoặc sao chép License Key bất cứ lúc nào.
              </p>
            </div>

            <div className="rounded-2xl bg-card border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-accent shrink-0" />
                <span>Mã nguồn có được cập nhật phiên bản mới không?</span>
              </h3>
              <p className="text-xs text-slate-400 mt-2 pl-6 leading-relaxed">
                Có. Tất cả khách hàng mua mã nguồn tại ECOTDEV đều được quyền tải về các phiên bản cập nhật vá lỗi hoặc nâng cấp tính năng mới miễn phí trong thời gian hỗ trợ (từ 180 đến 365 ngày tùy gói).
              </p>
            </div>

            <div className="rounded-2xl bg-card border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Chính sách bảo hành và hoàn tiền như thế nào?</span>
              </h3>
              <p className="text-xs text-slate-400 mt-2 pl-6 leading-relaxed">
                Đối với License Key: Bảo hành 1 đổi 1 suốt thời gian sử dụng nếu phát sinh lỗi từ hãng. Đối với Source code: Hỗ trợ kỹ thuật qua Telegram/Email để đảm bảo bạn chạy được dự án thành công trên máy tính hoặc máy chủ của mình.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
