<template>
  <div class="account-page">
    <h2 class="page-title">Promoter deals</h2>

    <div v-if="error" class="error-message">
      Failed to load deals: {{ error }}
    </div>

    <el-table v-if="!compact"
      v-loading="loading"
      :data="deals"
      border
      style="width: 100%"
      empty-text="No deals"
    >
      <el-table-column prop="createdAt" label="Time" min-width="180">
        <template #default="{ row }">
          {{ formatTimestamp(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="Product" min-width="240">
        <template #default="{ row }">
          <AppCell
            :title="productTitle(row)"
            :subtitle="productSubtitle(row)"
            :image-url="productImage(row)"
            :link-url="productLink(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="order.email" label="Customer" min-width="200">
        <template #default="{ row }">
          {{ row.order?.email ? maskEmail(row.order.email) : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="order.partNumber" label="Device" min-width="220">
        <template #default="{ row }">
          <DeviceCell :device="deviceForRow(row)" :part-number="row.order?.partNumber || ''" />
        </template>
      </el-table-column>
      <el-table-column label="Order" width="140" align="right">
        <template #default="{ row }">
          ${{ formatCurrency(row.baseAmount) }}
        </template>
      </el-table-column>
      <el-table-column label="Rate" width="140" align="right">
        <template #default="{ row }">
          {{ formatRate(row.rate) }}
        </template>
      </el-table-column>
      <el-table-column prop="order.origin" label="Source" width="120">
        <template #default="{ row }">
          {{ row.order?.origin || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="order.paymentMethod" label="Pay" width="120">
        <template #default="{ row }">
          {{ row.order?.paymentMethod || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="order.countryCode" label="Country" width="60">
        <template #default="{ row }">
          {{ row.order?.countryCode || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="order.isBundle" label="Bundle" width="60">
        <template #default="{ row }">
          {{ row.order?.isBundle ? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column prop="order.transactionId" label="Txn ID" min-width="260">
        <template #default="{ row }">
          {{ row.order?.transactionId || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="Status" width="120">
        <template #default="{ row }">
          <el-tag>{{ row.status }}</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <div v-else class="deal-list" v-loading="loading" :aria-busy="loading">
      <article v-for="row in deals" :key="row.id" class="deal-card">
        <header>
          <AppCell :title="productTitle(row)" :subtitle="productSubtitle(row)" :image-url="productImage(row)" :link-url="productLink(row)" />
          <el-tag>{{ row.status }}</el-tag>
        </header>
        <div class="deal-summary"><strong>${{ formatCurrency(row.baseAmount) }}</strong><span>{{ formatRate(row.rate) }} rate</span></div>
        <time :datetime="row.createdAt">{{ formatTimestamp(row.createdAt) }}</time>
        <details>
          <summary>Order details</summary>
          <dl>
            <dt>Customer</dt><dd>{{ row.order?.email ? maskEmail(row.order.email) : '–' }}</dd>
            <dt>Device</dt><dd><DeviceCell :device="deviceForRow(row)" :part-number="row.order?.partNumber || ''" /></dd>
            <dt>Source</dt><dd>{{ row.order?.origin || '–' }}</dd>
            <dt>Pay</dt><dd>{{ row.order?.paymentMethod || '–' }}</dd>
            <dt>Country</dt><dd>{{ row.order?.countryCode || '–' }}</dd>
            <dt>Bundle</dt><dd>{{ row.order?.isBundle ? 'Yes' : 'No' }}</dd>
            <dt>Txn ID</dt><dd class="transaction-id">{{ row.order?.transactionId || '–' }}</dd>
          </dl>
        </details>
      </article>
      <p v-if="!deals.length && !loading && !error" class="empty-message">No deals</p>
    </div>

    <div class="table-footer">
      <el-pagination
        background
        :layout="compact ? 'sizes, prev, slot, next' : 'total, sizes, prev, pager, next, jumper'"
        :total="total"
        :page-size="pageSize"
        :current-page="pageNum"
        :page-sizes="[10, 20, 50]"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      ><span v-if="compact" class="page-count" aria-live="polite">{{ pageNum }} / {{ Math.max(1, Math.ceil(total / pageSize)) }}</span></el-pagination>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import AppCell from '@/components/common/AppCell.vue'
import DeviceCell from '@/components/common/DeviceCell.vue'
import { getMyDealsPage, type PromoterDealsPageQueryDTO, type PromoterDealItemVO } from '@/api/promoter-stats'
import { getGarminDevices } from '@/api/devices'
import type { ApiResponse, PageResponse } from '@/types/api'
import type { GarminDeviceBaseVO } from '@/types/device'

const viewport = window.matchMedia('(max-width: 800px), (max-width: 960px) and (max-height: 500px) and (orientation: landscape)')
const compact = ref(viewport.matches)
const syncViewport = () => { compact.value = viewport.matches }
onMounted(() => viewport.addEventListener('change', syncViewport))
onBeforeUnmount(() => viewport.removeEventListener('change', syncViewport))

const deals = ref<PromoterDealItemVO[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const deviceMap = ref<Record<string, GarminDeviceBaseVO>>({})

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

const maskEmail = (email: string): string => {
  const atIndex = email.indexOf('@')
  if (atIndex <= 0) return email
  const local = email.slice(0, atIndex)
  const domain = email.slice(atIndex)
  if (local.length <= 3) {
    return '*'.repeat(local.length) + domain
  }
  const visible = local.slice(3)
  return '***' + visible + domain
}

const formatCurrency = (amount: number): string => {
  return (amount || 0).toFixed(2)
}

const formatRate = (rate: number): string => {
  if (!rate && rate !== 0) return '-'
  return `${rate}%`
}

const productTitle = (row: PromoterDealItemVO): string => {
  const order = row.order
  if (!order) return '-'
  if (order.isBundle && order.bundle) {
    return order.bundle.bundleName
  }
  if (order.product) {
    return order.product.name
  }
  return '-'
}

const productSubtitle = (row: PromoterDealItemVO): string => {
  const order = row.order
  if (!order) return ''
  if (order.isBundle) {
    return `Bundle · App ID: ${order.appId}`
  }
  return `App ID: ${order.appId}`
}

const productImage = (row: PromoterDealItemVO): string | null => {
  const order = row.order
  if (!order) return null
  if (order.isBundle && order.bundle && Array.isArray(order.bundle.products) && order.bundle.products[0]) {
    return order.bundle.products[0].garminImageUrl || null
  }
  if (order.product) {
    return order.product.garminImageUrl || null
  }
  return null
}

const productLink = (row: PromoterDealItemVO): string | null => {
  const order = row.order
  if (!order) return null
  if (order.isBundle && order.bundle && Array.isArray(order.bundle.products) && order.bundle.products[0]) {
    return order.bundle.products[0].garminStoreUrl || null
  }
  if (order.product) {
    return order.product.garminStoreUrl || null
  }
  return null
}

const deviceForRow = (row: PromoterDealItemVO): GarminDeviceBaseVO | null => {
  const pn = row.order?.partNumber
  if (!pn) return null
  return deviceMap.value[pn] || null
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
      error.value = res.msg || 'Failed to load deals'
    }
  } catch (e) {
    error.value = 'Network error'
  } finally {
    loading.value = false
  }
}

const fetchDevices = async () => {
  try {
    const res = await getGarminDevices()
    if (res.code === 0 && Array.isArray(res.data)) {
      const map: Record<string, GarminDeviceBaseVO> = {}
      res.data.forEach(d => {
        if (d.partNumber) {
          map[d.partNumber] = d
        }
      })
      deviceMap.value = map
    }
  } catch (e) {
    // 设备信息失败不阻塞主表
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

onMounted(() => {
  fetchDeals()
  fetchDevices()
})
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
@media (max-width: 800px), (max-width: 960px) and (max-height: 500px) and (orientation: landscape) {
  .account-page { min-width: 0; padding: 0; background: transparent; }
  .page-title { margin: 0 0 14px; }
  .deal-list { display: grid; gap: 10px; min-height: 64px; }
  .deal-card { min-width: 0; padding: 14px; border: 1px solid var(--el-border-color-light); border-radius: 10px; background: white; }
  .deal-card header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
  .deal-card header :deep(.app-cell), .deal-card :deep(.app-info), .deal-card :deep(.device-info) { min-width: 0; overflow-wrap: anywhere; }
  .deal-card header :deep(img), .deal-card header .el-tag { flex: none; }
  .deal-summary { display: flex; align-items: baseline; flex-wrap: wrap; gap: 10px; margin: 16px 0 4px; }
  .deal-summary strong { font-size: 20px; font-variant-numeric: tabular-nums; }
  .deal-summary span, .deal-card time { color: var(--el-text-color-secondary); font-size: 13px; }
  .deal-card details { margin-top: 12px; border-top: 1px solid var(--el-border-color-lighter); }
  .deal-card summary { padding: 12px 0 4px; min-height: 36px; line-height: 22px; cursor: pointer; font-weight: 600; font-size: 14px; }
  .deal-card dl { display: grid; grid-template-columns: auto minmax(0,1fr); gap: 10px 16px; margin: 10px 0 0; font-size: 14px; }
  .deal-card dt { color: var(--el-text-color-secondary); }
  .deal-card dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
  .transaction-id { font-family: ui-monospace, monospace; }
  .empty-message { color: var(--el-text-color-secondary); text-align: center; }
  .table-footer { margin-top: 20px; }
  .table-footer :deep(.el-pagination) { flex-wrap: wrap; gap: 4px; justify-content: center; }
  .table-footer :deep(.el-select) { width: 100px; }
  .table-footer :deep(.el-pagination__sizes) { margin: 0; }
  .table-footer :deep(button), .table-footer :deep(.el-select__wrapper) { min-height: 40px; }
  .page-count { min-width: 48px; text-align: center; font-size: 13px; }
}
</style>
