<template>
  <div class="account-layout">
    <div class="header-sub">
      <nav class="header-sub-nav" :aria-label="t('推广后台导航', 'Promoter navigation')">
        <router-link to="/account/dashboard" exact-active-class="active">{{ t('概览', 'Dashboard') }}</router-link>
        <router-link to="/account/coupons" exact-active-class="active">{{ t('优惠码', 'Coupons') }}</router-link>
        <router-link to="/account/materials" exact-active-class="active">{{ t('线下推广素材', 'Offline materials') }}</router-link>
        <router-link to="/account/downlines" exact-active-class="active">{{ t('我的下线', 'My customers') }}</router-link>
        <router-link to="/account/earnings" exact-active-class="active">{{ t('收益', 'Earnings') }}</router-link>
        <router-link to="/account/history" exact-active-class="active">{{ t('交易', 'Deals') }}</router-link>
        <router-link to="/account/profile" exact-active-class="active">{{ t('个人资料', 'Profile') }}</router-link>
      </nav>
    </div>
    <!-- Main Content -->
    <main class="main-content">
      <router-view />
    </main>
    <nav class="mobile-tabs" :aria-label="t('推广后台主导航', 'Main promoter navigation')">
      <router-link v-for="tab in tabs" :key="tab.path" :to="'/account/' + tab.path"
        :class="{ selected: tab.path === 'profile' && legacyPages.includes($route.name as string) }">
        <component :is="tab.icon" aria-hidden="true" />{{ tab.label }}
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { t } from '@/i18n'
import { Promotion, User, Coin, Avatar } from '@element-plus/icons-vue'
const tabs = [
  { path: 'materials', get label() { return t('推广', 'Promote') }, icon: Promotion },
  { path: 'downlines', get label() { return t('下线', 'Customers') }, icon: User },
  { path: 'earnings', get label() { return t('收益', 'Earnings') }, icon: Coin },
  { path: 'profile', get label() { return t('我的', 'Profile') }, icon: Avatar }
]
const legacyPages = ['Dashboard', 'Coupons', 'History']
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.account-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: $color-bg;
}
.header {
  background: $color-bg;
  border-bottom: 1px solid $color-border;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 auto;
}
.header-inner {
  width: 80%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 84px;
  background: $color-bg;
}
.logo {
  display: flex;
  align-items: center;
  font-size: $font-size-lg;
  font-weight: bold;
}
.logo-icon {
  background: $color-success;
  color: $color-header-text;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  font-size: $font-size-xl;
}
.logo-text {
  color: $color-link;
  font-weight: 600;
}
.header-right {
  display: flex;
  gap: 32px;
}
.header-right a {
  color: $color-info;
  font-size: $font-size-xs;
  text-decoration: none;
  transition: color 0.2s;
}
.header-right a:hover {
  color: $color-success;
}
.header-sub {
  width: 100%;
  background: $color-bg;
  display: flex;
  align-items: center;
  min-height: 56px;
  z-index: 10;
}
.header-sub-nav {
  width: 80%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: clamp(16px, 5vw, 72px);
  flex-wrap: wrap;
  padding: 0 0 0 8px;
  align-items: center;
}
.header-sub-nav a {
  color: $color-link;
  text-decoration: none;
  font-size: $font-size-md;
  font-weight: 500;
  padding: 8px 0 6px 0;
  border-bottom: 2.5px solid transparent;
  transition: color 0.18s, border-color 0.18s, background 0.18s;
  border-radius: 2px 2px 0 0;
  position: relative;
}
.header-sub-nav a:hover {
  color: $color-primary;
  background: rgba($color-primary, 0.07);
}
.header-sub-nav .active {
  color: $color-primary;
  border-bottom: 2.5px solid $color-primary;
  font-weight: 700;
}
.main-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 32px auto 0 auto;
  background: transparent;
  min-height: 400px;
}

.mobile-tabs { display: none; }
@media (max-width: 768px), (max-width: 960px) and (max-height: 500px) and (orientation: landscape) {
  .header-sub { display: none; }
  .account-layout { min-height: 0; background: white; }
  .main-content { min-width: 0; margin: 0; padding-bottom: calc(76px + env(safe-area-inset-bottom)); }
  .mobile-tabs {
    display: grid; grid-template-columns: repeat(4, 1fr); position: fixed;
    bottom: 0; inset-inline: 0; z-index: 20; background: white; border-top: 1px solid #e3e8e5;
    padding: 2px env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
  }
  .mobile-tabs a {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 3px; min-height: 57px; color: #626b67; font-size: 12px; text-decoration: none;
  }
  .mobile-tabs svg { width: 22px; height: 22px; }
  .mobile-tabs .router-link-active, .mobile-tabs .selected { color: #167649; font-weight: 700; }
}
</style>
