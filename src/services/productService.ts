import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Product, Category, Review } from '@/types'
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '@/data/mockData'

// In-memory / localStorage cache for seamless reactive modifications
const LOCAL_PRODUCTS_KEY = 'ecotdev_products_store'
const LOCAL_REVIEWS_KEY = 'ecotdev_reviews_store'

function getStoredProducts(): Product[] {
  const data = localStorage.getItem(LOCAL_PRODUCTS_KEY)
  if (!data) {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS))
    return INITIAL_PRODUCTS
  }
  return JSON.parse(data)
}

function saveStoredProducts(products: Product[]) {
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products))
}

export const productService = {
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
      if (!error && data && data.length > 0) return data as Category[]
    }
    return INITIAL_CATEGORIES
  },

  async getProducts(params?: {
    categorySlug?: string
    search?: string
    productType?: string
    minPrice?: number
    maxPrice?: number
    sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'popular' | 'rating'
    featuredOnly?: boolean
    page?: number
    pageSize?: number
  }): Promise<{ products: Product[]; total: number }> {
    let list = getStoredProducts()

    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('products').select('*, category:categories(*)', { count: 'exact' })
        if (params?.featuredOnly) query = query.eq('is_featured', true)
        if (params?.productType) query = query.eq('product_type', params.productType)
        const { data, count, error } = await query
        if (!error && data && data.length > 0) {
          list = data as Product[]
        }
      } catch {
        // Fall back to local store
      }
    }

    // Filter
    if (params?.categorySlug && params.categorySlug !== 'all') {
      const cat = INITIAL_CATEGORIES.find((c) => c.slug === params.categorySlug)
      if (cat) {
        list = list.filter((p) => p.category_id === cat.id)
      }
    }

    if (params?.search && params.search.trim()) {
      const query = params.search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tech_stack.some((t) => t.toLowerCase().includes(query))
      )
    }

    if (params?.productType && params.productType !== 'all') {
      list = list.filter((p) => p.product_type === params.productType)
    }

    if (params?.minPrice !== undefined) {
      list = list.filter((p) => (p.sale_price ?? p.price) >= params.minPrice!)
    }

    if (params?.maxPrice !== undefined) {
      list = list.filter((p) => (p.sale_price ?? p.price) <= params.maxPrice!)
    }

    if (params?.featuredOnly) {
      list = list.filter((p) => p.is_featured)
    }

    // Sort
    switch (params?.sortBy) {
      case 'price-asc':
        list.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price))
        break
      case 'price-desc':
        list.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price))
        break
      case 'popular':
        list.sort((a, b) => b.sales_count - a.sales_count)
        break
      case 'rating':
        list.sort((a, b) => b.rating_avg - a.rating_avg)
        break
      case 'newest':
      default:
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
    }

    const total = list.length
    const page = params?.page || 1
    const pageSize = params?.pageSize || 12
    const startIndex = (page - 1) * pageSize
    const paginated = list.slice(startIndex, startIndex + pageSize)

    return { products: paginated, total }
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const list = getStoredProducts()
    const found = list.find((p) => p.slug === slug)
    if (found) return found

    if (isSupabaseConfigured) {
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .single()
      if (data) return data as Product
    }
    return null
  },

  async getReviews(productId: string): Promise<Review[]> {
    const defaultReviews: Review[] = [
      {
        id: `rev-1-${productId}`,
        user_id: 'u-rev-1',
        product_id: productId,
        rating: 5,
        content: 'Mã nguồn được cấu trúc cực kỳ sạch, comment rõ ràng và chuẩn TypeScript. Tích hợp thanh toán chạy ngay không cần sửa gì nhiều!',
        is_verified_purchase: true,
        is_approved: true,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        author_name: 'Trần Minh Hoàng (Tech Lead)',
        author_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      },
      {
        id: `rev-2-${productId}`,
        user_id: 'u-rev-2',
        product_id: productId,
        rating: 5,
        content: 'Hệ thống tự động cấp key và link tải trong 10 giây sau khi chuyển khoản. Rất hài lòng với dịch vụ hỗ trợ của ECOTDEV!',
        is_verified_purchase: true,
        is_approved: true,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        author_name: 'Lê Thanh Bình',
        author_avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
      },
    ]

    const stored = localStorage.getItem(LOCAL_REVIEWS_KEY)
    const allReviews: Review[] = stored ? JSON.parse(stored) : defaultReviews
    return allReviews.filter((r) => r.product_id === productId)
  },

  async createReview(data: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    const newRev: Review = {
      ...data,
      id: `rev-${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    const stored = localStorage.getItem(LOCAL_REVIEWS_KEY)
    const list: Review[] = stored ? JSON.parse(stored) : []
    list.unshift(newRev)
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(list))
    return newRev
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const newProduct: Product = {
      id: `p-${Date.now()}`,
      category_id: data.category_id || INITIAL_CATEGORIES[0].id,
      name: data.name || 'Sản phẩm mới',
      slug: data.slug || `product-${Date.now()}`,
      description: data.description || '',
      short_description: data.short_description || '',
      price: data.price || 0,
      sale_price: data.sale_price ?? null,
      thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
      product_type: data.product_type || 'SOURCE_CODE',
      status: data.status || 'PUBLISHED',
      is_featured: Boolean(data.is_featured),
      version: data.version || '1.0.0',
      demo_url: data.demo_url || null,
      documentation_url: data.documentation_url || null,
      features: data.features || [],
      tech_stack: data.tech_stack || [],
      license_terms: data.license_terms || 'Standard License',
      support_period_days: data.support_period_days || 365,
      sales_count: 0,
      rating_avg: 5.0,
      rating_count: 0,
      created_at: new Date().toISOString(),
    }

    const products = getStoredProducts()
    products.unshift(newProduct)
    saveStoredProducts(products)

    if (isSupabaseConfigured) {
      await supabase.from('products').insert([newProduct])
    }

    return newProduct
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const products = getStoredProducts()
    const index = products.findIndex((p) => p.id === id)
    if (index === -1) throw new Error('Product not found')

    const updated = { ...products[index], ...updates, updated_at: new Date().toISOString() }
    products[index] = updated
    saveStoredProducts(products)

    if (isSupabaseConfigured) {
      await supabase.from('products').update(updates).eq('id', id)
    }

    return updated
  },

  async deleteProduct(id: string): Promise<boolean> {
    const products = getStoredProducts()
    const filtered = products.filter((p) => p.id !== id)
    saveStoredProducts(filtered)

    if (isSupabaseConfigured) {
      await supabase.from('products').delete().eq('id', id)
    }

    return true
  },
}
