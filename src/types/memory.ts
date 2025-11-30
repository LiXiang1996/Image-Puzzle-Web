/**
 * 回忆瞬间相关类型定义
 */

/**
 * 回忆瞬间项
 */
export interface MemoryMomentItem {
  id: string
  user_id: string
  image_url: string
  description?: string
  created_at: string
  author: {
    id: string
    nickname: string
    avatar?: string
  }
  like_count: number
  is_liked: boolean
}

/**
 * 回忆瞬间列表响应
 */
export interface MemoryMomentListResponse {
  code: number
  message: string
  data: {
    list: MemoryMomentItem[]
    total: number
    page: number
    page_size: number
  }
}

/**
 * 创建回忆瞬间请求
 */
export interface CreateMemoryMomentRequest {
  image_url: string
  description?: string
}

/**
 * 创建回忆瞬间响应
 */
export interface CreateMemoryMomentResponse {
  code: number
  message: string
  data: MemoryMomentItem
}

/**
 * 上传图片响应
 */
export interface UploadImageResponse {
  code: number
  message: string
  data: {
    url: string
    image?: string
  }
}

