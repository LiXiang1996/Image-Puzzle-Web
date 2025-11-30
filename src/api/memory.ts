/**
 * 回忆瞬间相关API接口
 */
import request from './request'
import type {
  MemoryMomentListResponse,
  CreateMemoryMomentRequest,
  CreateMemoryMomentResponse,
  UploadImageResponse,
} from '@/types/memory'

/**
 * 上传回忆瞬间图片（临时存储）
 * @param file 图片文件
 */
export const uploadMemoryImage = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<UploadImageResponse['data']>('/memories/upload-image', formData)
}

/**
 * 发布回忆瞬间
 * @param data 回忆瞬间数据
 */
export const createMemoryMoment = (data: CreateMemoryMomentRequest) => {
  return request.post<CreateMemoryMomentResponse['data']>('/memories', data)
}

/**
 * 获取回忆瞬间列表
 * @param params 查询参数
 */
export const getMemoryMoments = (params?: {
  page?: number
  page_size?: number
}) => {
  return request.get<MemoryMomentListResponse['data']>('/memories', { params })
}

/**
 * 点赞/取消点赞回忆瞬间
 * @param memoryId 回忆瞬间ID
 */
export const toggleMemoryLike = (memoryId: string) => {
  return request.post<{ is_liked: boolean; like_count: number }>(`/memories/${memoryId}/like`)
}

