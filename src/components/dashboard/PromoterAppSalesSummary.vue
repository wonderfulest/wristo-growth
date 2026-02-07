<template>
  <div class="dashboard-content">
    <h3 class="section-title">App sales (promo)</h3>

    <div v-if="summaryError" class="error-message">
      <p>Failed to load app sales: {{ summaryError }}</p>
    </div>

    <el-table v-loading="summaryLoading" :data="summaryList" border style="width: 100%" empty-text="No data">
      <el-table-column label="App" min-width="240">
        <template #default="{ row }">
          <AppCell
            :title="row.app?.name || 'App #' + row.appId"
            :subtitle="'ID: ' + row.appId"
            :image-url="row.app?.garminImageUrl"
            :link-url="row.app?.garminStoreUrl || null"
          />
        </template>
      </el-table-column>

      <el-table-column prop="salesCount" label="Units" width="120" align="right" />
      <el-table-column label="Revenue" width="160" align="right">
        <template #default="{ row }">
          ${{ formatCurrency(row.totalAmount) }}
        </template>
      </el-table-column>
      <el-table-column prop="bundleTriggerCount" label="Bundle hits" width="160" align="right" />
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
import { ref, onMounted } from 'vue'
import AppCell from '@/components/common/AppCell.vue'
import { getMyAppSalesSummaryPage, type PromoterAppSalesSummaryPageQueryDTO } from '@/api/promoter-stats'
import type { AppSalesSummaryVO, ApiResponse, PageResponse } from '@/types/api'

const summaryList = ref<AppSalesSummaryVO[]>([])
const summaryLoading = ref(false)
const summaryError = ref<string | null>(null)
const summaryPageNum = ref(1)
const summaryPageSize = ref(10)
const summaryTotal = ref(0)

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
      summaryError.value = res.msg || 'Failed to load app sales'
    }
  } catch (e) {
    summaryError.value = 'Network error'
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
</style>
