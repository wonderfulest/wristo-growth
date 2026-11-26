<template>
  <section class="promotion-home">
    <h1>{{ t('推广首页', 'Promotion home') }}</h1>
    <div class="tools">
      <router-link to="/account/materials">
        <h2>{{ t('小程序码推广', 'Mini program QR codes') }}</h2>
        <p>{{ t('保存专属小程序码，分享给客户扫码使用。', 'Save your mini program QR code and share it with customers to scan.') }}</p>
      </router-link>
      <router-link to="/account/coupons">
        <h2>{{ t('下单优惠码推广', 'Checkout promo codes') }}</h2>
        <p>{{ t('创建和管理优惠码，分享给客户在下单时使用。', 'Create and manage promo codes for customers to enter at checkout.') }}</p>
      </router-link>
    </div>
  </section>
</template>

<script setup lang="ts">
import { t } from '@/i18n'
</script>

<style scoped>
.promotion-home { padding: 20px; }
h1 { margin: 0 0 20px; font-size: 24px; }
.tools { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.tools a { padding: 22px; border: 1px solid #d6e2da; border-radius: 12px; background: white; color: #175e40; text-decoration: none; }
.tools a:hover, .tools a:focus-visible { border-color: #167649; background: #f4faf6; }
h2 { margin: 0; font-size: 19px; }
p { margin: 8px 0 0; color: #48554e; line-height: 1.5; }
@media (max-width: 768px) { .tools { grid-template-columns: 1fr; } }
</style>
