<template>
  <div class="dashboard-content">
    <h3 class="section-title">{{ t('应用销售总计', 'App sales total') }}</h3>

    <div v-if="summaryError" class="error-message">
      <p>{{ t('获取应用销售总计失败：', 'Unable to load app sales:') }}{{ summaryError }}</p>
    </div>

    <el-table v-loading="summaryLoading" :data="summaryList" border style="width: 100%" :empty-text="t('暂无数据', 'No data')">
      <el-table-column :label="t('应用', 'App')" min-width="240">
        <template #default="{ row }">
          <div class="app-cell">
            <img v-if="row.app?.garminImageUrl" :src="row.app.garminImageUrl" alt="" class="app-thumb" />
            <div class="app-info">
              <div class="app-name">{{ row.app?.name || 'App #' + row.appId }}</div>
              <div class="app-sub">ID: {{ row.appId }}</div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="salesCount" :label="t('销量', 'Units sold')" width="120" align="right" />
      <el-table-column :label="t('总金额', 'Total amount')" width="160" align="right">
        <template #default="{ row }">
          ${{ formatCurrency(row.totalAmount) }}
        </template>
      </el-table-column>
      <el-table-column prop="bundleTriggerCount" :label="t('触发套餐次数', 'Bundle hits')" width="160" align="right" />
    </el-table>

    <div class="table-footer">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="summaryTotal"
        :page-size="summaryPageSize"
        :current-page="summaryPageNum"
        :page-sizes="[10, 20, 50]"
        @current-change="handleSummaryCurrentChange"
        @size-change="handleSummarySizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { locale, t } from '@/i18n'
import { ref, onMounted } from 'vue'
import { getAppSalesSummaryPage } from '@/api/purchase'
import type { AppSalesSummaryVO, AppSalesSummaryPageQueryDTO } from '@/types/api'

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
    const dto: AppSalesSummaryPageQueryDTO = {
      pageNum: summaryPageNum.value,
      pageSize: summaryPageSize.value
    }
    const res = await getAppSalesSummaryPage(dto)
    if (res.code === 0 && res.data) {
      summaryList.value = res.data.list || []
      summaryTotal.value = res.data.total || 0
    } else {
      summaryError.value = res.msg || t('无法获取应用销量', 'Failed to fetch app sales summary')
    }
  } catch (e) {
    summaryError.value = t('网络错误', 'Network error occurred')
    console.error('Error fetching app sales summary:', e)
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
</style>
