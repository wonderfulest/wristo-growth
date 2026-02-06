import instance from '@/config/axios'
import type { ApiResponse, UserInfo, PromUserVO, PromUserUpdateDTO } from '@/types/api'

export const getUserInfo = (): Promise<ApiResponse<UserInfo>> => {
  return instance.get('/users/info')
}

export const getPromUserInfo = (): Promise<ApiResponse<PromUserVO>> => {
	return instance.get('/prom/user/info')
}

export const updatePromUserInfo = (data: PromUserUpdateDTO): Promise<ApiResponse<boolean>> => {
	return instance.post('/prom/user/update', data)
}

export const uploadAvatar = (file: File): Promise<ApiResponse<string>> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', 'promoter/avatar')
  formData.append('suffix', file.name.split('.').pop() || 'png')
  return instance.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
