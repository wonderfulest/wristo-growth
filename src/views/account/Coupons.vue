<template>
  <div class="account-products-page">
    <div class="products-header">
      <div class="products-header-left">
        <span class="page-title">推广口令</span>
      </div>
      <div class="products-header-actions">
        <el-button type="primary" @click="openCreate" style="margin-right: 12px">新增口令</el-button>
        <el-input
          v-model="searchCode"
          placeholder="按口令码搜索"
          clearable
          style="width: 220px; margin-right: 12px;"
          @keyup.enter="handleSearch"
        />
        <el-select v-model="status" placeholder="状态" clearable style="width: 140px; margin-right: 12px;">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>
    </div>

    <div class="products-section">
      <el-table :data="coupons" border stripe style="width: 100%">
        <el-table-column prop="couponCode" label="口令码" width="140" />
        <el-table-column prop="description" label="描述" min-width="180" />
        <el-table-column prop="discountType" label="折扣类型" width="100" />
        <el-table-column prop="discountValue" label="折扣值" width="100" />
        <el-table-column prop="commissionRate" label="佣金比例" width="110" />
        <el-table-column label="使用情况" width="140">
          <template #default="scope">
            <span>{{ scope.row.usedCount || 0 }} / {{ scope.row.maxUse || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="expireAt" label="过期时间" width="180" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="openDetail(scope.row)">详情</el-button>
            <el-button type="primary" link @click="openEdit(scope.row)">编辑</el-button>
            <el-button
              v-if="scope.row.status === 0"
              type="primary"
              link
              @click="handleEnable(scope.row)"
            >启用</el-button>
            <el-button
              v-else
              type="warning"
              link
              @click="handleDisable(scope.row)"
            >禁用</el-button>
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
      <el-dialog v-model="detailDialogVisible" title="推广口令详情" width="800px">
        <div v-if="detailRow">
          <p>口令码：{{ detailRow.couponCode }}</p>
          <p>描述：{{ detailRow.description || '-' }}</p>
          <p>折扣类型：{{ detailRow.discountType }}</p>
          <p>折扣值：{{ detailRow.discountValue }}</p>
          <p>佣金比例：{{ detailRow.commissionRate }}%</p>
          <p>最大使用次数：{{ detailRow.maxUse ?? '-' }}</p>
          <p>已使用次数：{{ detailRow.usedCount ?? 0 }}</p>
          <p>状态：{{ detailRow.status === 1 ? '启用' : '禁用' }}</p>
          <p>过期时间：{{ detailRow.expireAt || '-' }}</p>
          <p>创建时间：{{ detailRow.createdAt }}</p>
        </div>
      </el-dialog>

      <el-dialog v-model="editDialogVisible" :title="isCreateMode ? '新增推广口令' : '编辑推广口令'" width="800px">
        <el-form label-width="90px">
          <el-form-item label="口令码" required>
            <el-input
              v-model="editForm.couponCode"
              placeholder="输入或生成推广口令"
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
                >随机</el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="editForm.description" type="textarea" rows="2" />
          </el-form-item>
          <el-form-item label="折扣类型">
            <el-select v-model="editForm.discountType" placeholder="折扣类型" disabled style="width: 100%">
              <el-option label="百分比折扣（PERCENT）" value="PERCENT" />
            </el-select>
          </el-form-item>
          <el-form-item label="折扣值">
            <el-input-number v-model="editForm.discountValue" :min="0" :max="100000" :step="0.01" disabled />
            <span style="margin-left: 6px">%</span>
          </el-form-item>
          <el-form-item label="佣金比例">
            <el-input-number v-model="editForm.commissionRate" :min="0" :max="100" :step="0.01" disabled />
            <span style="margin-left: 6px">%</span>
          </el-form-item>
          <el-form-item label="最大次数">
            <el-input-number v-model="editForm.maxUse" :min="0" :max="1000000" />
          </el-form-item>
          <el-form-item label="过期时间">
            <el-date-picker
              v-model="editForm.expireAt"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择过期时间"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="(editForm as any).status" placeholder="请选择状态" style="width: 100%">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitEdit">保存</el-button>
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
      ElMessage.error(res.msg || '获取推广口令失败')
    }
  } catch (e) {
    ElMessage.error('获取推广口令失败')
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
      ElMessage.success('创建成功')
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
      ElMessage.success('保存成功')
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
    maxUse: null,
    status: 1,
    expireAt: null
  }
  editDialogVisible.value = true
}

const handleGenerateCode = async () => {
  const len = generateLength.value || 8
  if (len < 4 || len > 16) {
    ElMessage.warning('口令长度需在 4 到 16 位之间')
    return
  }
  const finalLen = len
  try {
    generateLoading.value = true
    const res = await generatePromoterCouponCode(finalLen)
    if (res.code === 0 && typeof res.data === 'string') {
      editForm.value.couponCode = res.data
    } else {
      ElMessage.error(res.msg || '生成推广口令失败')
    }
  } catch (e) {
    ElMessage.error('生成推广口令失败')
  } finally {
    generateLoading.value = false
  }
}

const handleEnable = async (row: PromoterCoupon) => {
  try {
    await enablePromoterCoupon(row.id)
    ElMessage.success('已启用')
    loadCoupons()
  } catch (e) {
    // 错误提示由 axios 拦截器统一处理
  }
}

const handleDisable = async (row: PromoterCoupon) => {
  try {
    await disablePromoterCoupon(row.id)
    ElMessage.success('已禁用')
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