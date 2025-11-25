/**
 * Axios 请求封装
 * 统一处理 HTTP 请求的配置、拦截和错误处理
 */
import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

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

/**
 * 请求拦截器
 * 在发送请求前执行，用于：
 * 1. 自动添加认证 token 到请求头
 */
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从本地存储获取 token 并添加到请求头
    const token = localStorage.getItem('token')
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
  (error) => {
    // 处理网络错误或其他异常
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default service

