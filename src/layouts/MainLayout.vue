<template>
  <div class="main-layout">
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <h2 class="logo">图片积木</h2>
          <el-button 
            type="text" 
            class="vip-button"
            @click="router.push('/home/membership')"
          >
            <img src="@/assets/vip.png" alt="VIP" class="vip-icon" />
            <span class="vip-text">获取会员</span>
          </el-button>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <!-- 用户头像 -->
              <img 
                :src="avatarUrl" 
                alt="头像" 
                class="user-avatar"
                @error="handleAvatarError"
              />
              <!-- 用户昵称或用户名 -->
              <span>{{ displayName }}</span>
              <el-icon class="el-icon--right"><CaretBottom /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
 * 主布局组件
 * 用于首页（创作中心）的布局，包含顶部导航栏和主内容区域
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
 * 如果用户设置了头像，使用用户头像；否则使用默认头像
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
 * 如果用户头像加载失败，使用默认头像
 */
const handleAvatarError = () => {
  avatarError.value = true
}

/**
 * 处理下拉菜单命令
 * @param command 命令类型：'profile' 跳转到个人中心，'logout' 退出登录
 */
const handleCommand = (command: string) => {
  if (command === 'profile') {
    router.push('/user/profile')
  } else if (command === 'logout') {
    userStore.userLogout()
    ElMessage.success('已退出登录')
    router.push('/login')
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.header {
  background-color: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  margin-right: 16px;
}

.vip-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.3s;
  color: #f56c6c;
  font-weight: 500;
}

.vip-button:hover {
  background-color: #fef0f0;
  color: #f56c6c;
}

.vip-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.vip-text {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
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

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e4e7ed;
  flex-shrink: 0;
}

.main-content {
  background-color: #f0f2f5;
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100vh - 60px);
}
</style>

