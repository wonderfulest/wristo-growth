import instance from '@/config/axios'
import type { ApiResponse } from '@/types/api'

const domesticMaterials = { baseURL: 'https://api.wristo.cn/api', withCredentials: false }

export interface OfflineProfile {
  code: string
  discountPercent: number
}

export const fetchOfflineProfile = (): Promise<ApiResponse<OfflineProfile>> =>
  instance.get('/prom/offline/profile', domesticMaterials)

export const saveOfflineDiscount = (discountPercent: number): Promise<ApiResponse<OfflineProfile>> =>
  instance.put('/prom/offline/profile', { discountPercent }, domesticMaterials)

export const downloadOfflineQr = (): Promise<Blob> =>
  instance.get('/prom/offline/qrcode', { ...domesticMaterials, responseType: 'blob' })

export interface OfflineEarnings {
  boundUsers: number
  paidUsers: number
  commissionFen: number
  total: number
  items: {
    orderNo: string
    paidAmountFen: number
    commissionFen: number
    status: 'EARNED' | 'REVERSED' | 'TEST_EARNED'
    paidAt: string | null
    buyerNickname?: string | null
    productName?: string | null
  }[]
}

export const fetchOfflineEarnings = (page: number): Promise<ApiResponse<OfflineEarnings>> =>
  instance.get('/prom/offline/earnings', { params: { page } })

export interface Downline {
  userId: number
  name: string
  email?: string | null
  boundAt: string
}

export interface CashOrder {
  userId: number
  name: string
  orderNo: string
  amount: string
  currency: string
  paymentMethod: string
  status: string
  paidAt: string
}

export interface PromotionPage<T> {
  items: T[]
  hasMore: boolean
}

export const fetchDownlines = (page: number): Promise<ApiResponse<PromotionPage<Downline>>> =>
  instance.get('/prom/offline/downlines', { params: { page } })

export const fetchCashOrders = (cursor?: string, buyerId?: number): Promise<ApiResponse<PromotionPage<CashOrder> & { nextCursor?: string | null }>> =>
  instance.get('/prom/offline/cash-orders', { params: { cursor, buyerId } })
