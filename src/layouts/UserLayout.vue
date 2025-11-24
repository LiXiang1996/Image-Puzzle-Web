<template>
  <div class="user-layout">
    <el-container>
      <el-aside width="200px" class="sidebar">
        <div class="logo" @click="handleLogoClick">图片积木</div>
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409eff"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/user/profile">
            <el-icon><User /></el-icon>
            <span>个人资料</span>
          </el-menu-item>
          <el-menu-item index="/user/consumption">
            <el-icon><Money /></el-icon>
            <span>消费历史</span>
          </el-menu-item>
          <el-menu-item index="/user/works">
            <el-icon><Picture /></el-icon>
            <span>我的作品</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="header">
          <div class="header-right">
            <span>{{ userStore.userInfo?.username }}</span>
            <el-button type="text" @click="handleLogout">退出登录</el-button>
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
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { User, Money, Picture } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 计算当前激活的菜单项（根据当前路由路径）
const activeMenu = computed(() => route.path)

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
}

.sidebar {
  background-color: #304156;
  height: 100vh;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logo:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar-menu {
  border-right: none;
}

.header {
  background-color: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>

