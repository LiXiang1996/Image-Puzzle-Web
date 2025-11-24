/**
 * 作品相关 API
 * 处理用户作品的 CRUD 操作
 */
import request from './request'
import type { Work } from '@/types/work'

/**
 * 获取作品列表
 * @param params 查询参数（可选的分页参数）
 * @returns 作品列表
 */
export const getWorks = (params?: { page?: number; pageSize?: number }) => {
  // 后端使用 page_size，需要转换参数名
  const backendParams = params ? {
    page: params.page,
    page_size: params.pageSize
  } : undefined
  return request.get<Work[]>('/works', { params: backendParams })
}

/**
 * 获取单个作品详情
 * @param id 作品 ID
 * @returns 作品详情
 */
export const getWorkById = (id: string) => {
  return request.get<Work>(`/works/${id}`)
}

/**
 * 创建新作品
 * @param data 作品数据（部分字段）
 * @returns 创建的作品
 */
export const createWork = (data: Partial<Work>) => {
  return request.post<Work>('/works', data)
}

/**
 * 更新作品
 * @param id 作品 ID
 * @param data 要更新的作品数据
 * @returns 更新后的作品
 */
export const updateWork = (id: string, data: Partial<Work>) => {
  return request.put<Work>(`/works/${id}`, data)
}

/**
 * 删除作品
 * @param id 作品 ID
 * @returns 删除响应
 */
export const deleteWork = (id: string) => {
  return request.delete(`/works/${id}`)
}

