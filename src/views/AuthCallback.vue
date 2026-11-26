<template>
  <div class="auth-callback">
    <p v-if="loading">正在登录，请稍候...</p>
    <template v-else-if="error">
      <p>{{ error }}</p>
      <el-button type="primary" @click="redirectToSsoLogin('growth', 0, 'manual')">重新登录</el-button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchSsoToken, SsoTokenResponseData } from '@/api/sso'
import { getUserInfo } from '@/api/auth'
import type { ApiResponse } from '@/types/api'
import { useUserStore } from '@/store/user'
import { getSsoRedirectUri, redirectToSsoLogin } from '@/utils/ssoRedirect'

const loading = ref(true)
const error = ref('')
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const clientId = 'growth'
const redirectUri = getSsoRedirectUri()

onMounted(async () => {
  if (route.path === '/auth/sign-in') {
    error.value = '登录未能完成，请手动重新登录。'
    loading.value = false
    return
  }
  const code = route.query.code as string
  if (!code) {
    error.value = '未获取到 code 参数'
    loading.value = false
    return
  }
  try {
    const res: ApiResponse<SsoTokenResponseData> = await fetchSsoToken({
      code,
      clientId,
      redirectUri
    })
    if (res.code !== 0 || !res.data?.accessToken) throw new Error(res.msg || '登录失败')
    userStore.token = res.data.accessToken
    const userRes = await getUserInfo()
    if (userRes.code !== 0 || !userRes.data) throw new Error(userRes.msg || '获取用户信息失败')
    userStore.setUserInfo(userRes.data)
    await router.replace('/')
  } catch (e: any) {
    userStore.$reset()
    error.value = e?.msg || e?.message || '登录失败'
    redirectToSsoLogin('growth', 0, 'retry')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.auth-callback {
  padding: 40px;
  text-align: center;
}
</style> 
