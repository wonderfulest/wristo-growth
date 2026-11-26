<template>
  <section class="downlines">
    <header v-if="compact && selected" class="customer-heading">
      <button type="button" class="back" aria-label="返回顾客名单" @click="returnToBuyers"><ArrowLeft /></button>
      <h1 ref="mobileHeading" tabindex="-1">{{ selected.name || '顾客' }}的订单</h1>
      <p>仅展示绑定后的现金支付</p>
    </header>
    <template v-else>
      <h1>我的下线</h1>
      <div v-if="compact" class="segments" role="group" aria-label="下线视图">
        <button type="button" :aria-pressed="segment === 'customers'" @click="segment = 'customers'">顾客名单</button>
        <button type="button" :aria-pressed="segment === 'orders'" @click="segment = 'orders'">现金订单</button>
      </div>
    </template>
    <section v-if="!compact || (!selected && segment === 'customers')" aria-label="顾客名单">
    <el-table v-if="!compact" class="wide-table" :data="buyers?.items ?? []" v-loading="loadingBuyers" empty-text="暂无绑定顾客">
      <el-table-column label="顾客" min-width="160">
        <template #default="{ row }">{{ row.name || '顾客' }} · {{ row.userId }}</template>
      </el-table-column>
      <el-table-column label="绑定时间" min-width="170"><template #default="{ row }">{{ displayTime(row.boundAt) }}</template></el-table-column>
      <el-table-column label="订单" width="110">
        <template #default="{ row }"><el-button link type="primary" @click="filterOrders(row)">查看订单</el-button></template>
      </el-table-column>
    </el-table>
    <div v-else class="customer-list" :aria-busy="loadingBuyers">
      <p v-if="loadingBuyers" role="status">正在加载顾客…</p>
      <p v-else-if="buyers && !buyers.items.length">暂无绑定顾客</p>
      <ul v-else>
        <li v-for="buyer in buyers?.items" :key="buyer.userId">
          <button type="button" class="customer-row" :id="'customer-' + buyer.userId"
            :aria-label="'查看' + (buyer.name || '顾客') + '的订单'" @click="openCustomer(buyer)">
            <span class="initial" aria-hidden="true">{{ initial(buyer.name) }}</span>
            <span class="buyer-info"><strong>{{ buyer.name || '顾客' }}</strong>
              <span>绑定时间：<time :datetime="buyer.boundAt">{{ dateOnly(buyer.boundAt) }}</time></span>
            </span>
            <ArrowRight aria-hidden="true" />
          </button>
        </li>
      </ul>
    </div>
    <el-button v-if="!buyers && !loadingBuyers" @click="loadBuyers(buyerPage)">重新加载顾客</el-button>
    <div v-if="buyers && (buyerPage > 1 || buyers.hasMore)" class="pagination" role="navigation" aria-label="顾客分页">
      <el-button :disabled="loadingBuyers || buyerPage === 1" @click="loadBuyers(buyerPage - 1)">上一页</el-button>
      <span aria-live="polite">第 {{ buyerPage }} 页</span>
      <el-button :disabled="loadingBuyers || !buyers.hasMore" @click="loadBuyers(buyerPage + 1)">下一页</el-button>
    </div>

    </section>
    <section v-if="!compact || selected || segment === 'orders'" aria-label="现金订单">
    <template v-if="!compact">
      <h2>现金订单</h2>
      <p>包含顾客绑定后产生的现金订单，含零佣金订单。</p>
      <div class="filter">
        <span>{{ selected ? (selected.name || '顾客') + ' · ' + selected.userId : '全部推广顾客' }}</span>
        <el-button v-if="selected" link type="primary" @click="route.query.customer ? returnToBuyers() : filterOrders(undefined)">查看全部订单</el-button>
      </div>
    </template>
    <el-table v-if="!compact" class="wide-table" :data="orders?.items ?? []" v-loading="loadingOrders" empty-text="暂无现金订单">
      <el-table-column label="推广顾客" min-width="110"><template #default="{ row }">#{{ row.userId }}</template></el-table-column>
      <el-table-column prop="name" label="商品" min-width="140" />
      <el-table-column prop="orderNo" label="订单号" min-width="190" />
      <el-table-column label="实付金额" min-width="120"><template #default="{ row }">{{ row.amount }} {{ row.currency }}</template></el-table-column>
      <el-table-column label="支付方式" min-width="110"><template #default="{ row }">{{ methods[row.paymentMethod] || row.paymentMethod }}</template></el-table-column>
      <el-table-column label="订单状态" min-width="110"><template #default="{ row }">{{ statuses[row.status] || row.status }}</template></el-table-column>
      <el-table-column label="支付时间" min-width="170"><template #default="{ row }">{{ displayTime(row.paidAt) }}</template></el-table-column>
    </el-table>
    <div v-else class="order-list" :aria-busy="loadingOrders">
      <p v-if="loadingOrders" role="status">正在加载订单…</p>
      <p v-else-if="orders && !orders.items.length">暂无现金订单</p>
      <article v-else v-for="order in orders?.items" :key="order.paymentMethod + '/' + order.orderNo" class="order-card">
        <header><h3>{{ order.name || '商品' }}</h3>
          <span class="order-status" :class="{ paid: order.status === 'PAID' }">{{ statuses[order.status] || order.status }}</span>
        </header>
        <strong class="paid-amount">{{ money(order) }}</strong>
        <div class="payment-method"><Wallet aria-hidden="true" />{{ methods[order.paymentMethod] || order.paymentMethod }}</div>
        <div class="order-footer">
          <span>支付时间：<time :datetime="order.paidAt">{{ compactTime(order.paidAt) }}</time></span>
          <button type="button" :aria-expanded="expanded === order" @click="expanded = expanded === order ? undefined : order">
            {{ expanded === order ? '收起详情' : '订单详情' }}<ArrowRight aria-hidden="true" :class="{ turned: expanded === order }" />
          </button>
        </div>
        <dl v-if="expanded === order" class="order-details">
          <dt>订单号</dt><dd>{{ order.orderNo }}</dd>
          <dt>顾客编号</dt><dd>#{{ order.userId }}</dd>
          <dt>支付币种</dt><dd>{{ order.currency }}</dd>
          <dt>支付时间</dt><dd>{{ displayTime(order.paidAt) }}</dd>
        </dl>
      </article>
    </div>
    <el-button v-if="!orders && !loadingOrders" @click="loadOrders(orderPage)">重新加载订单</el-button>
    <div v-if="orders && (orderPage > 1 || orders.hasMore)" class="pagination" role="navigation" aria-label="订单分页">
      <el-button :disabled="loadingOrders || orderPage === 1" @click="loadOrders(orderPage - 1)">上一页</el-button>
      <span aria-live="polite">第 {{ orderPage }} 页</span>
      <el-button :disabled="loadingOrders || !orders.hasMore || !orders.nextCursor" @click="loadOrders(orderPage + 1)">下一页</el-button>
    </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Wallet } from '@element-plus/icons-vue'
import { fetchCashOrders, fetchDownlines, type CashOrder, type Downline, type PromotionPage } from '@/api/offline-promotion'

const buyers = ref<PromotionPage<Downline>>()
const orders = ref<PromotionPage<CashOrder> & { nextCursor?: string | null }>()
const statuses: Record<string, string> = { PAID: '已支付', REFUNDED: '已退款', PARTIALLY_REFUNDED: '部分退款', REFUND_PENDING: '退款处理中', REFUND_RECORDED: '有退款记录' }
const methods: Record<string, string> = { wechat: '微信支付', wechat_pay: '微信支付', wechat_virtual: '微信虚拟支付', alipay: '支付宝', paddle: 'Paddle', apple: 'App Store', paypal: 'PayPal', card: '银行卡', apple_pay: 'Apple Pay', google_pay: 'Google Pay', google_play: 'Google Play' }
const formatter = new Intl.DateTimeFormat('zh-CN', {dateStyle:'short', timeStyle:'medium'})
function displayTime(value: string) {
  const date = new Date(value)
  return value && Number.isFinite(date.getTime()) ? formatter.format(date) : value || '—'
}
const route = useRoute()
const router = useRouter()
const viewport = window.matchMedia('(max-width: 768px), (max-width: 960px) and (max-height: 500px) and (orientation: landscape)')
const compact = ref(viewport.matches)
const syncViewport = () => { compact.value = viewport.matches }
const segment = ref<'customers' | 'orders'>('customers')
const mobileHeading = ref<HTMLElement>()
const expanded = ref<CashOrder>()
let enteredFromList = false
const knownBuyers = new Map<number, Downline>()
function initial(name: string) {
  const text = name?.trim().replace(/^(?:小|阿)(?=.)/u, '')
  return Array.from(text || '客')[0]
}
function dateOnly(value: string) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return '—'
  return [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-')
}
function compactTime(value: string) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return '—'
  return dateOnly(value) + ' ' + String(date.getHours()).padStart(2,'0') + ':' + String(date.getMinutes()).padStart(2,'0')
}
function money(order: CashOrder) {
  // Keep the exact amount and currency supplied by the payment provider.
  return order.currency === 'CNY' ? '¥' + order.amount : order.amount + ' ' + order.currency
}
let cursors: (string | undefined)[] = [undefined]
const selected = ref<Downline>()

const buyerPage = ref(1)
const orderPage = ref(1)
const loadingBuyers = ref(true)
const loadingOrders = ref(true)
let orderRequest = 0

async function loadBuyers(page: number) {
  loadingBuyers.value = true
  try {
    buyers.value = (await fetchDownlines(page)).data
    for (const buyer of buyers.value?.items ?? []) knownBuyers.set(buyer.userId, buyer)
    if (selected.value) selected.value = knownBuyers.get(selected.value.userId) ?? selected.value
    buyerPage.value = page
  } catch { /* API errors are shown by the shared client. */ }
  finally { loadingBuyers.value = false }
}

async function loadOrders(page: number) {
  expanded.value = undefined
  const request = ++orderRequest
  loadingOrders.value = true
  try {
    const cursor = page === orderPage.value + 1 ? orders.value?.nextCursor : cursors[page - 1]
    if (page > 1 && !cursor) return
    const { data } = await fetchCashOrders(cursor ?? undefined, selected.value?.userId)
    if (request === orderRequest) {
      cursors = [...cursors.slice(0, page - 1), cursor ?? undefined]
      orders.value = data
      orderPage.value = page
    }
  } catch { /* API errors are shown by the shared client. */ }
  finally { if (request === orderRequest) loadingOrders.value = false }
}

function filterOrders(buyer?: Downline) {
  expanded.value = undefined
  selected.value = buyer
  cursors = [undefined]
  orders.value = undefined
  orderPage.value = 1
  void loadOrders(1)
}

function openCustomer(buyer: Downline) {
  knownBuyers.set(buyer.userId, buyer)
  enteredFromList = true
  void router.push({ query: { ...route.query, customer: String(buyer.userId) }, state: { customerName: buyer.name } })
}

function returnToBuyers() {
  if (!route.query.customer) {
    segment.value = 'customers'
    filterOrders(undefined)
    return
  }
  if (enteredFromList) router.back()
  else {
    const query = { ...route.query }
    delete query.customer
    void router.replace({ query })
  }
}

watch(() => route.query.customer, async (value, previous) => {
  const id = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : 0
  if (Number.isSafeInteger(id) && id > 0) {
    const remembered = window.history.state?.customerName
    filterOrders(knownBuyers.get(id) ?? { userId: id, name: typeof remembered === 'string' ? remembered : '顾客 #' + id, boundAt: '' })
    await nextTick()
    mobileHeading.value?.focus()
  } else {
    segment.value = 'customers'
    enteredFromList = false
    filterOrders(undefined)
    await nextTick()
    if (previous) document.getElementById('customer-' + previous)?.focus()
  }
}, { immediate: true })

onMounted(() => {
  viewport.addEventListener('change', syncViewport)
  void loadBuyers(1)
})
onBeforeUnmount(() => viewport.removeEventListener('change', syncViewport))
</script>

<style scoped src="./promotion-mobile.css"></style>
<style scoped>
.downlines { max-width: 1100px; padding: clamp(16px, 3vw, 32px); margin: auto; background: white; border-radius: 16px; }
h1 { margin: 0 0 1rem; }
h2 { margin: 2.5rem 0 .75rem; font-size: 1.25rem; }
.filter, .pagination { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
.filter { margin-bottom: .75rem; }
.pagination { margin-top: 1rem; justify-content: flex-end; }

@media (max-width: 768px), (max-width: 960px) and (max-height: 500px) and (orientation: landscape) {
  .downlines { padding: 0; max-width: none; text-align: left; background: transparent; }
  h1 { font-size: 24px; line-height: 1.3; margin: 0 0 22px; color: #101713; letter-spacing: -.02em; }
  .segments { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 16px; background: #f3f4f4; border-radius: 10px; border: 1px solid #d5dad7; }
  .segments button { min-height: 42px; border: 0; border-radius: 9px; background: transparent; color: #202823; font-weight: 600; }
  .segments button[aria-pressed=true] { background: #086443; color: white; }
  .customer-list ul { padding: 0; margin: 0; list-style: none; }
  .customer-list li + li { border-top: 1px solid #e0e5e1; }
  .customer-row { display: grid; width: 100%; grid-template-columns: 52px minmax(0,1fr) 18px; align-items: center; gap: 14px; padding: 17px 3px; text-align: left; color: #131b16; background: transparent; border: 0; border-radius: 0; }
  .initial { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; background: #dcefdc; color: #1d3828; font-size: 22px; }
  .buyer-info { display: grid; gap: 4px; min-width: 0; overflow-wrap: anywhere; }
  .buyer-info strong { font-size: 17px; }
  .buyer-info > span, .order-footer > span { color: #56635a; font-size: 13px; }
  .customer-row svg { width: 16px; }
  .customer-heading { position: relative; text-align: center; padding: 0 40px; margin-bottom: 24px; }
  .customer-heading h1 { margin: 0; font-size: 22px; overflow-wrap: anywhere; }
  .customer-heading p { font-size: 14px; color: #56635a; margin: 5px 0 0; }
  .back { position: absolute; top: -6px; left: -5px; display: grid; place-items: center; width: 44px; height: 44px; padding: 0; background: transparent; border: 0; color: #152419; }
  .back svg { width: 22px; }
  .order-list { display: grid; gap: 12px; }
  .order-card { border: 1px solid #d9e0db; border-radius: 12px; background: white; padding: 14px 15px 8px; min-width: 0; }
  .order-card header { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
  .order-card h3 { margin: 0; min-width: 0; color: #17221a; font-size: 17px; overflow-wrap: anywhere; }
  .order-status { flex: none; font-size: 12px; font-weight: 600; padding: 3px 8px; border-radius: 6px; background: #f2ede5; color: #75572c; }
  .order-status.paid { background: #e3f1e4; color: #17623b; }
  .paid-amount { display: block; margin: 6px 0; font-size: 24px; line-height: 1.35; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
  .payment-method { display: flex; align-items: center; gap: 6px; font-size: 14px; overflow-wrap: anywhere; }
  .payment-method svg { width: 16px; color: #127347; flex: none; }
  .order-footer { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0 8px; }
  .order-footer button { display: inline-flex; align-items: center; gap: 4px; margin-left: auto; min-height: 44px; background: transparent; border: 0; padding: 0; color: #086443; font-size: 14px; font-weight: 600; }
  .order-footer svg { width: 14px; }
  .turned { transform: rotate(90deg); }
  .order-details { display: grid; grid-template-columns: auto minmax(0,1fr); gap: 8px 12px; margin: 0; padding: 10px 0; border-top: 1px solid #e0e5e1; font-size: 13px; }
  .order-details dt { color: #56635a; }
  .order-details dd { margin: 0; overflow-wrap: anywhere; }
  .pagination { justify-content: center; }
  button:focus-visible { outline: 2px solid #086443; outline-offset: 2px; }
}
</style>
