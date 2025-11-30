<template>
  <div class="user-layout">
    <el-container>
      <el-aside width="240px" class="sidebar">
        <div class="logo" @click="handleLogoClick">
          <span class="logo-text">家书</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/user/profile">
            <el-icon><User /></el-icon>
            <span>个人资料</span>
          </el-menu-item>
          <el-menu-item index="/user/favorites">
            <el-icon><Star /></el-icon>
            <span>我的收藏</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="header">
          <div class="header-right">
            <div class="user-info">
              <img 
                :src="avatarUrl" 
                alt="头像" 
                class="user-avatar"
                @error="handleAvatarError"
              />
              <span class="username">{{ displayName }}</span>
            </div>
            <el-button 
              type="text" 
              class="logout-btn"
              @click="handleLogout"
            >
              退出登录
            </el-button>
          </div>
        </el-header>
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
/**
 * 个人中心布局组件
 * 包含侧边栏导航和主内容区域
 */
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { User, Star } from '@element-plus/icons-vue'
import defaultAvatar from '@/assets/default_avatar.png'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 头像加载错误处理
const avatarError = ref(false)

// 计算当前激活的菜单项（根据当前路由路径）
const activeMenu = computed(() => route.path)

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
 * 优先显示昵称，如果没有昵称则显示用户名
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
 * Logo 点击事件
 * 点击左上角 Logo 返回首页
 */
const handleLogoClick = () => {
  router.push('/home')
}

/**
 * 处理菜单选择
 * 关键逻辑：使用 replace 而不是 push，避免在浏览器历史记录中留下个人中心子页面之间的跳转
 * 
 * 效果：当用户在个人中心的不同子页面之间切换时（如从"个人资料"切换到"消费历史"），
 * 使用 replace 会替换当前历史记录，而不是添加新的记录。
 * 这样当用户点击浏览器返回按钮时，会直接返回到首页，而不是上一个子页面。
 */
const handleMenuSelect = (index: string) => {
  // 如果当前已经在个人中心的某个子页面，使用 replace 跳转
  if (route.path.startsWith('/user/')) {
    router.replace(index)
  } else {
    // 如果是从其他页面进入个人中心，使用 push 正常跳转
    router.push(index)
  }
}

/**
 * 退出登录
 * 清除用户状态并跳转到登录页
 */
const handleLogout = () => {
  userStore.userLogout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.user-layout {
  height: 100vh;
  background-color: var(--bg-primary);
}

.sidebar {
  background-color: var(--bg-card);
  height: 100vh;
  border-right: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
  border-bottom: 1px solid var(--border-light);
}

.logo:hover {
  background-color: var(--bg-hover);
}

.logo-text {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-color);
  letter-spacing: 2px;
}

.sidebar-menu {
  border-right: none;
  background-color: transparent;
  padding-top: var(--spacing-md);
}

.sidebar-menu :deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  color: var(--text-secondary);
  margin: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: all 0.3s;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: var(--bg-hover);
  color: var(--primary-color);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: var(--primary-color);
  color: white;
}

.sidebar-menu :deep(.el-menu-item.is-active:hover) {
  background-color: var(--primary-dark);
}

.header {
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: var(--bg-hover);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-light);
  flex-shrink: 0;
}

.username {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  font-weight: 500;
}

.logout-btn {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all 0.3s;
}

.logout-btn:hover {
  color: var(--error-color);
  background-color: var(--bg-hover);
}

.main-content {
  background-color: var(--bg-primary);
  padding: var(--spacing-xl);
  overflow-y: auto;
}
</style>

