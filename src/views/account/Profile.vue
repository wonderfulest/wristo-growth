<template>
  <div class="account-page">
    <h2>Profile</h2>
    <el-form
      v-if="userInfo"
      :model="form"
      label-width="90px"
      class="profile-form"
      @submit.prevent
    >
      <el-form-item label="Avatar">
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload"
          :on-change="handleAvatarChange"
          :auto-upload="false"
        >
          <img v-if="form.avatar" :src="form.avatar" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><i class="el-icon-plus" /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="Username">
        <el-input v-model="form.username" placeholder="Enter username" />
      </el-form-item>
      <!-- <el-form-item label="昵称">
        <el-input v-model="form.nickname" placeholder="请输入昵称" />
      </el-form-item> -->
      <el-form-item label="Email">
        <el-input v-model="form.email" disabled />
      </el-form-item>
      <el-form-item label="Phone">
        <el-input v-model="form.phone" disabled />
      </el-form-item>
      <el-form-item label="Joined at">
        <el-input v-model="form.createdAt" disabled />
      </el-form-item>

      <el-divider content-position="left">Payout</el-divider>
      
      <el-form-item label="Payout method">
        <el-select v-model="form.payoutMethod" placeholder="Select payout method" style="width: 100%">
          <el-option label="Alipay" value="alipay" />
          <el-option label="PayPal" value="paypal" />
          <!-- <el-option label="微信" value="wechat" /> -->
          <!-- <el-option label="银行卡" value="bank" /> -->
        </el-select>
      </el-form-item>
      
      <el-form-item label="Payout account">
        <el-input v-model="form.payoutAccount" placeholder="Enter payout account" />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" :loading="saving" @click="handleSave">Save</el-button>
      </el-form-item>
    </el-form>
    <el-skeleton v-else :rows="6" animated />
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
.account-page {
  width: 60%;
  padding: 32px;
  background: #fff;
  min-height: 300px;
  min-width: 480px;
  margin: 0 auto;
}
.profile-form {
  margin-top: 32px;
}
.avatar-uploader {
  display: flex;
  align-items: center;
}
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid #eee;
}
.avatar-uploader-icon {
  font-size: 32px;
  color: #bbb;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px dashed #eee;
  border-radius: 50%;
  background: #fafbfc;
}
</style> 