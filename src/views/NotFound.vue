<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面未找到</p>
    <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
  </div>
</template>

<script setup lang="ts">
// 404 页面
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
</style>

