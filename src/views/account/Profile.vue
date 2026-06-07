<template>
  <div class="profile-page">
    <div class="profile-container">
      <div class="profile-hero">
        <div class="avatar-wrapper" @click="triggerAvatarUpload">
          <img :src="form.avatar || defaultAvatar" class="avatar-img" alt="user avatar" />
          <div class="avatar-overlay">Avatar</div>
          <input ref="avatarInputRef" type="file" accept="image/*" hidden @change="onAvatarFileChange" />
        </div>
        <div class="hero-name">{{ form.nickname || form.username || 'Wristo' }}</div>
        <div class="hero-email">{{ form.email || '—' }}</div>
      </div>

      <template v-if="userInfo">
        <div class="section">
          <div class="section-header">
            <span class="section-title">Profile</span>
          </div>
          <div class="section-card">
            <div class="row">
              <div class="row-label">Username</div>
              <div class="row-value"><el-input v-model="form.username" placeholder="Enter username" /></div>
            </div>
            <div class="row-divider" />
            <div class="row">
              <div class="row-label">Email</div>
              <div class="row-value text-value">{{ form.email || '—' }}</div>
            </div>
            <div class="row-divider" />
            <div class="row">
              <div class="row-label">Phone</div>
              <div class="row-value text-value">{{ form.phone || '—' }}</div>
            </div>
            <div class="row-divider" />
            <div class="row">
              <div class="row-label">Joined at</div>
              <div class="row-value text-value">{{ form.createdAt || '—' }}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <span class="section-title">Payout</span>
          </div>
          <div class="section-card">
            <div class="row">
              <div class="row-label">Payout method</div>
              <div class="row-value">
                <el-select v-model="form.payoutMethod" placeholder="Select payout method" style="width: 100%">
                  <el-option label="Alipay" value="alipay" />
                  <el-option label="PayPal" value="paypal" />
                </el-select>
              </div>
            </div>
            <div class="row-divider" />
            <div class="row">
              <div class="row-label">Payout account</div>
              <div class="row-value"><el-input v-model="form.payoutAccount" placeholder="Enter payout account" /></div>
            </div>
            <div class="row-divider" />
            <div class="row save-row">
              <el-button type="primary" :loading="saving" @click="handleSave">Save</el-button>
            </div>
          </div>
        </div>
      </template>
      <el-skeleton v-else class="section-card loading-card" :rows="6" animated />
    </div>
  </div>
</template>

<script setup lang="ts">
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
      ElMessage.error(res.msg || 'Failed to load user')
    }
  } catch (e) {
    ElMessage.error('Failed to load user')
  } finally {
    loading.value = false
  }
}

function beforeAvatarUpload(file: File) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('Image only')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('Image must be < 2MB')
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
      ElMessage.success('Avatar updated')
    } else {
      ElMessage.error(res.msg || 'Avatar upload failed')
    }
  } catch (e) {
    ElMessage.error('Avatar upload failed')
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
      ElMessage.success('Saved')
      await fetchUserInfo()
    } else {
      ElMessage.error(res.msg || 'Save failed')
    }
  } catch (e) {
    ElMessage.error('Save failed')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.profile-page {
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
.avatar-wrapper:hover .avatar-overlay {
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
@media (max-width: 640px) {
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
</style> 
