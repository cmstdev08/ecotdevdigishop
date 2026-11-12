import { format, formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

/**
 * Format number to Vietnamese Dong currency (e.g. 1.250.000 ₫)
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format bytes to readable string (e.g. 45.2 MB)
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Format date to standard Vietnamese date string
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—'
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi })
  } catch {
    return dateString
  }
}

/**
 * Format relative time (e.g. 5 phút trước)
 */
export function formatRelativeTime(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi })
  } catch {
    return dateString
  }
}

/**
 * Calculate discount percentage from price and sale_price
 */
export function calculateDiscountPercent(price: number, salePrice?: number | null): number {
  if (!salePrice || salePrice >= price) return 0
  return Math.round(((price - salePrice) / price) * 100)
}
