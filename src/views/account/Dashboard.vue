<template>
  <div class="promoter-dashboard">
    <!-- 我的推广员资料（整体分佣数据） -->
    <PromoterProfileOverview />

    <!-- 我的推广应用销售汇总（按应用分页） -->
    <PromoterAppSalesSummary />
  </div>
</template>

<script setup lang="ts">
import PromoterProfileOverview from '@/components/dashboard/PromoterProfileOverview.vue'
import PromoterAppSalesSummary from '@/components/dashboard/PromoterAppSalesSummary.vue'
</script>

<style scoped>
.promoter-dashboard {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>