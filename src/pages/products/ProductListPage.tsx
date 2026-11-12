import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, Search, SlidersHorizontal, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { productService } from '@/services/productService'
import { Product, Category, ProductType } from '@/types'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'

export const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Query params extraction
  const categoryParam = searchParams.get('category') || 'all'
  const typeParam = searchParams.get('type') || 'all'
  const searchParam = searchParams.get('search') || ''
  const sortParam = (searchParams.get('sort') as any) || 'newest'
  const featuredParam = searchParams.get('featured') === 'true'
  const pageParam = Number(searchParams.get('page')) || 1

  const [searchInput, setSearchInput] = useState(searchParam)
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined)
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [cats, result] = await Promise.all([
          productService.getCategories(),
          productService.getProducts({
            categorySlug: categoryParam,
            productType: typeParam,
            search: searchParam,
            sortBy: sortParam,
            featuredOnly: featuredParam,
            minPrice,
            maxPrice,
            page: pageParam,
            pageSize: 12,
          }),
        ])
        setCategories(cats)
        setProducts(result.products)
        setTotalCount(result.total)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [searchParams, minPrice, maxPrice])

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'all' || !value) {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    next.set('page', '1')
    setSearchParams(next)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateParam('search', searchInput)
  }

  const clearAllFilters = () => {
    setSearchInput('')
    setMinPrice(undefined)
    setMaxPrice(undefined)
    setSearchParams(new URLSearchParams())
  }

  const totalPages = Math.ceil(totalCount / 12) || 1

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', newPage.toString())
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Kho Sản Phẩm Kỹ Thuật Số
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Hiển thị <span className="text-accent font-bold font-mono">{products.length}</span> trên tổng số{' '}
            <span className="text-slate-200 font-bold font-mono">{totalCount}</span> sản phẩm phù hợp
          </p>
        </div>

        {/* Search input + Mobile filter toggle */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Tìm theo từ khóa..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700/80 pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Sort selection */}
          <select
            value={sortParam}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-primary"
          >
            <option value="newest">Mới nhất</option>
            <option value="popular">Bán chạy nhất</option>
            <option value="rating">Đánh giá cao</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mt-8 flex gap-8 items-start">
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-6 bg-card border border-slate-800/80 rounded-2xl p-5 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
              <Filter className="w-4 h-4 text-accent" />
              <span>Bộ lọc tìm kiếm</span>
            </div>
            <button
              onClick={clearAllFilters}
              className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Xóa lọc</span>
            </button>
          </div>

          {/* Categories Filter */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2.5">
              Danh Mục
            </h4>
            <div className="space-y-1">
              <button
                onClick={() => updateParam('category', 'all')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition ${
                  categoryParam === 'all'
                    ? 'bg-primary text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Tất cả danh mục
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateParam('category', c.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                    categoryParam === c.slug
                      ? 'bg-primary text-white font-semibold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Product Type Filter */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2.5">
              Loại Sản Phẩm
            </h4>
            <div className="space-y-1">
              {[
                { id: 'all', label: 'Tất cả loại' },
                { id: 'SOURCE_CODE', label: 'Source Code' },
                { id: 'TEMPLATE', label: 'Website Templates' },
                { id: 'LICENSE_KEY', label: 'License Keys' },
                { id: 'DIGITAL_SERVICE', label: 'Dịch vụ số & Cloud' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => updateParam('type', t.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition ${
                    typeParam === t.id
                      ? 'bg-accent/20 text-accent font-semibold border border-accent/40'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2.5">
              Khoảng Giá (VND)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Từ"
                value={minPrice ?? ''}
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
              />
              <input
                type="number"
                placeholder="Đến"
                value={maxPrice ?? ''}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
              />
            </div>
          </div>
        </aside>

        {/* PRODUCTS GRID */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-80 w-full" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-card border border-slate-800 rounded-2xl p-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">Không tìm thấy sản phẩm nào</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ các tiêu chí lọc đang chọn.
              </p>
              <Button onClick={clearAllFilters} variant="primary">
                Xem toàn bộ sản phẩm
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pageParam <= 1}
                    onClick={() => handlePageChange(pageParam - 1)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    <span>Trước</span>
                  </Button>

                  {[...Array(totalPages)].map((_, idx) => {
                    const pNum = idx + 1
                    return (
                      <button
                        key={pNum}
                        onClick={() => handlePageChange(pNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                          pageParam === pNum
                            ? 'bg-primary text-white shadow-md shadow-primary/25'
                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                        }`}
                      >
                        {pNum}
                      </button>
                    )
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pageParam >= totalPages}
                    onClick={() => handlePageChange(pageParam + 1)}
                  >
                    <span>Tiếp</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
