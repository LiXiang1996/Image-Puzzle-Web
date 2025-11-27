<template>
  <div class="home-container">
    <!-- Tab切换 -->
    <el-tabs v-model="activeTab" class="home-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="我的空间" name="myspace">
        <MySpace />
      </el-tab-pane>
      <el-tab-pane label="发现广场" name="discover">
        <Discover />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MySpace from './MySpace.vue'
import Discover from './Discover.vue'

// 当前激活的Tab（默认"我的空间"）
const activeTab = ref<'myspace' | 'discover'>('myspace')

// Tab切换处理
const handleTabChange = (tabName: string) => {
  // 可以在这里添加切换逻辑，比如保存到localStorage
  localStorage.setItem('home_active_tab', tabName)
}

// 初始化：从localStorage恢复上次的Tab
onMounted(() => {
  const savedTab = localStorage.getItem('home_active_tab')
  if (savedTab === 'myspace' || savedTab === 'discover') {
    activeTab.value = savedTab
  }
})
</script>

<style scoped>
.home-container {
  width: 100%;
  min-height: calc(100vh - 64px);
  background-color: var(--bg-primary);
}

.home-tabs {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

:deep(.el-tabs__header) {
  margin-bottom: var(--spacing-lg);
  background-color: var(--bg-card);
  padding: 0 var(--spacing-md);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
}

:deep(.el-tabs__nav-wrap::after) {
  background-color: var(--border-light);
}

:deep(.el-tabs__item) {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  font-weight: 500;
  padding: var(--spacing-md) var(--spacing-lg);
  transition: var(--transition-base);
}

:deep(.el-tabs__item:hover) {
  color: var(--primary-color);
}

:deep(.el-tabs__item.is-active) {
  color: var(--primary-color);
}

:deep(.el-tabs__active-bar) {
  background-color: var(--primary-color);
}

:deep(.el-tabs__content) {
  padding: 0;
}
</style>
