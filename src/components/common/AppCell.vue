<template>
  <div class="app-cell">
    <img v-if="imageUrl" :src="imageUrl" alt="" class="app-thumb" />
    <div class="app-info">
      <div class="app-name">
        <a
          v-if="linkUrl"
          :href="linkUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="app-link"
        >
          {{ title }}
        </a>
        <span v-else>{{ title }}</span>
      </div>
      <div v-if="subtitle" class="app-sub">{{ subtitle }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  imageUrl?: string | null
  linkUrl?: string | null
}

defineProps<Props>()
</script>

<style scoped>
.app-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-thumb {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #e9ecef;
}

.app-info {
  display: flex;
  flex-direction: column;
}

.app-name {
  font-weight: 600;
  color: #212529;
}

.app-link {
  color: inherit;
  text-decoration: none;
}

.app-link:hover {
  text-decoration: underline;
}

.app-sub {
  font-size: 12px;
  color: #6c757d;
}
</style>
