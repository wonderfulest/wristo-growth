<template>
  <div class="promoter-profile-card">
    <div class="header">
      <div>
        <h2>{{ t('推广员资料', 'Promoter profile') }}</h2>
        <p class="subtitle">{{ t('概览', 'Overview') }}</p>
      </div>
      <el-tag :type="statusTagType" effect="plain">{{ profile?.status || 'unknown' }}</el-tag>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else class="stats-grid" v-loading="loading">
      <div class="stat-item">
        <div class="label">{{ t('累计收益', 'Total earned') }}</div>
        <div class="value">${{ formatCurrency(profile?.totalIncome || 0) }}</div>
      </div>
      <div class="stat-item">
        <div class="label">{{ t('已结算', 'Total paid') }}</div>
        <div class="value">${{ formatCurrency(profile?.totalWithdraw || 0) }}</div>
      </div>
      <div class="stat-item">
        <div class="label">{{ t('余额', 'Balance') }}</div>
        <div class="value highlight">${{ formatCurrency(profile?.balance || 0) }}</div>
      </div>
      <div class="stat-item">
        <div class="label">{{ t('等级', 'Level') }}</div>
        <div class="value">Lv.{{ profile?.level ?? '-' }}</div>
      </div>
      <div class="stat-item">
        <div class="label">{{ t('结算类型', 'Settle type') }}</div>
        <div class="value">{{ profile?.settleType || '-' }}</div>
      </div>
      <div class="stat-item">
        <div class="label">{{ t('收款方式', 'Payout method') }}</div>
        <div class="value">{{ profile?.payoutMethod || '-' }}</div>
      </div>
      <!-- <div class="stat-item span-2">
        <div class="label">收款账号</div>
        <div class="value mono">{{ profile?.payoutAccount || '-' }}</div>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { locale, t } from '@/i18n'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMyPromoterProfile, type PromoterProfile } from '@/api/promoter-stats'
import type { ApiResponse } from '@/types/api'

const router = useRouter()

const profile = ref<PromoterProfile | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const formatCurrency = (v: number): string => {
  return (v || 0).toLocaleString(locale.value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
      // No payout account: redirect to profile to complete info
      if (!res.data.payoutAccount) {
        ElMessage.warning(t('请先在个人资料中填写收款信息', 'Please add payout info in Profile first'))
        router.push('/account/profile')
        return
      }
      profile.value = res.data
    } else {
      error.value = res.msg || t('无法加载推广员资料', 'Failed to load promoter profile')
      ElMessage.warning(t('无法加载推广员资料，请在个人资料中检查收款信息', 'Failed to load promoter profile, check payout info in Profile'))
      router.push('/account/profile')
    }
  } catch (e) {
    error.value = t('网络错误', 'Network error')
    ElMessage.warning(t('网络错误，请稍后在个人资料中重试', 'Network error, please try again in Profile later'))
    router.push('/account/profile')
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
@media (max-width: 768px), (max-width: 960px) and (max-height: 500px) and (orientation: landscape) {
  .promoter-profile-card { min-width: 0; padding: 16px; border-radius: 12px; }
  .header { flex-wrap: wrap; gap: 8px; }
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .stat-item { min-width: 0; padding: 10px; }
  .stat-item .value { overflow-wrap: anywhere; font-size: clamp(15px, 4vw, 18px); }
}
</style>
