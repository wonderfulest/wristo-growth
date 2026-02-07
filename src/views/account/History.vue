<template>
  <div class="account-page">
    <h2 class="page-title">Promoter deals</h2>

    <div v-if="error" class="error-message">
      Failed to load deals: {{ error }}
    </div>

    <el-table
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
import AppCell from '@/components/common/AppCell.vue'
import DeviceCell from '@/components/common/DeviceCell.vue'
import { getMyDealsPage, type PromoterDealsPageQueryDTO, type PromoterDealItemVO } from '@/api/promoter-stats'
import { getGarminDevices } from '@/api/devices'
import type { ApiResponse, PageResponse } from '@/types/api'
import type { GarminDeviceBaseVO } from '@/types/device'

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