<template>
  <div class="public-layout">
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <router-link to="/discover" class="logo-link">
            <h2 class="logo">家书</h2>
          </router-link>
          <nav class="nav-links">
            <router-link to="/discover" class="nav-link">发现广场</router-link>
            <router-link to="/memories" class="nav-link">回忆瞬间</router-link>
          </nav>
        </div>
        <div class="header-right">
          <template v-if="userStore.isAuthenticated">
            <!-- 已登录：显示用户信息和下拉菜单 -->
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <img 
                  :src="avatarUrl" 
                  alt="头像" 
                  class="user-avatar"
                  @error="handleAvatarError"
                />
                <span>{{ displayName }}</span>
                <el-icon class="el-icon--right"><CaretBottom /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="home">我的空间</el-dropdown-item>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <!-- 未登录：显示用户头像和文字，点击跳转登录（不使用下拉框，直接点击） -->
            <div class="user-info guest-user" @click="goToLogin">
              <img 
                :src="defaultAvatar" 
                alt="用户" 
                class="user-avatar"
              />
              <span>用户</span>
            </div>
          </template>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
/**
 * 公共布局组件
 * 用于公开页面（发现广场、回忆瞬间等），支持未登录用户访问
 */
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { CaretBottom } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import defaultAvatar from '@/assets/default_avatar.png'

const router = useRouter()
const userStore = useUserStore()

// 头像加载错误处理
const avatarError = ref(false)

/**
 * 计算属性：获取头像URL
 */
const avatarUrl = computed(() => {
  if (avatarError.value) {
    return defaultAvatar
  }
  
  const userAvatar = userStore.userInfo?.avatar
  if (userAvatar && userAvatar.trim()) {
    return userAvatar
  }
  
  return defaultAvatar
})

/**
 * 计算属性：显示名称
 */
const displayName = computed(() => {
  const nickname = userStore.userInfo?.nickname
  const username = userStore.userInfo?.username
  return nickname?.trim() || username || '用户'
})

/**
 * 头像加载错误处理
 */
const handleAvatarError = () => {
  avatarError.value = true
}

/**
 * 处理下拉菜单命令
 */
const handleCommand = (command: string) => {
  if (command === 'home') {
    router.push('/home')
  } else if (command === 'profile') {
    router.push('/user/profile')
  } else if (command === 'logout') {
    userStore.userLogout()
    ElMessage.success('已退出登录')
    router.push('/discover')
  }
}

/**
 * 跳转到登录页
 */
const goToLogin = () => {
  router.push({
    path: '/login',
    query: { redirect: router.currentRoute.value.fullPath }
  })
}
</script>

<style scoped>
.public-layout {
  height: 100vh;
}

.header {
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.logo-link {
  text-decoration: none;
  color: inherit;
}

.logo {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-color);
  letter-spacing: 1px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.nav-link {
  color: var(--text-primary);
  text-decoration: none;
  font-size: var(--font-size-base);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: var(--transition-base);
}

.nav-link:hover {
  background-color: var(--bg-hover);
  color: var(--primary-color);
}

.nav-link.router-link-active {
  color: var(--primary-color);
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.guest-user {
  cursor: pointer;
  /* 确保不会触发任何下拉行为 */
  user-select: none;
}

.guest-user:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e4e7ed;
  flex-shrink: 0;
}

.main-content {
  background-color: var(--bg-primary);
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100vh - 64px);
}
</style>

