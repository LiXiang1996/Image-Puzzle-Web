/**
 * 笔记相关类型定义
 */

/**
 * 笔记状态枚举
 */
export type NoteStatus = 'private' | 'public' | 'draft'

/**
 * 笔记项（列表展示）
 */
export interface NoteItem {
  id: string
  title: string
  content_preview?: string // 内容预览（前50字符）
  status: NoteStatus
  updated_at: string // MM-DD HH:MM格式
  created_at: string
}

/**
 * 笔记详情（完整信息）
 */
export interface NoteDetail extends NoteItem {
  content: string // Markdown格式的完整内容
  user_id: string
  published_at?: string // 发布时间（公开时才有）
}

/**
 * 创建笔记请求
 */
export interface CreateNoteRequest {
  title: string
  content: string
  status?: NoteStatus // 默认private
}

/**
 * 更新笔记请求
 */
export interface UpdateNoteRequest {
  title?: string
  content?: string
  status?: NoteStatus
}

/**
 * 笔记列表响应
 */
export interface NoteListResponse {
  code: number
  message: string
  data: {
    list: NoteItem[]
    total: number
    page: number
    page_size: number
  }
}

/**
 * 笔记详情响应
 */
export interface NoteDetailResponse {
  code: number
  message: string
  data: NoteDetail
}

/**
 * 公开笔记项（发现广场）
 */
export interface PublicNoteItem {
  id: string
  title: string
  content_preview: string // 前50字符
  author: {
    id: string
    nickname: string
    avatar?: string
  }
  published_at: string
  created_at: string
}

/**
 * 发现广场列表响应
 */
export interface DiscoverListResponse {
  code: number
  message: string
  data: {
    list: PublicNoteItem[]
    total: number
    page: number
    page_size: number
  }
}

