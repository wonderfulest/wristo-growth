import instance from '@/config/axios'
import type { ApiResponse, PageResponse } from '@/types/api'
import type { PromoterCoupon } from '@/types/coupon'

export interface PromoterCouponPageQuery {
  couponCodeLike?: string
  promoterId?: number
  status?: number | null
  pageNum?: number
  pageSize?: number
  orderBy?: string
}

export const fetchPromoterCouponPage = (
  query: PromoterCouponPageQuery
): Promise<ApiResponse<PageResponse<PromoterCoupon>>> => {
  return instance.post('/admin/promoter/coupons/page', query)
}

// 创建推广口令 DTO（不包含 promoterId，后端绑定当前推广员）
export interface PromoterCouponCreateDTO {
  couponCode: string
  campaignId?: number | null
  description?: string | null
  discountType: string
  discountValue: number
  commissionRate: number
  maxUse?: number | null
  status?: number | null
  expireAt?: string | null
}

// 与后端 PromoterCouponUpdateDTO 对齐，用于限制更新时可提交的字段
export interface PromoterCouponUpdateDTO {
  id: number
  couponCode?: string
  promoterId?: number
  campaignId?: number | null
  description?: string | null
  discountType?: string
  discountValue?: number
  paddleDiscountId?: string | null
  commissionRate?: number
  maxUse?: number | null
  usedCount?: number | null
  status?: number | null
  expireAt?: string | null
}

export const enablePromoterCoupon = (id: number): Promise<ApiResponse<PromoterCoupon>> => {
  return instance.post('/prom/coupons/enable', null, { params: { id } })
}

export const disablePromoterCoupon = (id: number): Promise<ApiResponse<PromoterCoupon>> => {
  return instance.post('/prom/coupons/disable', null, { params: { id } })
}

export const updatePromoterCoupon = (dto: PromoterCouponUpdateDTO): Promise<ApiResponse<PromoterCoupon>> => {
  return instance.post('/prom/coupons/update', dto)
}

export const createPromoterCoupon = (dto: PromoterCouponCreateDTO): Promise<ApiResponse<PromoterCoupon>> => {
  return instance.post('/prom/coupons/create', dto)
}

export const generatePromoterCouponCode = (length = 4): Promise<ApiResponse<string>> => {
  return instance.get('/prom/coupons/generate-code', { params: { length } })
}
