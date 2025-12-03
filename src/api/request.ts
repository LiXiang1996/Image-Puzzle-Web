/**
 * Axios 请求封装
 * 统一处理 HTTP 请求的配置、拦截和错误处理
 */
import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/stores/user'

/**
 * 创建 axios 实例
 * 配置基础 URL、超时时间和默认请求头
 */
/**
 * 获取 API 基础 URL
 * 开发环境：使用 /api（通过 Vite 代理到 localhost:8080）
 * 生产环境：使用环境变量中的完整 URL（如 https://image-puzzle-server.vercel.app/api）
 */
const getBaseURL = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  if (envUrl && (envUrl.startsWith('http://') || envUrl.startsWith('https://'))) {
    // 生产环境：使用完整的 URL
    return envUrl
  }
  // 开发环境：使用相对路径，通过 Vite 代理
  return '/api'
}

const service: AxiosInstance = axios.create({
  baseURL: getBaseURL(), // API 基础路径
  timeout: 10000, // 请求超时时间 10 秒
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
})

// 封装请求方法，返回类型为 T（拦截器已经提取了 data 字段）
const apiRequest = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return service.get<T>(url, config) as Promise<T>
  },
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return service.post<T>(url, data, config) as Promise<T>
  },
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return service.put<T>(url, data, config) as Promise<T>
  },
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return service.delete<T>(url, config) as Promise<T>
  },
}

/**
 * 请求拦截器
 * 在发送请求前执行，用于：
 * 1. 自动添加认证 token 到请求头
 */
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从本地存储获取 token
    const token = localStorage.getItem('token')
    
    // 只对 POST/PUT/DELETE 操作进行认证检查（GET 请求允许未登录用户访问）
    // 需要认证的操作接口：
    // - POST /notes/{id}/like - 点赞/取消点赞
    // - POST /notes/{id}/favorite - 收藏/取消收藏
    // - POST /notes/{id}/comments - 发表评论
    // - DELETE /comments/{id} - 删除评论
    // - POST /user/* - 用户相关操作
    const isWriteOperation = config.method && ['post', 'put', 'delete'].includes(config.method.toLowerCase())
    const requiresAuth = isWriteOperation && config.url && (
      config.url.includes('/like') ||
      config.url.includes('/favorite') ||
      (config.url.includes('/comments') && config.method?.toLowerCase() === 'post') ||
      config.url.includes('/user/') ||
      (config.url.includes('/notes/') && isWriteOperation)
    )
    
    // 如果是需要认证的写操作但没有 token，直接阻止请求并跳转登录
    if (requiresAuth && !token) {
      ElMessage.warning('请先登录')
      const userStore = useUserStore()
      userStore.userLogout()
      router.push({
        path: '/login',
        query: { redirect: router.currentRoute.value.fullPath }
      })
      return Promise.reject(new Error('未授权，请先登录'))
    }
    
    // 如果有 token，添加到请求头（GET 请求也可以带 token，用于获取用户特定的状态）
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 如果是FormData（文件上传），不设置Content-Type，让浏览器自动设置
    // 这样浏览器会自动添加boundary参数
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type']
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * 在接收到响应后执行，用于：
 * 1. 统一处理响应数据格式
 * 2. 处理错误状态码（如 401 未授权）
 * 3. 统一错误提示
 */
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data

    // 检查业务状态码，如果不是 200 则视为错误
    if (res && typeof res === 'object' && 'code' in res && res.code !== 200) {
      ElMessage.error((res as any).message || '请求失败')
      
      // 401: 未授权，清除本地认证信息并跳转到登录页
      if (res.code === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        router.push('/login')
      }
      
      return Promise.reject(new Error((res as any).message || '请求失败'))
    }
    
    // 如果响应数据有 data 属性，返回 data，否则返回整个响应
    // 这样可以统一处理不同的 API 响应格式
    return (res && typeof res === 'object' && 'data' in res) ? (res as any).data : res
  },
  (error: any) => {
    // 处理 HTTP 错误状态码
    if (error.response) {
      const status = error.response.status
      const data = error.response.data
      
      // 401: 未授权，清除本地认证信息并跳转到登录页
      if (status === 401) {
        // 清除本地存储
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        
        // 清除 store 中的状态
        const userStore = useUserStore()
        userStore.userLogout()
        
        ElMessage.warning('请先登录')
        
        // 确保跳转到登录页，而不是首页
        const currentPath = router.currentRoute.value.fullPath
        router.push({
          path: '/login',
          query: { redirect: currentPath }
        })
        
        return Promise.reject(new Error('未授权，请先登录'))
      }
      
      // 其他错误状态码
      const errorMessage = data?.detail || data?.message || error.message || '请求失败'
      ElMessage.error(errorMessage)
      return Promise.reject(new Error(errorMessage))
    }
    
    // 处理网络错误或其他异常
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

// 导出封装后的请求方法
export default apiRequest

