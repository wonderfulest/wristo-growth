import instance from '@/config/axios'
import type { ApiResponse } from '@/types/api'
import type { GarminDeviceBaseVO } from '@/types/device'

export const getGarminDevices = (): Promise<ApiResponse<GarminDeviceBaseVO[]>> => {
  return instance.get('/public/products/garmin-devices/list')
}
