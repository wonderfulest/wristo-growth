<template>
  <div class="promoter-profile-card">
    <div class="header">
      <div>
        <h2>我的推广员资料</h2>
        <p class="subtitle">整体分佣数据概览</p>
      </div>
      <el-tag :type="statusTagType" effect="plain">{{ profile?.status || 'unknown' }}</el-tag>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else class="stats-grid" v-loading="loading">
      <div class="stat-item">
        <div class="label">累计收入</div>
        <div class="value">${{ formatCurrency(profile?.totalIncome || 0) }}</div>
      </div>
      <div class="stat-item">
        <div class="label">累计提现</div>
        <div class="value">${{ formatCurrency(profile?.totalWithdraw || 0) }}</div>
      </div>
      <div class="stat-item">
        <div class="label">当前余额</div>
        <div class="value highlight">${{ formatCurrency(profile?.balance || 0) }}</div>
      </div>
      <div class="stat-item">
        <div class="label">等级</div>
        <div class="value">Lv.{{ profile?.level ?? '-' }}</div>
      </div>
      <div class="stat-item">
        <div class="label">结算方式</div>
        <div class="value">{{ profile?.settleType || '-' }}</div>
      </div>
      <div class="stat-item">
        <div class="label">收款方式</div>
        <div class="value">{{ profile?.payoutMethod || '-' }}</div>
      </div>
      <div class="stat-item span-2">
        <div class="label">收款账号</div>
        <div class="value mono">{{ profile?.payoutAccount || '-' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getMyPromoterProfile, type PromoterProfile } from '@/api/promoter-stats'
import type { ApiResponse } from '@/types/api'

const profile = ref<PromoterProfile | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const formatCurrency = (v: number): string => {
  return (v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const statusTagType = computed(() => {
  const s = profile.value?.status
  if (s === 'active') return 'success'
  if (s === 'pending') return 'warning'
  if (s === 'banned' || s === 'frozen') return 'danger'
  return 'info'
})

const loadProfile = async () => {
  try {
    loading.value = true
    error.value = null
    const res: ApiResponse<PromoterProfile> = await getMyPromoterProfile()
    if (res.code === 0 && res.data) {
      profile.value = res.data
    } else {
      error.value = res.msg || '获取推广员资料失败'
    }
  } catch (e) {
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(loadProfile)
</script>

<style scoped>
.promoter-profile-card {
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: #6c757d;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.stat-item {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #e9ecef;
  background: #f8f9fa;
}

.stat-item .label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 6px;
}

.stat-item .value {
  font-size: 18px;
  font-weight: 700;
  color: #212529;
}

.stat-item .value.highlight {
  color: #19b36b;
}

.stat-item.span-2 {
  grid-column: span 2;
}

.mono {
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 13px;
  word-break: break-all;
}

.error-message {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 16px;
  margin-top: 8px;
  color: #721c24;
}
</style>
