export interface PromoterCoupon {
  id: number
  couponCode: string
  promoterId: number
  campaignId: number | null
  description: string | null
  discountType: string
  discountValue: number
  paddleDiscountId?: string | null
  commissionRate: number
  maxUse?: number | null
  usedCount?: number | null
  status: number
  expireAt?: string | null
  createdAt: string
}
