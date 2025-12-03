<template>
  <div class="home-container">
    <!-- 我的空间内容 -->
    <MySpace />
  </div>
</template>

<script setup lang="ts">
import MySpace from './MySpace.vue'
</script>

<style scoped>
.home-container {
  width: 100%;
  min-height: calc(100vh - 64px);
  background-color: var(--bg-primary);
}
</style>
