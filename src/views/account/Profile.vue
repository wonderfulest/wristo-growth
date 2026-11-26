<template>
  <div class="profile-page">
    <div class="profile-container">
      <div class="profile-hero">
        <button type="button" class="avatar-wrapper" :aria-label="t('更换头像', 'Change avatar')" @click="triggerAvatarUpload">
          <img :src="form.avatar || defaultAvatar" class="avatar-img" :alt="t('用户头像', 'user avatar')" />
          <div class="avatar-overlay">{{ t('头像', 'Avatar') }}</div>
        </button>
        <input ref="avatarInputRef" type="file" accept="image/*" hidden @change="onAvatarFileChange" />
        <div class="hero-name">{{ form.nickname || form.username || 'Wristo' }}</div>
        <div class="hero-email">{{ form.email || '—' }}</div>
      </div>

      <nav class="account-links" :aria-label="t('账户服务', 'Account services')">
        <router-link to="/account/dashboard">{{ t('推广概览 ›', 'Dashboard ›') }}</router-link>
        <router-link to="/account/history">{{ t('交易记录 ›', 'Deals ›') }}</router-link>
        <button type="button" @click="logout">{{ t('退出登录', 'Log out') }}</button>
      </nav>
      <template v-if="userInfo">
        <div class="section">
          <div class="section-header">
            <span class="section-title">{{ t('个人资料', 'Profile') }}</span>
          </div>
          <div class="section-card">
            <div class="row">
              <label class="row-label" for="profile-username">{{ t('用户名', 'Username') }}</label>
              <div class="row-value"><el-input id="profile-username" v-model="form.username" :placeholder="t('输入用户名', 'Enter username')" /></div>
            </div>
            <div class="row-divider" />
            <div class="row">
              <div class="row-label">{{ t('邮箱', 'Email') }}</div>
              <div class="row-value text-value">{{ form.email || '—' }}</div>
            </div>
            <div class="row-divider" />
            <div class="row">
              <div class="row-label">{{ t('手机号', 'Phone') }}</div>
              <div class="row-value text-value">{{ form.phone || '—' }}</div>
            </div>
            <div class="row-divider" />
            <div class="row">
              <div class="row-label">{{ t('注册时间', 'Joined at') }}</div>
              <div class="row-value text-value">{{ form.createdAt || '—' }}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <span class="section-title">{{ t('收款信息', 'Payout') }}</span>
          </div>
          <div class="section-card">
            <div class="row">
              <div class="row-label">{{ t('收款方式', 'Payout method') }}</div>
              <div class="row-value">
                <el-select :aria-label="t('收款方式', 'Payout method')" v-model="form.payoutMethod" :placeholder="t('选择收款方式', 'Select payout method')" style="width: 100%">
                  <el-option :label="t('支付宝', 'Alipay')" value="alipay" />
                  <el-option label="PayPal" value="paypal" />
                </el-select>
              </div>
            </div>
            <div class="row-divider" />
            <div class="row">
              <label class="row-label" for="profile-payout-account">{{ t('收款账号', 'Payout account') }}</label>
              <div class="row-value"><el-input id="profile-payout-account" v-model="form.payoutAccount" :placeholder="t('输入收款账号', 'Enter payout account')" /></div>
            </div>
            <div class="row-divider" />
            <div class="row save-row">
              <el-button type="primary" :loading="saving" @click="handleSave">{{ t('保存', 'Save') }}</el-button>
            </div>
          </div>
        </div>
      </template>
      <el-skeleton v-else class="section-card loading-card" :rows="6" animated />
    </div>
  </div>
</template>

<script setup lang="ts">
import { t } from '@/i18n'
import { useUserStore } from '@/store/user'
import { redirectToSsoLogin } from '@/utils/ssoRedirect'
import { ref, reactive, onMounted } from 'vue'
import { getPromUserInfo, updatePromUserInfo, uploadAvatar } from '@/api/user'
import type { PromUserVO, PromUserUpdateDTO, ApiResponse } from '@/types/api'
import { ElMessage } from 'element-plus'

const userInfo = ref<PromUserVO | null>(null)
const loading = ref(true)
const saving = ref(false)
const defaultAvatar = 'https://cdn.wristo.io/test/avatar/561aae25-41bd-47ab-974e-7231f5a850e8.png'
const avatarInputRef = ref<HTMLInputElement | null>(null)

const form = reactive({
  username: '',
  nickname: '',
  avatar: '',
  email: '',
  phone: '',
  createdAt: '',
  payoutMethod: '',
  payoutAccount: ''
})

onMounted(async () => {
  await fetchUserInfo()
})

async function fetchUserInfo() {
  loading.value = true
  try {
    const res: ApiResponse<PromUserVO> = await getPromUserInfo()
    if (res.code === 0 && res.data) {
      userInfo.value = res.data
      Object.assign(form, {
        username: res.data.username || '',
        nickname: res.data.nickname || '',
        avatar: res.data.avatar || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        createdAt: res.data.createdAt || '',
        payoutMethod: res.data.payoutMethod || '',
        payoutAccount: res.data.payoutAccount || ''
      })
    } else {
      ElMessage.error(res.msg || t('无法加载用户信息', 'Failed to load user'))
    }
  } catch (e) {
    ElMessage.error(t('无法加载用户信息', 'Failed to load user'))
  } finally {
    loading.value = false
  }
}

function beforeAvatarUpload(file: File) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error(t('请选择图片文件', 'Image only'))
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error(t('图片须小于 2 MB', 'Image must be < 2MB'))
  }
  return isImage && isLt2M
}

async function handleAvatarChange(fileObj: any) {
  const file = fileObj.raw
  if (!beforeAvatarUpload(file)) return
  try {
    const res: ApiResponse<string> = await uploadAvatar(file)
    if (res.code === 0) {
      form.avatar = res.data || ''
      ElMessage.success(t('头像已更新', 'Avatar updated'))
    } else {
      ElMessage.error(res.msg || t('头像上传失败', 'Avatar upload failed'))
    }
  } catch (e) {
    ElMessage.error(t('头像上传失败', 'Avatar upload failed'))
  }
}

function triggerAvatarUpload() {
  avatarInputRef.value?.click()
}

async function onAvatarFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  await handleAvatarChange({ raw: files[0] })
  ;(e.target as HTMLInputElement).value = ''
}

async function handleSave() {
  saving.value = true
  try {
    const updateData: PromUserUpdateDTO = {
      username: form.username,
      nickname: form.nickname,
      avatar: form.avatar,
      payoutMethod: form.payoutMethod,
      payoutAccount: form.payoutAccount
    }
    const res: ApiResponse<boolean> = await updatePromUserInfo(updateData)
    if (res.code === 0) {
      ElMessage.success(t('已保存', 'Saved'))
      await fetchUserInfo()
    } else {
      ElMessage.error(res.msg || t('保存失败', 'Save failed'))
    }
  } catch (e) {
    ElMessage.error(t('保存失败', 'Save failed'))
  } finally {
    saving.value = false
  }
}
async function logout() {
  await useUserStore().logout()
  redirectToSsoLogin('growth')
}
</script>

<style scoped>
.profile-page {
  box-sizing: border-box;
  width: 100%;
  min-height: calc(100vh - 80px);
  background: #f2f2f7;
  display: flex;
  justify-content: center;
  padding: 0 16px 48px;
}
.profile-container {
  width: 100%;
  max-width: 620px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-top: 40px;
}
.profile-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.avatar-wrapper {
  border: 0;
  padding: 0;
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 0 0 3px #fff, 0 2px 16px rgba(0, 0, 0, 0.08);
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 0.8rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.avatar-wrapper:hover .avatar-overlay, .avatar-wrapper:focus-visible .avatar-overlay {
  opacity: 1;
}
.hero-name {
  margin-top: 8px;
  color: #1d1d1f;
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
}
.hero-email {
  color: #86868b;
  font-size: 0.9375rem;
}
.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.section-header {
  padding: 0 4px;
}
.section-title {
  color: #86868b;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.section-card {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 0.5px 0 rgba(0, 0, 0, 0.04);
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 50px;
  padding: 13px 18px;
}
.row-divider {
  height: 1px;
  margin-left: 18px;
  background: #e5e5ea;
}
.row-label {
  flex: 0 0 140px;
  color: #1d1d1f;
  font-size: 0.9375rem;
}
.row-value {
  flex: 1;
  min-width: 0;
  text-align: right;
}
.text-value {
  color: #6e6e73;
  overflow-wrap: anywhere;
}
.save-row {
  justify-content: flex-end;
}
.loading-card {
  padding: 18px;
}
@media (max-width: 640px), (max-width: 960px) and (max-height: 500px) and (orientation: landscape) {
  .profile-page { padding: 0 0 24px; }
  .profile-container { padding-top: 12px; gap: 20px; min-width: 0; }
  .hero-name, .hero-email { max-width: 100%; overflow-wrap: anywhere; text-align: center; }
  .avatar-wrapper { width: 80px; height: 80px; }
  .row { gap: 6px; padding: 12px 14px; }
  .row :deep(.el-input__wrapper), .row :deep(.el-select__wrapper), .save-row :deep(button) { min-height: 44px; }
  .row :deep(input) { font-size: 16px; }
  .save-row :deep(button) { width: 100%; }

  .row {
    align-items: flex-start;
    flex-direction: column;
  }
  .row-label {
    flex-basis: auto;
  }
  .row-value {
    width: 100%;
    text-align: left;
  }
}
  .account-links { display: grid; grid-template-columns: 1fr 1fr; margin: 12px 0; gap: 1px; }
  .account-links a, .account-links button { display: grid; place-items: center; min-height: 44px; background: #f4f7f5; border: 0; font: inherit; font-size: 14px; color: #255a42; text-decoration: none; }
</style> 
