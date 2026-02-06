export interface UserInfo {
  id: number
  username: string
  nickname: string | null
  email: string
  phone: string | null
  avatar: string | null
  status: string | null
  createdAt: string
  updatedAt: string
  lastLoginTime: string | null
  lastLoginIp: string | null
  isDeleted: string
  roles: any[]
}

export interface LoginResponseData {
  token: string
  userInfo: UserInfo
}

export interface UserBaseVO {
  id: number
  username: string
  nickname: string | null
  email: string
}

export interface MchUserVO extends UserInfo {
  payoutMethod: string | null
  payoutAccount: string | null

  bannerImageId?: number | null
  bannerImage?: any
  slogan?: string | null
  facebookUrl?: string | null
  instagramUrl?: string | null
  xUrl?: string | null
  appCount?: number | null
  totalDownloads?: number | null
}

export interface UserMchUpdateDTO {
  username?: string
  nickname?: string
  avatar?: string
  status?: number
  payoutMethod?: string
  payoutAccount?: string

  bannerImageId?: number
  slogan?: string
  facebookUrl?: string
  instagramUrl?: string
  xUrl?: string
  appCount?: number
  totalDownloads?: number
}

export interface PromUserVO extends UserInfo {
  payoutMethod?: string | null
  payoutAccount?: string | null

  level?: number | null
  /** 推广员身份状态 */
  promoterStatus?: string | null
  settleType?: string | null

  totalIncome?: string | number | null
  totalWithdraw?: string | number | null
  balance?: string | number | null

  applyTime?: string | null
  approvedTime?: string | null
}

export interface PromUserUpdateDTO {
  username?: string
  nickname?: string
  avatar?: string
  /** 用户主状态 */
  status?: number
  payoutMethod?: string
  payoutAccount?: string
}
