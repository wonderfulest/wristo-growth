<template>
  <div class="device-cell" v-if="device || partNumber">
    <img v-if="device?.imageUrl" :src="device.imageUrl" alt="" class="device-thumb" />
    <div class="device-info">
      <div class="device-name">{{ device?.displayName || partNumber }}</div>
      <div v-if="device && partNumber" class="device-sub">SN: {{ partNumber }}</div>
    </div>
  </div>
  <span v-else>-</span>
</template>

<script setup lang="ts">
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
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #e9ecef;
}

.device-info {
  display: flex;
  flex-direction: column;
}

.device-name {
  font-weight: 500;
  color: #212529;
}

.device-sub {
  font-size: 12px;
  color: #6c757d;
}
</style>
