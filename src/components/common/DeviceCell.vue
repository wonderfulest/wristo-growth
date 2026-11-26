<template>
  <div class="device-cell" v-if="device || partNumber">
    <img v-if="device?.imageUrl" :src="device.imageUrl" alt="" class="device-thumb" />
    <div class="device-info">
      <div class="device-name">{{ device?.displayName || partNumber }}</div>
      <div v-if="device && partNumber" class="device-sub">{{ t('序列号：', 'SN:') }} {{ partNumber }}</div>
    </div>
  </div>
  <span v-else>-</span>
</template>

<script setup lang="ts">
import { t } from '@/i18n'
import type { GarminDeviceBaseVO } from '@/types/device'

interface Props {
  device?: GarminDeviceBaseVO | null
  partNumber?: string | null
}

defineProps<Props>()
</script>

<style scoped>
.device-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.device-thumb {
  width: 40px;
  height: 40px;
  object-fit: contain;
  background: transparent;
}

.device-info {
  display: flex;
  flex-direction: column;
}

.device-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.device-sub {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
