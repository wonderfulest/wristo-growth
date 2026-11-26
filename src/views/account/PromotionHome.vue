<template>
  <section class="promotion-home">
    <h1>{{ t('推广首页', 'Promotion home') }}</h1>
    <div class="tools">
      <article>
        <h2>{{ t('线下推广 · 小程序码', 'In person · Mini program QR code') }}</h2>
        <p>{{ t('在门店或活动现场出示你的小程序码。顾客扫码绑定后，下单或续费都按你的推广比例结算。', 'Display your QR code in store or at an event. Once a customer is linked to you, your referral rate applies to their orders and renewals.') }}</p>
        <router-link to="/account/materials">{{ t('查看专属小程序码', 'View my QR code') }} <span aria-hidden="true">→</span></router-link>
      </article>
      <article>
        <h2>{{ t('线上短视频推广 · 下单优惠码', 'Short videos · Checkout promo code') }}</h2>
        <p>{{ t('在短视频里口播优惠码，或把码放在字幕里。观众通过国内支付宝或微信小程序购买单品时可选填，留空按原价购买。', 'Say your code in the video or show it in the captions. For individual items purchased through domestic Alipay checkout or the WeChat mini program, customers can enter your code for a discount or leave it blank to pay the original price.') }}</p>
        <router-link to="/account/coupons">{{ t('查看专属推广码', 'View my referral code') }} <span aria-hidden="true">→</span></router-link>
      </article>
    </div>
    <section class="terms">
      <h2>{{ t('两种方式共用同一套佣金规则', 'Both methods use the same commission rate') }}</h2>
      <p>{{ t('顾客优惠和你的佣金合计 40%，都按你当前的小程序码设置计算。例如，顾客优惠设为 10%，扫码和填码产生的推广订单都按 30% 计佣。', 'Your customer discount and commission add up to 40%. Both follow your current QR code settings. For example, a 10% customer discount earns you 30% commission whether the customer scans or enters your code.') }}</p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { t } from '@/i18n'
</script>

<style scoped>
.promotion-home { padding: 20px; }
h1 { margin: 0 0 20px; font-size: 24px; }
.tools { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; text-align: start; }
article { display: flex; flex-direction: column; align-items: flex-start; gap: 14px; padding: 24px; background: white; border: 1px solid #d6e2da; border-radius: 14px; }
h2 { margin: 0; font-size: 20px; }
p { margin: 0; color: #48554e; line-height: 1.6; }
.terms { margin-top: 16px; padding: 20px 24px; background: #edf4ef; border-radius: 12px; text-align: start; }
.terms p { margin-top: 8px; }
a { margin-top: auto; padding: 9px 0; color: #175e40; font-weight: 600; }
@media (max-width: 768px) { .tools { grid-template-columns: 1fr; } }
</style>
