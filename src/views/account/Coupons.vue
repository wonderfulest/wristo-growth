<template>
  <div class="account-products-page">
    <div class="products-header">
      <div class="products-header-left">
        <h1 class="page-title">{{ t('推广优惠码', 'Promo Codes') }}</h1>
      </div>
      <form class="products-header-actions" role="search" @submit.prevent="handleSearch">
        <el-button type="primary" @click="openCreate" class="new-code">{{ t('新建优惠码', 'New code') }}</el-button>
        <el-input
          v-model="searchCode"
          :placeholder="t('按优惠码搜索', 'Search by code')"
          clearable
          class="code-filter" :aria-label="t('搜索推广优惠码', 'Search by promo code')"
        />
        <el-select v-model="status" :placeholder="t('状态', 'Status')" clearable class="status-filter" :aria-label="t('按状态筛选优惠码', 'Filter codes by status')">
          <el-option :label="t('已启用', 'Enabled')" :value="1" />
          <el-option :label="t('已停用', 'Disabled')" :value="0" />
        </el-select>
        <el-button type="primary" native-type="submit">{{ t('搜索', 'Search') }}</el-button>
      </form>
    </div>

    <div class="products-section">
      <el-table v-if="!compact" v-loading="loading" :data="coupons" border stripe style="width: 100%">
        <el-table-column prop="couponCode" :label="t('优惠码', 'Code')" width="140" />
        <el-table-column prop="description" :label="t('说明', 'Description')" min-width="180" />
        <el-table-column prop="discountType" :label="t('类型', 'Type')" width="100" />
        <el-table-column prop="discountValue" :label="t('折扣', 'Discount')" width="100" />
        <el-table-column prop="commissionRate" :label="t('佣金', 'Commission')" width="110" />
        <el-table-column :label="t('使用次数', 'Usage')" width="140">
          <template #default="scope">
            <span>{{ scope.row.usedCount || 0 }} / {{ scope.row.maxUse || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="t('状态', 'Status')" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? t('已启用', 'Enabled') : t('已停用', 'Disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="expireAt" :label="t('到期时间', 'Expire at')" width="180" />
        <el-table-column prop="createdAt" :label="t('创建时间', 'Created at')" width="180" />
        <el-table-column :label="t('操作', 'Actions')" width="220" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="openDetail(scope.row)">{{ t('查看', 'View') }}</el-button>
            <el-button type="primary" link @click="openEdit(scope.row)">{{ t('编辑', 'Edit') }}</el-button>
            <el-button
              v-if="scope.row.status === 0"
              type="primary"
              link
              @click="handleEnable(scope.row)"
            >{{ t('启用', 'Enable') }}</el-button>
            <el-button
              v-else
              type="warning"
              link
              @click="handleDisable(scope.row)"
            >{{ t('停用', 'Disable') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-else class="coupon-list" v-loading="loading" :aria-busy="loading">
        <article v-for="row in coupons" :key="row.id" class="coupon-card">
          <header><h2>{{ row.couponCode }}</h2>
            <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? t('已启用', 'Enabled') : t('已停用', 'Disabled') }}</el-tag>
          </header>
          <p v-if="row.description" class="description">{{ row.description }}</p>
          <dl>
            <div><dt>{{ t('折扣', 'Discount') }}</dt><dd>{{ row.discountValue }}{{ row.discountType === 'PERCENT' ? '%' : '' }}</dd></div>
            <div><dt>{{ t('佣金', 'Commission') }}</dt><dd>{{ row.commissionRate }}%</dd></div>
            <div><dt>{{ t('使用次数', 'Usage') }}</dt><dd>{{ row.usedCount ?? 0 }} / {{ row.maxUse ?? '–' }}</dd></div>
          </dl>
          <footer>
            <el-button :aria-label="`${t('查看', 'View')} ${row.couponCode}`" @click="openDetail(row)">{{ t('查看', 'View') }}</el-button>
            <el-button :aria-label="`${t('编辑', 'Edit')} ${row.couponCode}`" @click="openEdit(row)">{{ t('编辑', 'Edit') }}</el-button>
            <el-button :type="row.status === 1 ? 'warning' : 'primary'" plain
              :aria-label="`${row.status === 1 ? t('停用', 'Disable') : t('启用', 'Enable')} ${row.couponCode}`"
              @click="row.status === 1 ? handleDisable(row) : handleEnable(row)">
              {{ row.status === 1 ? t('停用', 'Disable') : t('启用', 'Enable') }}
            </el-button>
          </footer>
        </article>
        <p v-if="!coupons.length && !loading" class="empty-message">{{ t('暂无优惠码', 'No promo codes') }}</p>
      </div>

      <div class="pagination-bar">
        <el-pagination
          background
          :layout="compact ? 'sizes, prev, slot, next' : 'sizes, prev, pager, next'"
          :total="total"
          :page-size="pageSize"
          :current-page="pageNum"
          :page-sizes="pageSizes"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        ><span v-if="compact" class="page-count" aria-live="polite">{{ pageNum }} / {{ Math.max(1, Math.ceil(total / pageSize)) }}</span></el-pagination>
      </div>
    </div>
      <el-dialog v-model="detailDialogVisible" :title="t('优惠码详情', 'Promo code details')" :width="compact ? 'calc(100% - 24px)' : '800px'" class="coupon-dialog" align-center>
        <div v-if="detailRow" class="coupon-details">
          <p>{{ t('优惠码：', 'Code:') }} {{ detailRow.couponCode }}</p>
          <p>{{ t('说明：', 'Description:') }} {{ detailRow.description || '-' }}</p>
          <p>{{ t('类型：', 'Type:') }} {{ detailRow.discountType }}</p>
          <p>{{ t('折扣：', 'Discount:') }} {{ detailRow.discountValue }}</p>
          <p>{{ t('佣金：', 'Commission:') }} {{ detailRow.commissionRate }}%</p>
          <p>{{ t('使用上限：', 'Max uses:') }} {{ detailRow.maxUse ?? '-' }}</p>
          <p>{{ t('已使用：', 'Used:') }} {{ detailRow.usedCount ?? 0 }}</p>
          <p>{{ t('状态：', 'Status:') }} {{ detailRow.status === 1 ? t('已启用', 'Enabled') : t('已停用', 'Disabled') }}</p>
          <p>{{ t('到期时间：', 'Expire at:') }} {{ detailRow.expireAt || '-' }}</p>
          <p>{{ t('创建时间：', 'Created at:') }} {{ detailRow.createdAt }}</p>
        </div>
      </el-dialog>

      <el-dialog v-model="editDialogVisible" :title="isCreateMode ? t('新建优惠码', 'New promo code') : t('编辑优惠码', 'Edit promo code')" :width="compact ? 'calc(100% - 24px)' : '800px'" class="coupon-dialog" align-center>
        <el-form label-width="90px" :label-position="compact ? 'top' : 'right'" @submit.prevent="submitEdit">
          <el-form-item :label="t('优惠码', 'Code')" required>
            <el-input v-model="editForm.couponCode" :aria-label="t('推广优惠码', 'Promo code')" :placeholder="t('输入或生成优惠码', 'Enter or generate code')" :disabled="!isCreateMode" />
            <div v-if="isCreateMode" class="code-generator">
              <label for="coupon-length">{{ t('优惠码长度', 'Code length') }}</label>
              <el-input-number id="coupon-length" v-model="generateLength" :min="4" :max="16" :step="1" controls-position="right" />
              <el-button :loading="generateLoading" @click="handleGenerateCode">{{ t('随机生成', 'Random') }}</el-button>
            </div>
          </el-form-item>
          <el-form-item :label="t('说明', 'Description')">
            <el-input v-model="editForm.description" type="textarea" rows="2" />
          </el-form-item>
          <el-form-item :label="t('类型', 'Type')">
            <el-select v-model="editForm.discountType" :placeholder="t('折扣类型', 'Discount type')" disabled style="width: 100%">
              <el-option :label="t('百分比', 'Percent (PERCENT)')" value="PERCENT" />
            </el-select>
          </el-form-item>
          <el-form-item :label="t('折扣', 'Discount')">
            <el-input-number v-model="editForm.discountValue" :min="0" :max="100000" :step="0.01" disabled />
            <span style="margin-left: 6px">%</span>
          </el-form-item>
          <el-form-item :label="t('佣金', 'Commission')">
            <el-input-number v-model="editForm.commissionRate" :min="0" :max="100" :step="0.01" disabled />
            <span style="margin-left: 6px">%</span>
          </el-form-item>
          <el-form-item :label="t('使用上限', 'Max uses')">
            <el-input-number v-model="editForm.maxUse" :min="100" :max="1000000" />
          </el-form-item>
          <el-form-item :label="t('到期时间', 'Expire at')">
            <input v-if="compact" v-model="mobileExpiry" type="datetime-local" step="1" class="mobile-date" :aria-label="t('到期时间', 'Expire at')" />
            <el-date-picker v-else
              v-model="editForm.expireAt"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              :placeholder="t('选择到期时间', 'Select expire time')"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item :label="t('状态', 'Status')">
            <el-select v-model="(editForm as any).status" :placeholder="t('选择状态', 'Select status')" style="width: 100%">
              <el-option :label="t('已启用', 'Enabled')" :value="1" />
              <el-option :label="t('已停用', 'Disabled')" :value="0" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="editDialogVisible = false">{{ t('取消', 'Cancel') }}</el-button>
            <el-button type="primary" @click="submitEdit">{{ t('保存', 'Save') }}</el-button>
          </span>
        </template>
      </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { t } from '@/i18n'
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchPromoterCouponPage, enablePromoterCoupon, disablePromoterCoupon, updatePromoterCoupon, createPromoterCoupon, generatePromoterCouponCode, type PromoterCouponPageQuery, type PromoterCouponCreateDTO, type PromoterCouponUpdateDTO } from '@/api/promoter-coupons'
import type { PromoterCoupon, ApiResponse, PageResponse } from '@/types/api'

const viewport = window.matchMedia('(max-width: 800px), (max-width: 960px) and (max-height: 500px) and (orientation: landscape)')
const compact = ref(viewport.matches)
const syncViewport = () => { compact.value = viewport.matches }
onMounted(() => viewport.addEventListener('change', syncViewport))
onBeforeUnmount(() => viewport.removeEventListener('change', syncViewport))

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
const mobileExpiry = computed({
  get: () => editForm.value.expireAt?.replace(' ', 'T') ?? '',
  set: (value: string) => {
    const date = value.replace('T', ' ')
    editForm.value.expireAt = date ? (date.length === 16 ? date + ':00' : date) : null
  }
})
const loading = ref(false)
let queryVersion = 0
const generateLength = ref(8)
const generateLoading = ref(false)

const loadCoupons = async () => {
  const version = ++queryVersion
  loading.value = true
  const query: PromoterCouponPageQuery = {
    couponCodeLike: searchCode.value || undefined,
    status: status.value,
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    orderBy: 'created_at:desc'
  }

  try {
    const res: ApiResponse<PageResponse<PromoterCoupon>> = await fetchPromoterCouponPage(query)
    if (version !== queryVersion) return
    if (res.code === 0 && res.data) {
      coupons.value = res.data.list
      total.value = res.data.total
    } else {
      ElMessage.error(res.msg || t('加载优惠码失败', 'Failed to load promo codes'))
    }
  } catch (e) {
    if (version === queryVersion) ElMessage.error(t('加载优惠码失败', 'Failed to load promo codes'))
  } finally {
    if (version === queryVersion) loading.value = false
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
      ElMessage.success(t('已创建', 'Created'))
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
      ElMessage.success(t('已保存', 'Saved'))
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
    ElMessage.warning(t('优惠码长度须为 4 至 16 位', 'Code length must be 4-16'))
    return
  }
  const finalLen = len
  try {
    generateLoading.value = true
    const res = await generatePromoterCouponCode(finalLen)
    if (res.code === 0 && typeof res.data === 'string') {
      editForm.value.couponCode = res.data
    } else {
      ElMessage.error(res.msg || t('生成优惠码失败', 'Failed to generate code'))
    }
  } catch (e) {
    ElMessage.error(t('生成优惠码失败', 'Failed to generate code'))
  } finally {
    generateLoading.value = false
  }
}

const handleEnable = async (row: PromoterCoupon) => {
  try {
    await enablePromoterCoupon(row.id)
    ElMessage.success(t('已启用', 'Enabled'))
    loadCoupons()
  } catch (e) {
    // 错误提示由 axios 拦截器统一处理
  }
}

const handleDisable = async (row: PromoterCoupon) => {
  try {
    await disablePromoterCoupon(row.id)
    ElMessage.success(t('已停用', 'Disabled'))
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

.products-header { flex-wrap: wrap; gap: 16px; }
.page-title { margin: 0; }
.products-header-actions { align-items: center; flex-wrap: wrap; gap: 12px; }
.code-filter { width: 220px; }
.status-filter { width: 140px; }
.coupon-details { overflow-wrap: anywhere; }
.code-generator { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.code-generator .el-input-number { width: 92px; }
@media (max-width: 800px), (max-width: 960px) and (max-height: 500px) and (orientation: landscape) {
  .account-products-page { min-width: 0; padding: 0; background: transparent; }
  .products-header, .products-section { width: 100%; min-width: 0; }
  .products-header { display: block; margin-bottom: 16px; }
  .products-header-actions { display: grid; grid-template-columns: minmax(0, 1fr) auto; width: 100%; margin-top: 12px; }
  .new-code { grid-column: 2; grid-row: 1; }
  .code-filter { grid-column: 1; grid-row: 1; }
  .code-filter, .status-filter { width: 100%; min-width: 0; }
  .products-header-actions :deep(.el-button), .coupon-card footer :deep(.el-button) { min-height: 42px; margin: 0; }
  .products-header-actions :deep(.el-input__wrapper), .products-header-actions :deep(.el-select__wrapper) { min-height: 42px; box-sizing: border-box; }
  .coupon-list { display: grid; gap: 10px; min-height: 64px; }
  .coupon-card { min-width: 0; padding: 14px; border: 1px solid var(--el-border-color-light); border-radius: 10px; background: white; }
  .coupon-card header, .coupon-card footer { display: flex; gap: 8px; }
  .coupon-card header { align-items: flex-start; justify-content: space-between; }
  .coupon-card h2 { margin: 0; min-width: 0; font-size: 16px; overflow-wrap: anywhere; }
  .coupon-card header .el-tag { flex: none; }
  .description { margin: 8px 0; color: var(--el-text-color-regular); font-size: 14px; overflow-wrap: anywhere; }
  .coupon-card dl { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 8px; margin: 14px 0; }
  .coupon-card dt { color: var(--el-text-color-secondary); font-size: 12px; }
  .coupon-card dd { margin: 4px 0 0; font-size: 14px; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
  .coupon-card footer { border-top: 1px solid var(--el-border-color-lighter); padding-top: 12px; flex-wrap: wrap; }
  .empty-message { text-align: center; color: var(--el-text-color-secondary); }
  .pagination-bar :deep(.el-pagination) { flex-wrap: wrap; justify-content: center; gap: 4px; }
  .pagination-bar :deep(.el-pagination__sizes) { margin: 0; }
  .pagination-bar :deep(.el-select) { width: 100px; }
  .pagination-bar :deep(button), .pagination-bar :deep(.el-select__wrapper) { min-height: 40px; }
  .page-count { font-size: 13px; min-width: 48px; text-align: center; }
  :global(.el-dialog.coupon-dialog) { max-height: calc(100dvh - 24px); display: flex; flex-direction: column; overflow: hidden; }
  :global(.coupon-dialog .el-dialog__body) { min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
  :global(.coupon-dialog .el-dialog__footer .el-button) { min-height: 42px; }
  .mobile-date { width: 100%; max-width: 100%; min-width: 0; box-sizing: border-box; height: 40px; background: white; padding: 0 10px; color: inherit; font: inherit; border: 1px solid var(--el-border-color); border-radius: 4px; }
}
</style>