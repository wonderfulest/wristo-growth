<template>
  <div class="account-page">
    <h2 class="page-title">我的推广成交明细</h2>

    <div v-if="error" class="error-message">
      获取成交明细失败：{{ error }}
    </div>

    <el-table
      v-loading="loading"
      :data="deals"
      border
      style="width: 100%"
      empty-text="暂无成交记录"
    >
      <el-table-column prop="createdAt" label="成交时间" min-width="180">
        <template #default="{ row }">
          {{ formatTimestamp(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="orderId" label="订单ID" width="140" />
      <el-table-column label="订单金额" width="140" align="right">
        <template #default="{ row }">
          ${{ formatCurrency(row.baseAmount) }}
        </template>
      </el-table-column>
      <el-table-column label="分佣比例" width="120" align="right">
        <template #default="{ row }">
          {{ formatRate(row.rate) }}
        </template>
      </el-table-column>
      <el-table-column label="分佣金额" width="140" align="right">
        <template #default="{ row }">
          ${{ formatCurrency(row.commissionAmount) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag>{{ row.status }}</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <div class="table-footer">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :page-size="pageSize"
        :current-page="pageNum"
        :page-sizes="[10, 20, 50]"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getMyDealsPage, type PromoterDealsPageQueryDTO, type PromoterDealItemVO } from '@/api/promoter-stats'
import type { ApiResponse, PageResponse } from '@/types/api'

const deals = ref<PromoterDealItemVO[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-')
}

const formatCurrency = (amount: number): string => {
  return (amount || 0).toFixed(2)
}

const formatRate = (rate: number): string => {
  if (!rate && rate !== 0) return '-'
  return `${(rate).toFixed(2)}%`
}

const fetchDeals = async () => {
  try {
    loading.value = true
    error.value = null
    const dto: PromoterDealsPageQueryDTO = {
      pageNum: pageNum.value,
      pageSize: pageSize.value
    }
    const res: ApiResponse<PageResponse<PromoterDealItemVO>> = await getMyDealsPage(dto)
    if (res.code === 0 && res.data) {
      deals.value = res.data.list || []
      total.value = res.data.total || 0
    } else {
      error.value = res.msg || '获取成交明细失败'
    }
  } catch (e) {
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  pageNum.value = page
  fetchDeals()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  pageNum.value = 1
  fetchDeals()
}

onMounted(fetchDeals)
</script>

<style scoped>
.account-page {
  padding: 32px;
  background: #fff;
  min-height: 300px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
}

.error-message {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  color: #721c24;
}

.table-footer {
  color: #6c757d;
}
.detail-item .v {
  color: #212529;
  font-weight: 500;
  word-break: break-all;
  text-align: right;
}

.nested-section {
  margin-top: 16px;
  padding-top: 8px;
  border-top: 2px solid #f1f3f5;
}
.nested-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #495057;
}
.nested-content {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.nested-thumb {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}
.nested-fields > div { padding: 2px 0; }

.bundle-products {
  margin-top: 10px;
}
.bp-title {
  font-weight: 600;
  color: #495057;
  margin-bottom: 6px;
}
.bundle-products ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.bundle-products li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px dashed #e9ecef;
}
.bp-thumb {
  width: 28px;
  height: 28px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}
.bp-name { color: #212529; }

/* preserve newlines and wrapping for multiline text in descriptions */
.multiline {
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 768px) {
  .purchase-table {
    font-size: 12px;
  }
  
  .purchase-table th,
  .purchase-table td {
    padding: 8px 12px;
  }
  
  .product-image,
  .no-image-placeholder {
    width: 32px;
    height: 32px;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 12px;
  }
}
</style> 