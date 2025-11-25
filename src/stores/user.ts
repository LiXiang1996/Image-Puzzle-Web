/**
 * 用户状态管理 Store
 * 使用 Pinia 管理用户相关的全局状态，包括：
 * - 用户认证信息（token、用户信息）
 * - 登录/注册/退出登录功能
 * - 用户信息的持久化存储
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types/user'
import { login, register, getUserInfo, type LoginResponse } from '@/api/auth'
import { getFullUrl } from '@/utils/api'

export const useUserStore = defineStore('user', () => {
  // 用户认证令牌
  const token = ref<string>('')
  // 用户信息
  const userInfo = ref<UserInfo | null>(null)

  // 计算属性：判断用户是否已登录
  const isAuthenticated = computed(() => !!token.value)

  // 登录 - 调用真实API
  const userLogin = async (username: string, password: string) => {
    try {
      const response = (await login({ username, password })) as unknown as LoginResponse
      token.value = response.token
      userInfo.value = {
        ...response.userInfo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as UserInfo
      
      // 保存到本地存储
      localStorage.setItem('token', response.token)
      localStorage.setItem('userInfo', JSON.stringify(response.userInfo))
      
      return response
    } catch (error) {
      throw error
    }
  }

  // 注册 - 调用真实API
  const userRegister = async (username: string, password: string, email: string) => {
    try {
      const response = await register({ username, password, email })
      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * 退出登录
   * 清空用户状态和本地存储的认证信息
   */
  const userLogout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  /**
   * 获取用户信息
   * 从服务器获取最新的用户信息
   */
  const fetchUserInfo = async () => {
    try {
      const response = (await getUserInfo()) as unknown as UserInfo
      
      // 处理头像URL：如果是相对路径，转换为完整URL
      if (response.avatar) {
        response.avatar = getFullUrl(response.avatar)
      }
      
      userInfo.value = response
      // 更新本地存储
      localStorage.setItem('userInfo', JSON.stringify(response))
      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * 初始化用户信息
   * 应用启动时从本地存储恢复用户登录状态
   * 用于实现刷新页面后保持登录状态
   * 
   * 注意：
   * - Token保存在localStorage中，刷新页面后会自动恢复
   * - 如果token过期或用户不存在，后续API调用会返回401错误
   * - 此时应该清除本地token并跳转到登录页
   */
  const initUserInfo = () => {
    const savedToken = localStorage.getItem('token')
    const savedUserInfo = localStorage.getItem('userInfo')
    
    if (savedToken) {
      token.value = savedToken
      console.log('已从localStorage恢复token')
    }
    
    if (savedUserInfo) {
      try {
        const parsedInfo = JSON.parse(savedUserInfo)
        
        // 处理头像URL：如果是相对路径，转换为完整URL
        if (parsedInfo.avatar) {
          parsedInfo.avatar = getFullUrl(parsedInfo.avatar)
        }
        
        userInfo.value = parsedInfo
        console.log('已从localStorage恢复用户信息')
      } catch (error) {
        console.error('Failed to parse user info from localStorage', error)
        // 解析失败时清除无效数据
        localStorage.removeItem('userInfo')
      }
    }
  }
  
  /**
   * 验证token是否有效
   * 通过调用获取用户信息接口来验证token是否仍然有效
   * 如果token无效，清除本地存储
   */
  const validateToken = async () => {
    if (!token.value) {
      return false
    }
    
    try {
      // 尝试获取用户信息，如果成功说明token有效
      await fetchUserInfo()
      return true
    } catch (error) {
      // token无效，清除本地存储
      console.log('Token验证失败，清除本地存储')
      userLogout()
      return false
    }
  }

  return {
    token,
    userInfo,
    isAuthenticated,
    userLogin,
    userRegister,
    userLogout,
    fetchUserInfo,
    initUserInfo,
    validateToken,
  }
})

