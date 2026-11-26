<template>
  <div class="dashboard-content">
    <h3 class="section-title">{{ t('推广应用销量', 'App sales (promo)') }}</h3>

    <div v-if="summaryError" class="error-message">
      <p>{{ t('无法加载应用销量：', 'Failed to load app sales:') }} {{ summaryError }}</p>
    </div>

    <el-table v-if="!compact" v-loading="summaryLoading" :data="summaryList" border style="width: 100%" :empty-text="t('暂无数据', 'No data')">
      <el-table-column :label="t('应用', 'App')" min-width="240">
        <template #default="{ row }">
          <AppCell
            :title="row.app?.name || 'App #' + row.appId"
            :subtitle="'ID: ' + row.appId"
            :image-url="row.app?.garminImageUrl"
            :link-url="row.app?.garminStoreUrl || null"
          />
        </template>
      </el-table-column>

      <el-table-column prop="salesCount" :label="t('销量', 'Units')" width="120" align="right" />
      <el-table-column :label="t('销售额', 'Revenue')" width="160" align="right">
        <template #default="{ row }">
          ${{ formatCurrency(row.totalAmount) }}
        </template>
      </el-table-column>
      <el-table-column prop="bundleTriggerCount" :label="t('触发套餐次数', 'Bundle hits')" width="160" align="right" />
    </el-table>

    <div v-else class="sales-cards" v-loading="summaryLoading" :aria-busy="summaryLoading">
      <article v-for="row in summaryList" :key="row.appId" class="sales-card">
        <AppCell :title="row.app?.name || 'App #' + row.appId" :subtitle="'ID: ' + row.appId"
          :image-url="row.app?.garminImageUrl" :link-url="row.app?.garminStoreUrl || null" />
        <dl class="sales-metrics">
          <div><dt>{{ t('销量', 'Units') }}</dt><dd>{{ row.salesCount }}</dd></div>
          <div><dt>{{ t('销售额', 'Revenue') }}</dt><dd>${{ formatCurrency(row.totalAmount) }}</dd></div>
          <div><dt>{{ t('触发套餐次数', 'Bundle hits') }}</dt><dd>{{ row.bundleTriggerCount }}</dd></div>
        </dl>
      </article>
      <p v-if="!summaryList.length && !summaryLoading && !summaryError" class="empty-sales">{{ t('暂无数据', 'No data') }}</p>
    </div>
    <div class="table-footer">
      <el-pagination
        background
        :layout="compact ? 'prev, slot, next' : 'total, sizes, prev, pager, next, jumper'"
        :total="summaryTotal"
        :page-size="summaryPageSize"
        :current-page="summaryPageNum"
        :page-sizes="[10, 20, 50]"
        @current-change="handleSummaryCurrentChange"
        @size-change="handleSummarySizeChange"
      ><span v-if="compact" aria-live="polite">{{ summaryPageNum }} / {{ Math.max(1, Math.ceil(summaryTotal / summaryPageSize)) }}</span></el-pagination>
      <label v-if="compact" class="page-size">{{ t('每页条数', 'Per page') }}
        <select :value="summaryPageSize" @change="handleSummarySizeChange(Number(($event.target as HTMLSelectElement).value))">
          <option v-for="size in [10, 20, 50]" :key="size" :value="size">{{ size }}</option>
        </select>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { locale, t } from '@/i18n'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import AppCell from '@/components/common/AppCell.vue'
import { getMyAppSalesSummaryPage, type PromoterAppSalesSummaryPageQueryDTO } from '@/api/promoter-stats'
import type { AppSalesSummaryVO, ApiResponse, PageResponse } from '@/types/api'

const screen = window.matchMedia('(max-width: 768px), (max-width: 960px) and (max-height: 500px) and (orientation: landscape)')
const compact = ref(screen.matches)
const updateLayout = () => { compact.value = screen.matches }
onMounted(() => screen.addEventListener('change', updateLayout))
onBeforeUnmount(() => screen.removeEventListener('change', updateLayout))

const summaryList = ref<AppSalesSummaryVO[]>([])
const summaryLoading = ref(false)
const summaryError = ref<string | null>(null)
const summaryPageNum = ref(1)
const summaryPageSize = ref(10)
const summaryTotal = ref(0)

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString(locale.value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const fetchSummaryPage = async () => {
  try {
    summaryLoading.value = true
    summaryError.value = null
    const dto: PromoterAppSalesSummaryPageQueryDTO = {
      pageNum: summaryPageNum.value,
      pageSize: summaryPageSize.value
    }
    const res: ApiResponse<PageResponse<AppSalesSummaryVO>> = await getMyAppSalesSummaryPage(dto)
    if (res.code === 0 && res.data) {
      summaryList.value = res.data.list || []
      summaryTotal.value = res.data.total || 0
    } else {
      summaryError.value = res.msg || t('无法加载应用销量', 'Failed to load app sales')
    }
  } catch (e) {
    summaryError.value = t('网络错误', 'Network error')
    console.error('Error fetching promoter app sales summary:', e)
  } finally {
    summaryLoading.value = false
  }
}

const handleSummaryCurrentChange = (page: number) => {
  summaryPageNum.value = page
  fetchSummaryPage()
}

const handleSummarySizeChange = (size: number) => {
  summaryPageSize.value = size
  summaryPageNum.value = 1
  fetchSummaryPage()
}

onMounted(fetchSummaryPage)
</script>

<style scoped>
.dashboard-content { margin-top: 32px; }
.section-title { font-size: 18px; font-weight: 700; color: #212529; margin: 16px 0; }
.app-cell { display: flex; align-items: center; gap: 12px; }
.app-thumb { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; border: 1px solid #e9ecef; }
.app-info { display: flex; flex-direction: column; }
.app-name { font-weight: 600; color: #212529; }
.app-sub { font-size: 12px; color: #6c757d; }
.table-footer { display: flex; justify-content: flex-end; padding: 12px 0; }
.error-message { background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 16px; margin: 24px 0; color: #721c24; }
@media (max-width: 768px), (max-width: 960px) and (max-height: 500px) and (orientation: landscape) {
  .dashboard-content { min-width: 0; margin-top: 0; }
  .section-title { margin: 0 0 12px; }
  .sales-cards { display: grid; gap: 10px; min-height: 52px; }
  .sales-card, .empty-sales { min-width: 0; border: 1px solid #e2e6ea; background: white; border-radius: 12px; padding: 14px; }
  .sales-card :deep(.app-info) { min-width: 0; overflow-wrap: anywhere; }
  .sales-card :deep(.app-thumb) { flex-shrink: 0; }
  .sales-metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin: 14px 0 0; }
  .sales-metrics dt, .empty-sales { color: #596570; font-size: 13px; }
  .sales-metrics dd { margin: 4px 0 0; font-weight: 600; overflow-wrap: anywhere; }
  .table-footer { align-items: center; flex-wrap: wrap; justify-content: space-between; gap: 8px; }
  .table-footer :deep(button), .page-size select { min-width: 44px; min-height: 44px; }
  .page-size { display: flex; gap: 6px; align-items: center; font-size: 13px; }
  .page-size select { background: white; border: 1px solid #d5dae0; border-radius: 6px; color: inherit; font: inherit; }
}
</style>
