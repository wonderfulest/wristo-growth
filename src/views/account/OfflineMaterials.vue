<template>
  <section class="materials" aria-labelledby="materials-title">
    <h1 id="materials-title">我的推广码</h1>
    <div v-if="!profile" class="feedback" aria-live="polite">
      <span v-if="loading">正在加载推广资料…</span>
      <button v-else @click="loadProfile">重新加载推广资料</button>
    </div>
    <template v-else>
      <div class="qr-versions" role="group" aria-label="选择小程序版本">
        <button :aria-pressed="!trial" @click="selectVersion(false)">正式版小程序码</button>
        <button :aria-pressed="trial" @click="selectVersion(true)">体验版小程序码</button>
      </div>
      <p v-if="trial" class="hint">请使用有体验权限的微信扫码。</p>
      <div class="qr-area" :aria-busy="loadingQr">
        <button v-if="qrUrl" class="qr-image" :aria-label="'预览' + qrLabel" @click="preview?.showModal()">
          <img :src="qrUrl" :alt="qrLabel" @error="clearQr" />
        </button>
        <span v-else-if="loadingQr" role="status">正在加载小程序码…</span>
        <button v-else class="outline" @click="loadQr">重新加载小程序码</button>
      </div>
      <div class="code-strip"><span>推广码</span><strong>{{ profile.code }}</strong></div>
      <button class="primary action" :disabled="!qrUrl" @click="saveQr">保存{{ qrLabel }}</button>
      <button class="outline action" @click="copyCode">复制推广码</button>

      <section class="discount">
        <div class="section-heading">
          <h2>优惠与佣金</h2>
          <button class="adjust" @click="openSettings">调整 <span aria-hidden="true">›</span></button>
        </div>
        <dl class="split">
          <div><dt>顾客优惠</dt><dd>{{ profile.discountPercent }}%</dd></div>
          <div><dt>我的佣金</dt><dd>{{ 40 - profile.discountPercent }}%</dd></div>
        </dl>
      </section>
      <div class="desktop-links">
        <router-link to="/account/earnings">查看推广收益</router-link>
        <router-link to="/account/downlines">查看我的下线</router-link>
      </div>
    </template>

    <dialog ref="preview" class="preview" aria-labelledby="preview-title">
      <div class="section-heading"><h2 id="preview-title">{{ qrLabel }}</h2><button aria-label="关闭预览" @click="preview?.close()">×</button></div>
      <img v-if="qrUrl" :src="qrUrl" alt="可长按保存的推广小程序码" />
      <p>长按图片可保存到手机。</p>
      <button class="outline action" @click="downloadQr">下载 PNG</button>
    </dialog>

    <dialog ref="settings" class="sheet" aria-labelledby="settings-title" @cancel="guardCancel">
      <div class="handle" aria-hidden="true"></div>
      <div class="section-heading">
        <h2 id="settings-title">调整优惠比例</h2>
        <button class="close" aria-label="取消调整" :disabled="saving" @click="settings?.close()">×</button>
      </div>
      <label for="discount-percent">顾客优惠</label>
      <div class="stepper">
        <button :disabled="saving || draft <= 0" aria-label="减少一个百分点" @click="step(-1)">−</button>
        <div><input id="discount-percent" inputmode="numeric" type="number" step="1" min="0" max="40" :value="Number.isFinite(draft) ? draft : ''" :disabled="saving" @input="edit" /><span aria-hidden="true">%</span></div>
        <button :disabled="saving || draft >= 40" aria-label="增加一个百分点" @click="step(1)">+</button>
      </div>
      <p class="hint">0% 至 40%，每次调整 1%</p>
      <div aria-live="polite">
        <dl class="split">
          <div><dt>顾客优惠</dt><dd>{{ valid ? draft + '%' : '—' }}</dd></div>
          <div><dt>我的佣金</dt><dd>{{ valid ? 40 - draft + '%' : '—' }}</dd></div>
        </dl>
        <section class="example">
          <h3>以 ¥69.90 会员套餐为例</h3>
          <dl class="split">
            <div><dt>顾客实付</dt><dd>{{ valid ? yuan(6990 - discountFen) : '—' }}</dd></div>
            <div><dt>我的佣金</dt><dd>{{ valid ? yuan(2796 - discountFen) : '—' }}</dd></div>
          </dl>
        </section>
      </div>
      <p>保存后对新订单生效，续费同样适用。</p>
      <button class="primary action" :disabled="saving || !valid" @click="saveDiscount">{{ saving ? '正在保存…' : '保存比例' }}</button>
    </dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { downloadOfflineQr, fetchOfflineProfile, saveOfflineDiscount, type OfflineProfile } from '@/api/offline-promotion'

const profile = ref<OfflineProfile>()
const loading = ref(true)
const trial = ref(false)
const qrLabel = computed(() => trial.value ? '体验版小程序码' : '正式版小程序码')
let requestId = 0
const qrUrl = ref('')
const loadingQr = ref(false)
const settings = ref<HTMLDialogElement>()
const preview = ref<HTMLDialogElement>()
const saving = ref(false)
const draft = ref(0)
const valid = computed(() => Number.isInteger(draft.value) && draft.value >= 0 && draft.value <= 40)
const discountFen = computed(() => Math.floor((6990 * draft.value + 50) / 100))
const yuan = (fen: number) => '¥' + (fen / 100).toFixed(2)
let disposed = false

async function loadProfile() {
  loading.value = true
  try {
    profile.value = (await fetchOfflineProfile()).data
    if (profile.value && !disposed) void loadQr()
  } catch { /* The API client displays the error. */ }
  finally { loading.value = false }
}

function selectVersion(next: boolean) {
  if (trial.value === next) return
  trial.value = next
  clearQr()
  loadingQr.value = false
  void loadQr()
}

async function loadQr() {
  if (loadingQr.value || qrUrl.value) return
  const id = ++requestId
  loadingQr.value = true
  try {
    const blob = await downloadOfflineQr(trial.value)
    if (!disposed && id === requestId) qrUrl.value = URL.createObjectURL(blob)
  } catch { /* Keep the retry button available. */ }
  finally { if (id === requestId) loadingQr.value = false }
}

function clearQr() {
  if (qrUrl.value) URL.revokeObjectURL(qrUrl.value)
  qrUrl.value = ''
}

function downloadQr() {
  if (!qrUrl.value || !profile.value) return
  const link = document.createElement('a')
  link.href = qrUrl.value
  link.download = 'wristo-' + profile.value.code + (trial.value ? '-trial.png' : '.png')
  document.body.append(link)
  link.click()
  link.remove()
}

function saveQr() {
  if (window.matchMedia('(pointer: coarse)').matches || /MicroMessenger|iPhone|iPad/i.test(navigator.userAgent)) {
    preview.value?.showModal()
  } else {
    downloadQr()
  }
}

async function copyCode() {
  if (!profile.value) return
  try {
    await navigator.clipboard.writeText(profile.value.code)
    ElMessage.success('推广码已复制')
  } catch { ElMessage.warning('请选中推广码并手动复制') }
}

function openSettings() {
  if (!profile.value) return
  draft.value = profile.value.discountPercent
  settings.value?.showModal()
}

function guardCancel(event: Event) {
  if (saving.value) event.preventDefault()
}

function edit(event: Event) {
  draft.value = (event.target as HTMLInputElement).valueAsNumber
}

function step(delta: number) {
  draft.value = Math.max(0, Math.min(40, (valid.value ? draft.value : 0) + delta))
}

async function saveDiscount() {
  if (!valid.value || saving.value || !profile.value) return
  saving.value = true
  try {
    const result = await saveOfflineDiscount(draft.value)
    profile.value = result.data || { ...profile.value, discountPercent: draft.value }
    settings.value?.close()
    ElMessage.success('已保存优惠比例')
  } catch { /* The dialog retains the draft for retry. */ }
  finally { saving.value = false }
}

onMounted(loadProfile)
onBeforeUnmount(() => {
  disposed = true
  clearQr()
})
</script>

<style scoped>
.qr-versions { display: flex; margin: 16px 0 0; padding: 3px; background: #eff4f1; border-radius: 12px; }
.qr-versions button { flex: 1; }
.qr-versions button[aria-pressed="true"] { background: #086642; color: white; font-weight: 650; }
.materials { --green: #086642; max-width: 510px; padding: 24px; margin: 0 auto; border-radius: 16px; color: #18201c; background: white; }
h1, h2, h3, dl, dd { margin: 0; }
h1 { font-size: 1.5rem; }
h2 { font-size: 1.15rem; }
h3, label { font-size: 1rem; font-weight: 650; }
button { min-height: 44px; min-width: 44px; border: 0; border-radius: 9px; font: inherit; color: inherit; background: transparent; cursor: pointer; }
button:disabled { opacity: .45; cursor: default; }
button:focus-visible, input:focus-visible, a:focus-visible { outline: 3px solid #278261; outline-offset: 2px; }
.feedback, .qr-area { display: grid; place-items: center; min-height: 10rem; color: #4b5a51; }
.qr-area { min-height: clamp(170px, 29dvh, 245px); margin: .5rem 0 1rem; }
.qr-image { padding: 0; display: block; }
.qr-image img { display: block; width: min(58vw, 29dvh, 245px); height: auto; -webkit-touch-callout: default; }
.code-strip { display: flex; align-items: center; gap: 1rem; padding: .8rem 1rem; background: #f2f4f3; border-radius: 9px; }
.code-strip strong { flex: 1; text-align: center; user-select: all; overflow-wrap: anywhere; }
.action { display: block; width: 100%; margin-top: 9px; font-weight: 650; }
.primary { background: var(--green); color: white; }
.outline { border: 1px solid var(--green); color: var(--green); }
.discount { margin-top: 20px; border-top: 1px solid #e1e7e3; padding-top: 5px; }
.section-heading { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.adjust { color: var(--green); }
.split { display: grid; grid-template-columns: 1fr 1fr; padding: 12px 0; border-radius: 10px; background: #e6f1e6; text-align: center; }
.split > div + div { border-left: 1px solid #c4d1c8; }
dt { font-size: .85rem; }
dd { color: #06593d; font-weight: 700; font-size: 1.4rem; font-variant-numeric: tabular-nums; }
.desktop-links { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 1rem; }
.desktop-links a { color: var(--green); }
dialog { box-sizing: border-box; color: inherit; border: none; border-radius: 16px; width: min(92vw, 425px); max-height: 94dvh; padding: 20px; overflow-y: auto; }
dialog::backdrop { background: rgb(14 25 18 / 42%); }
dialog p { color: #56625c; font-size: .9rem; }
.preview img { display: block; width: min(100%, 300px); margin: auto; -webkit-touch-callout: default; }
.sheet label { display: block; margin: 8px 0; }
.close, .preview .section-heading button { font-size: 1.55rem; }
.stepper { display: grid; grid-template-columns: 56px 1fr 56px; align-items: stretch; border: 1px solid #cfd8d1; border-radius: 8px; overflow: hidden; }
.stepper button { background: #f5f7f5; border-radius: 0; font-size: 1.5rem; }
.stepper > div { display: flex; justify-content: center; align-items: center; min-width: 0; font-size: 1.75rem; color: var(--green); font-weight: 700; }
.stepper input { width: 2.2ch; text-align: right; color: inherit; border: 0; font: inherit; appearance: textfield; }
.stepper input::-webkit-inner-spin-button { appearance: none; }
.hint { text-align: center; margin: 6px 0 14px; }
.example { background: #f2f3f2; border-radius: 10px; padding: 12px; margin-top: 12px; }
.example .split { background: transparent; padding-bottom: 0; }
.handle { display: none; }
@media (max-width: 768px) {
  .materials { max-width: 490px; padding: 12px 16px 18px; border-radius: 0; }
  .desktop-links { display: none; }
  .sheet { margin: auto 0 0; width: 100%; max-width: 100%; border-radius: 18px 18px 0 0; padding: 10px 16px max(16px, env(safe-area-inset-bottom)); }
  .handle { display: block; width: 42px; height: 5px; margin: 0 auto; background: #bac2bd; border-radius: 8px; }
}
</style>
