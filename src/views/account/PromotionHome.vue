<template>
  <section class="promotion-home">
    <h1>{{ t('推广首页', 'Promotion home') }}</h1>
    <div class="tools">
      <article>
        <div class="scene store" aria-hidden="true">
          <div class="counter"></div>
          <div class="placard"><strong>wristo</strong><div class="matrix"><i></i><i></i><i></i></div></div>
          <div class="camera"><div class="finder"><span></span></div><b>✓</b></div>
        </div>
        <h2>{{ t('线下推广 · 小程序码', 'In person · Mini program QR code') }}</h2>
        <p>{{ t('在门店或活动现场出示你的小程序码。顾客扫码绑定后，下单或续费都按你的推广比例结算。', 'Display your QR code in store or at an event. Once a customer is linked to you, your referral rate applies to their orders and renewals.') }}</p>
        <router-link to="/account/materials">{{ t('查看专属小程序码', 'View my QR code') }} <span aria-hidden="true">→</span></router-link>
      </article>
      <article>
        <div class="scene video" aria-hidden="true">
          <div class="clip"><div class="strap"><div class="dial"><i></i></div></div>
            <div class="caption">{{ t('优惠码', 'CODE') }} · DEMO</div><div class="progress"></div>
          </div>
        </div>
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

article { overflow: hidden; box-shadow: 0 5px 18px #173d2510; }
.scene { position: relative; isolation: isolate; width: calc(100% + 48px); height: 170px; margin: -24px -24px 5px; overflow: hidden; display: grid; place-items: center; }
.store { background: radial-gradient(ellipse at 34% 0%, #faf8df, transparent 65%), #cbded1; }
.counter { position: absolute; inset: 67% 0 0; background: linear-gradient(158deg,#aec2b5,#e5ebdb); }
.placard { position: absolute; bottom: 21px; left: calc(50% - 68px); width: 90px; padding: 9px 0 13px; background: ivory; color: #173f33; text-align: center; transform: skew(-5deg) rotate(-5deg); border-radius: 5px; box-shadow: 5px 6px 0 #849a88, 9px 13px 14px #224d3730; }
.placard strong { font-size: 18px; letter-spacing: -1px; }
.matrix { position: relative; width: 54px; height: 54px; margin: 5px auto 0; background: repeating-conic-gradient(#21483b 0 25%,transparent 0 50%) 0 0 / 9px 11px, repeating-linear-gradient(75deg,transparent 0 8px,#21483b 9px 12px); }
.matrix i { position: absolute; width: 13px; height: 13px; background: #21483b; border: 3px solid ivory; outline: 3px solid #21483b; }
.matrix i:first-child { top: 3px; left: 3px; }
.matrix i:nth-child(2) { top: 3px; right: 3px; }
.matrix i:last-child { bottom: 3px; left: 3px; }
.camera { position: absolute; left: calc(50% + 4px); top: 47px; width: 67px; height: 110px; border: 4px solid #243932; border-radius: 14px; background: linear-gradient(145deg,#8bac99,#405f52); transform: rotate(9deg); box-shadow: 5px 9px 12px #24463438; display: grid; place-items: center; }
.finder { width: 40px; height: 40px; border: 1px solid #e0ffdf; border-radius: 4px; }
.finder span { display: block; height: 2px; background: #c0ffb7; box-shadow: 0 0 6px #baffaf; animation: scan 3.8s ease-in-out both; }
.camera b { position: absolute; bottom: 4px; color: #e2ffdd; animation: confirm 3.8s both; }
.video { background: radial-gradient(ellipse at 60% 100%,#506272,transparent 74%),#1b2e34; }
.clip { position: relative; width: 110px; height: 148px; overflow: hidden; border: 3px solid #102125; border-radius: 16px; background: linear-gradient(125deg,#cab890,#79745c 65%,#bdaf8f); transform: rotate(-5deg); box-shadow: 7px 10px 16px #09181466; }
.strap { position: absolute; left: 36px; top: -20px; height: 170px; width: 32px; background: repeating-linear-gradient(#364a40 0 4px,#253b30 4px 6px); transform: rotate(25deg); }
.dial { position: absolute; top: 49px; left: -17px; width: 66px; height: 66px; box-sizing: border-box; border: 4px solid silver; border-radius: 50%; background: radial-gradient(circle,#18352f 59%,transparent 61%),repeating-conic-gradient(#efe5c9 0 2deg,#16352e 2deg 30deg); box-shadow: 3px 3px 5px #23382e88; }
.dial i,.dial i::after { position: absolute; background: #f7ebcb; border-radius: 3px; transform-origin: bottom; }
.dial i { bottom: 50%; left: 49%; width: 3px; height: 16px; transform: rotate(-77deg); }
.dial i::after { content: ''; bottom: 0; width: 2px; height: 22px; transform: rotate(120deg); }
.caption { position: absolute; bottom: 13px; inset-inline: 5px; padding: 3px; border-radius: 4px; background: #fff4cc; color: #243a30; text-align: center; font: bold 10px/1.4 system-ui; animation: confirm 2.4s both; }
.progress { position: absolute; bottom: 4px; left: 7%; width: 86%; height: 2px; background: white; transform-origin: left; animation: play 4s linear both; }
@keyframes scan { 0%,50% { transform: translateY(2px); } 25%,100% { transform: translateY(36px); } }
@keyframes confirm { 0%,68% { opacity: 0; } 100% { opacity: 1; } }
@keyframes play { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@media (prefers-reduced-motion: reduce) { .scene * { animation: none; } }
</style>
