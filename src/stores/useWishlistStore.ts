import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/types'

interface WishlistState {
  wishlist: Product[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  toggleWishlist: (product: Product) => boolean
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: [],
      addToWishlist: (product) => {
        if (!get().isInWishlist(product.id)) {
          set({ wishlist: [...get().wishlist, product] })
        }
      },
      removeFromWishlist: (productId) => {
        set({ wishlist: get().wishlist.filter((p) => p.id !== productId) })
      },
      isInWishlist: (productId) => {
        return get().wishlist.some((p) => p.id === productId)
      },
      toggleWishlist: (product) => {
        const inList = get().isInWishlist(product.id)
        if (inList) {
          get().removeFromWishlist(product.id)
          return false
        } else {
          get().addToWishlist(product)
          return true
        }
      },
    }),
    {
      name: 'ecotdev-wishlist-storage',
    }
  )
)
