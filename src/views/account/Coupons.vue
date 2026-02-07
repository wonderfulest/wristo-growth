<template>
  <div class="account-products-page">
    <div class="products-header">
      <div class="products-header-left">
        <span class="page-title">Promo Codes</span>
      </div>
      <div class="products-header-actions">
        <el-button type="primary" @click="openCreate" style="margin-right: 12px">New code</el-button>
        <el-input
          v-model="searchCode"
          placeholder="Search by code"
          clearable
          style="width: 220px; margin-right: 12px;"
          @keyup.enter="handleSearch"
        />
        <el-select v-model="status" placeholder="Status" clearable style="width: 140px; margin-right: 12px;">
          <el-option label="Enabled" :value="1" />
          <el-option label="Disabled" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleSearch">Search</el-button>
      </div>
    </div>

    <div class="products-section">
      <el-table :data="coupons" border stripe style="width: 100%">
        <el-table-column prop="couponCode" label="Code" width="140" />
        <el-table-column prop="description" label="Description" min-width="180" />
        <el-table-column prop="discountType" label="Type" width="100" />
        <el-table-column prop="discountValue" label="Discount" width="100" />
        <el-table-column prop="commissionRate" label="Commission" width="110" />
        <el-table-column label="Usage" width="140">
          <template #default="scope">
            <span>{{ scope.row.usedCount || 0 }} / {{ scope.row.maxUse || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? 'Enabled' : 'Disabled' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="expireAt" label="Expire at" width="180" />
        <el-table-column prop="createdAt" label="Created at" width="180" />
        <el-table-column label="Actions" width="220" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="openDetail(scope.row)">View</el-button>
            <el-button type="primary" link @click="openEdit(scope.row)">Edit</el-button>
            <el-button
              v-if="scope.row.status === 0"
              type="primary"
              link
              @click="handleEnable(scope.row)"
            >Enable</el-button>
            <el-button
              v-else
              type="warning"
              link
              @click="handleDisable(scope.row)"
            >Disable</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-bar">
        <el-pagination
          background
          layout="sizes, prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="pageNum"
          :page-sizes="pageSizes"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
      <el-dialog v-model="detailDialogVisible" title="Promo code details" width="800px">
        <div v-if="detailRow">
          <p>Code: {{ detailRow.couponCode }}</p>
          <p>Description: {{ detailRow.description || '-' }}</p>
          <p>Type: {{ detailRow.discountType }}</p>
          <p>Discount: {{ detailRow.discountValue }}</p>
          <p>Commission: {{ detailRow.commissionRate }}%</p>
          <p>Max uses: {{ detailRow.maxUse ?? '-' }}</p>
          <p>Used: {{ detailRow.usedCount ?? 0 }}</p>
          <p>Status: {{ detailRow.status === 1 ? 'Enabled' : 'Disabled' }}</p>
          <p>Expire at: {{ detailRow.expireAt || '-' }}</p>
          <p>Created at: {{ detailRow.createdAt }}</p>
        </div>
      </el-dialog>

      <el-dialog v-model="editDialogVisible" :title="isCreateMode ? 'New promo code' : 'Edit promo code'" width="800px">
        <el-form label-width="90px">
          <el-form-item label="Code" required>
            <el-input
              v-model="editForm.couponCode"
              placeholder="Enter or generate code"
              :disabled="!isCreateMode"
            >
              <template #append>
                <el-input-number
                  v-model="generateLength"
                  :min="4"
                  :max="16"
                  :step="1"
                  size="small"
                  controls-position="right"
                  style="width: 90px; margin-right: 4px"
                  :disabled="!isCreateMode"
                />
                <el-button
                  type="primary"
                  size="small"
                  :loading="generateLoading"
                  :disabled="!isCreateMode"
                  @click.stop="handleGenerateCode"
                >Random</el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="Description">
            <el-input v-model="editForm.description" type="textarea" rows="2" />
          </el-form-item>
          <el-form-item label="Type">
            <el-select v-model="editForm.discountType" placeholder="Discount type" disabled style="width: 100%">
              <el-option label="Percent (PERCENT)" value="PERCENT" />
            </el-select>
          </el-form-item>
          <el-form-item label="Discount">
            <el-input-number v-model="editForm.discountValue" :min="0" :max="100000" :step="0.01" disabled />
            <span style="margin-left: 6px">%</span>
          </el-form-item>
          <el-form-item label="Commission">
            <el-input-number v-model="editForm.commissionRate" :min="0" :max="100" :step="0.01" disabled />
            <span style="margin-left: 6px">%</span>
          </el-form-item>
          <el-form-item label="Max uses">
            <el-input-number v-model="editForm.maxUse" :min="100" :max="1000000" />
          </el-form-item>
          <el-form-item label="Expire at">
            <el-date-picker
              v-model="editForm.expireAt"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="Select expire time"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="Status">
            <el-select v-model="(editForm as any).status" placeholder="Select status" style="width: 100%">
              <el-option label="Enabled" :value="1" />
              <el-option label="Disabled" :value="0" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="editDialogVisible = false">Cancel</el-button>
            <el-button type="primary" @click="submitEdit">Save</el-button>
          </span>
        </template>
      </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchPromoterCouponPage, enablePromoterCoupon, disablePromoterCoupon, updatePromoterCoupon, createPromoterCoupon, generatePromoterCouponCode, type PromoterCouponPageQuery, type PromoterCouponCreateDTO, type PromoterCouponUpdateDTO } from '@/api/promoter-coupons'
import type { PromoterCoupon, ApiResponse, PageResponse } from '@/types/api'

const coupons = ref<PromoterCoupon[]>([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const pageSizes = [10, 20, 50]

const searchCode = ref('')
const status = ref<number | null>(null)

const detailDialogVisible = ref(false)
const detailRow = ref<PromoterCoupon | null>(null)

const editDialogVisible = ref(false)
const isCreateMode = ref(false)
const editForm = ref<Partial<PromoterCouponCreateDTO & { id?: number }>>({})
const generateLength = ref(8)
const generateLoading = ref(false)

const loadCoupons = async () => {
  const query: PromoterCouponPageQuery = {
    couponCodeLike: searchCode.value || undefined,
    status: status.value,
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    orderBy: 'created_at:desc'
  }

  try {
    const res: ApiResponse<PageResponse<PromoterCoupon>> = await fetchPromoterCouponPage(query)
    if (res.code === 0 && res.data) {
      coupons.value = res.data.list
      total.value = res.data.total
    } else {
      ElMessage.error(res.msg || 'Failed to load promo codes')
    }
  } catch (e) {
    ElMessage.error('Failed to load promo codes')
  }
}

const submitEdit = async () => {
  try {
    if (isCreateMode.value) {
      const payload: PromoterCouponCreateDTO = {
        couponCode: editForm.value.couponCode || '',
        description: editForm.value.description || '',
        discountType: 'PERCENT',
        discountValue: 10,
        commissionRate: 30,
        campaignId: (editForm.value as any).campaignId ?? null,
        maxUse: (editForm.value as any).maxUse ?? null,
        status: (editForm.value as any).status ?? 1,
        expireAt: (editForm.value as any).expireAt ?? null
      }
      await createPromoterCoupon(payload)
      ElMessage.success('Created')
    } else {
      if (!editForm.value.id) return
      const dto: PromoterCouponUpdateDTO = {
        id: editForm.value.id,
        description: editForm.value.description || undefined,
        maxUse: (editForm.value as any).maxUse ?? undefined,
        status: typeof (editForm.value as any).status === 'number' ? (editForm.value as any).status : undefined,
        expireAt: (editForm.value as any).expireAt || undefined
      }
      await updatePromoterCoupon(dto)
      ElMessage.success('Saved')
    }
    editDialogVisible.value = false
    loadCoupons()
  } catch (e) {
    // 错误提示由 axios 拦截器统一处理
  }
}

const handleSearch = () => {
  pageNum.value = 1
  loadCoupons()
}

const handlePageChange = (val: number) => {
  pageNum.value = val
  loadCoupons()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  pageNum.value = 1
  loadCoupons()
}

const openDetail = (row: PromoterCoupon) => {
  detailRow.value = row
  detailDialogVisible.value = true
}

const openEdit = (row: PromoterCoupon) => {
  isCreateMode.value = false
  editForm.value = { ...(row as any) }
  editDialogVisible.value = true
}

const openCreate = () => {
  isCreateMode.value = true
  editForm.value = {
    couponCode: '',
    description: '',
    discountType: 'PERCENT',
    discountValue: 10,
    commissionRate: 30,
    maxUse: 10000,
    status: 1,
    expireAt: null
  }
  editDialogVisible.value = true
}

const handleGenerateCode = async () => {
  const len = generateLength.value || 8
  if (len < 4 || len > 16) {
    ElMessage.warning('Code length must be 4-16')
    return
  }
  const finalLen = len
  try {
    generateLoading.value = true
    const res = await generatePromoterCouponCode(finalLen)
    if (res.code === 0 && typeof res.data === 'string') {
      editForm.value.couponCode = res.data
    } else {
      ElMessage.error(res.msg || 'Failed to generate code')
    }
  } catch (e) {
    ElMessage.error('Failed to generate code')
  } finally {
    generateLoading.value = false
  }
}

const handleEnable = async (row: PromoterCoupon) => {
  try {
    await enablePromoterCoupon(row.id)
    ElMessage.success('Enabled')
    loadCoupons()
  } catch (e) {
    // 错误提示由 axios 拦截器统一处理
  }
}

const handleDisable = async (row: PromoterCoupon) => {
  try {
    await disablePromoterCoupon(row.id)
    ElMessage.success('Disabled')
    loadCoupons()
  } catch (e) {
    // 错误提示由 axios 拦截器统一处理
  }
}

onMounted(() => {
  loadCoupons()
})
</script>

<style scoped>
.account-products-page {
  background: #f5f6f7;
}
:deep(.el-card__body) {
  padding: 12px 20px !important;
}
.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
}
.page-title {
  font-size: 20px;
  font-weight: 600;
}
.products-header-actions {
  display: flex;
  gap: 24px;
}
.products-section {
  width: 90%;
  margin: 0 auto 32px auto;
}
.pagination-bar {
  margin: 24px 0 0 0;
  display: flex;
  justify-content: center;
}
</style>