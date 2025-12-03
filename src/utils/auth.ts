/**
 * 认证相关工具函数
 */
import { useUserStore } from '@/stores/user'
import router from '@/router'
import { ElMessage } from 'element-plus'

/**
 * 检查用户是否已登录
 * 如果未登录，显示提示并跳转到登录页
 * @param action 操作名称（如"点赞"、"评论"、"收藏"）
 * @returns 是否已登录
 */
export function checkAuth(action: string = '操作'): boolean {
  const userStore = useUserStore()
  
  // 检查 token 是否存在（从 localStorage 和 store 双重检查）
  const token = localStorage.getItem('token') || userStore.token
  
  if (!token || !userStore.isAuthenticated) {
    ElMessage.warning(`请先登录后再${action}`)
    // 清除可能存在的无效 token
    userStore.userLogout()
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return false
  }
  return true
}

