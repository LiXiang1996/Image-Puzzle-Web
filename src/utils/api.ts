/**
 * API 工具函数
 * 提供统一的 API URL 处理函数
 */

/**
 * 获取完整的 API 基础 URL
 * 根据环境变量返回对应的 API 基础地址
 * 
 * 开发环境：返回空字符串（使用 Vite 代理）
 * 生产环境：返回完整的 Vercel 域名
 */
export const getApiBaseUrl = (): string => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  // 如果 baseUrl 是完整 URL（包含 http:// 或 https://），直接返回
  // 如果是相对路径（以 / 开头），返回空字符串（使用相对路径）
  if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
    return baseUrl.replace(/\/api$/, '') // 移除末尾的 /api，因为 request.ts 中已经添加了
  }
  return '' // 开发环境使用相对路径，通过 Vite 代理
}

/**
 * 将相对路径转换为完整的 URL
 * 用于处理头像等静态资源的 URL
 * 
 * @param path 相对路径（如 /uploads/avatars/xxx.jpg）
 * @returns 完整的 URL
 */
export const getFullUrl = (path: string): string => {
  if (!path) return ''
  
  // 如果已经是完整 URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  // 获取 API 基础 URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  
  // 如果是完整 URL（生产环境）
  if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
    const base = baseUrl.replace(/\/api$/, '') // 移除末尾的 /api
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`
  }
  
  // 开发环境：使用相对路径（通过 Vite 代理）
  return path.startsWith('/') ? path : `/${path}`
}

