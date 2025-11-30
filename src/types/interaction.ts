/**
 * 互动相关类型定义（喜爱、收藏、评论）
 */

/**
 * 喜爱（点赞）响应
 */
export interface LikeResponse {
  code: number
  message: string
  data: {
    is_liked: boolean
    like_count: number
  }
}

/**
 * 收藏响应
 */
export interface FavoriteResponse {
  code: number
  message: string
  data: {
    is_favorited: boolean
    favorite_count: number
  }
}

/**
 * 收藏列表项
 */
export interface FavoriteItem {
  id: string
  title: string
  content_preview?: string
  author: {
    id: string
    nickname: string
    avatar?: string
  }
  published_at: string
  created_at: string
  favorited_at: string
}

/**
 * 收藏列表响应
 */
export interface FavoriteListResponse {
  code: number
  message: string
  data: {
    list: FavoriteItem[]
    total: number
    page: number
    page_size: number
  }
}

/**
 * 评论作者信息
 */
export interface CommentAuthor {
  id: string
  nickname: string
  avatar?: string
}

/**
 * 评论项
 */
export interface CommentItem {
  id: string
  user_id: string
  note_id: string
  parent_id: string | null
  content: string
  created_at: string
  author: CommentAuthor
  replies: CommentItem[]  // 嵌套回复
}

/**
 * 评论列表响应
 */
export interface CommentListResponse {
  code: number
  message: string
  data: {
    list: CommentItem[]
    total: number
  }
}

/**
 * 创建评论请求
 */
export interface CreateCommentRequest {
  content: string
  parent_id?: number | null
}

/**
 * 创建评论响应
 */
export interface CreateCommentResponse {
  code: number
  message: string
  data: CommentItem
}

