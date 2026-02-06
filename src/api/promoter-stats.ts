import instance from '@/config/axios'
import type { ApiResponse, PageResponse } from '@/types/api'
import type { AppSalesSummaryVO } from '@/types/sales'

export interface PromoterAppSalesSummaryPageQueryDTO {
  pageNum?: number
  pageSize?: number
}

export interface PromoterProfile {
  id: number
  userId: number
  level: number
  status: string
  settleType: string
  payoutMethod: string | null
  payoutAccount: string | null
  totalIncome: number
  totalWithdraw: number
  balance: number
  applyTime?: string | null
  approvedTime?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface PromoterDealsPageQueryDTO {
  pageNum?: number
  pageSize?: number
}

export interface PromoterDealItemVO {
  id: number
  orderId: number
  baseAmount: number
  rate: number
  commissionAmount: number
  status: string
  createdAt: string
}

export const getMyPromoterProfile = (): Promise<ApiResponse<PromoterProfile>> => {
  return instance.post('/prom/stats/profile')
}

export const getMyAppSalesSummaryPage = (
  dto: PromoterAppSalesSummaryPageQueryDTO
): Promise<ApiResponse<PageResponse<AppSalesSummaryVO>>> => {
  return instance.post('/prom/stats/app/summary/page', dto)
}

export const getMyDealsPage = (
  dto: PromoterDealsPageQueryDTO
): Promise<ApiResponse<PageResponse<PromoterDealItemVO>>> => {
  return instance.post('/prom/stats/deals/page', dto)
}
