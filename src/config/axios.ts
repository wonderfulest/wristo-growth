import { locale, t } from '@/i18n'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { BizErrorCode } from '@/constant/errorCode'
import type { ApiResponse } from '@/types/api'
import { useUserStore } from '@/store/user'
import { redirectToSsoLogin } from '@/utils/ssoRedirect'

const instance = axios.create({
  baseURL: '/api', // 走 vite 代理
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(config => {
  const userStore = useUserStore()
  config.headers['Accept-Language'] = locale.value
  const token = userStore.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function recoverSession() {
  if (window.location.pathname.startsWith('/auth/')) return
  useUserStore().$reset()
  ElMessage.error(t('登录已过期，请重新登录', 'Your session expired. Please sign in again.'))
  redirectToSsoLogin('growth', 1000, 'retry')
}

// 响应拦截器
instance.interceptors.response.use(
  async (response) => {
    if (response.config.responseType === 'blob') {
      if (response.data.type === 'image/png') return response.data
      const details = await response.data.text()
      let message = t('小程序码下载失败，请稍后重试', 'Unable to download the QR code. Try again later.')
      try {
        message = JSON.parse(details).msg || message
      } catch { /* Non-JSON error response */ }
      ElMessage.error(message)
      throw new Error(message)
    }
    const res: ApiResponse<any> = response.data
    if (res.code === BizErrorCode.SUCCESS) {
      return response.data // 返回原始 response
    } else if (res.code === 401 || res.code === 403) {
      recoverSession()
      return Promise.reject(res)
    } else {
      ElMessage.error(response.data.msg || t('请求失败', 'Request failed'))
      return Promise.reject(response.data)
    }
  },
  error => {
    const status = error.response?.status
    if (status === 401 || status === 403) {
      recoverSession()
    } else {
      ElMessage.error(t('网络错误，请稍后重试', 'Network error. Try again later.'))
    }
    return Promise.reject(error)
  }
)

export default instance
