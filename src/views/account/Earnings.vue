<template>
  <section class="earnings-page" aria-labelledby="earnings-heading">
    <h1 id="earnings-heading">{{ t('我的收益', 'My earnings') }}</h1>
    <div v-if="earnings" class="earnings-total">
      <h2>{{ t('累计佣金', 'Total commission') }}</h2>
      <p class="money"><span>¥</span>{{ amount(earnings.commissionFen) }}</p>
      <p class="total-note">{{ t('已扣除退款冲回', 'After refund adjustments') }}</p>
    </div>
    <section class="detail" aria-labelledby="commission-heading" :aria-busy="loading">
      <h2 id="commission-heading">{{ t('佣金明细', 'Commission history') }}</h2>
      <div v-if="error" role="alert" class="feedback">
        <p>{{ t('收益明细暂时无法加载', 'Unable to load earnings') }}</p><button @click="load(requestedPage)">{{ t('重新加载', 'Reload') }}</button>
      </div>
      <p v-else-if="loading" role="status" class="feedback">{{ t('正在加载收益…', 'Loading earnings…') }}</p>
      <p v-else-if="!earnings?.items.length" class="feedback">{{ t('暂无佣金明细', 'No commission yet') }}</p>
      <ul v-else class="entries">
        <li v-for="item in earnings.items" :key="item.orderNo" class="entry">
          <span class="avatar" :title="item.buyerNickname || t('顾客', 'Customer')">
            {{ Array.from(item.buyerNickname?.trim() || t('客', 'C'))[0] }}
          </span>
          <div class="description">
            <h3>{{ item.productName || t('会员订单', 'Membership order') }}</h3>
            <p v-if="item.paidAt"><time :datetime="item.paidAt">{{ displayTime(item.paidAt) }}</time></p>
            <p v-if="item.status === 'REVERSED'">{{ t('原佣金 ¥', 'Original commission ¥') }}{{ amount(item.commissionFen) }}</p>
          </div>
          <div class="entry-value" :class="{ reversed: item.status === 'REVERSED' }">
            <strong>{{ item.status === 'REVERSED' ? '¥0.00' : '+¥' + amount(item.commissionFen) }}</strong>
            <span>{{ item.status === 'REVERSED' ? t('已冲回', 'Reversed') : t('已计入', 'Credited') }}</span>
          </div>
        </li>
      </ul>
      <nav v-if="earnings && earnings.total > 20" class="pager" :aria-label="t('收益分页', 'Earnings pages')">
        <button :disabled="loading || page <= 1" @click="load(page - 1)">{{ t('上一页', 'Previous') }}</button>
        <span aria-live="polite">{{ page }} / {{ Math.ceil(earnings.total / 20) }}</span>
        <button :disabled="loading || page >= Math.ceil(earnings.total / 20)" @click="load(page + 1)">{{ t('下一页', 'Next') }}</button>
      </nav>
    </section>
  </section>
</template>

<script setup lang="ts">
import { locale, t } from '@/i18n'
import { onMounted, ref } from 'vue'
import { fetchOfflineEarnings, type OfflineEarnings } from '@/api/offline-promotion'

const earnings = ref<OfflineEarnings>()
const loading = ref(false)
const error = ref(false)
const page = ref(1)
const requestedPage = ref(1)
const amount = (fen: number) => (fen / 100).toLocaleString(locale.value, {
  minimumFractionDigits: 2, maximumFractionDigits: 2
})
function displayTime(value: string) {
  return value.replace('T', ' ').slice(0, 16)
}
async function load(target: number) {
  if (loading.value) return
  loading.value = true
  error.value = false
  requestedPage.value = target
  try {
    const response = await fetchOfflineEarnings(target)
    if (response.code !== 0 || !response.data) throw new Error()
    earnings.value = response.data
    page.value = target
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}
onMounted(() => load(1))
</script>

<style scoped>
.earnings-page { width: 100%; max-width: 740px; margin: 0 auto; padding: 20px clamp(14px, 3vw, 30px) 32px; box-sizing: border-box; color: #121916; background: #fff; }
.earnings-page h1, .earnings-page h2, .earnings-page h3, .earnings-page p { margin: 0; }
.earnings-page h1 { font-size: 26px; line-height: 1.35; margin-bottom: 20px; }
.earnings-total { background: #e6f1e4; border-radius: 13px; padding: 16px 20px; }
.earnings-total h2 { font-size: 16px; font-weight: 650; }
.earnings-total .money { font-size: clamp(32px, 8vw, 44px); font-weight: 750; line-height: 1.18; color: #005c3b; margin: 7px 0 5px; overflow-wrap: anywhere; }
.money span { font-size: .68em; margin-right: 4px; }
.total-note, .description p, .feedback { color: #565e59; font-size: 14px; }
.detail { border-top: 1px solid #e0e5e1; margin-top: 22px; padding-top: 16px; }
.detail > h2 { font-size: 19px; }
.entries { list-style: none; margin: 7px 0 0; padding: 0; }
.entry { display: grid; grid-template-columns: 42px minmax(0, 1fr) minmax(0, auto); gap: 10px; align-items: center; min-height: 78px; padding: 14px 1px; border-bottom: 1px solid #e2e6e3; box-sizing: border-box; }
.avatar { height: 42px; border-radius: 50%; display: grid; place-items: center; background: #dcefd9; font-size: 20px; font-weight: 600; }
.description h3 { font-size: 17px; line-height: 1.35; overflow-wrap: anywhere; }
.description p { margin-top: 4px; line-height: 1.4; }
.entry-value { color: #007149; text-align: right; max-width: 10em; overflow-wrap: anywhere; }
.entry-value strong { display: block; font-size: 18px; font-variant-numeric: tabular-nums; }
.entry-value span { display: inline-block; margin-top: 4px; padding: 2px 8px; border-radius: 5px; background: #e1f0df; font-size: 13px; }
.reversed { color: #272d29; }
.reversed span { background: #eceeec; }
.feedback { padding: 24px 0; }
.feedback button { margin-top: 12px; }
.pager { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 18px; }
.earnings-page button { color: #006b44; background: white; font: inherit; border: 1px solid #b7cdbd; border-radius: 7px; min-height: 44px; padding: 0 12px; cursor: pointer; }
.earnings-page button:disabled { color: #747b76; border-color: #dbe0db; cursor: default; }
@media (max-width: 768px), (max-width: 960px) and (max-height: 500px) and (orientation: landscape) {
  .earnings-page { max-width: 600px; padding: 12px 4px 20px; }
}
@media (max-width: 360px) {
  .entry { grid-template-columns: 35px minmax(0,1fr) minmax(0,auto); gap: 7px; }
  .avatar { height: 35px; font-size: 17px; }
  .entry-value strong { font-size: 16px; }
}
</style>
