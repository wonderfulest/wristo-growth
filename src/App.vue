<script setup lang="ts">
import { useRoute } from 'vue-router'
import Layout from '@/layout/Layout.vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import { locale } from '@/i18n'

const route = useRoute()
</script>

<template>
  <el-config-provider :locale="locale === 'en' ? en : zhCn">
    <component :is="route.meta.requiresAuth === false ? 'router-view' : Layout" />
  </el-config-provider>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
