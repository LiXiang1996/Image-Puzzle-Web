/**
 * 互动相关API接口（喜爱、收藏、评论）
 */
import request from './request'
import type {
  LikeResponse,
  FavoriteResponse,
  FavoriteListResponse,
  CommentListResponse,
  CreateCommentRequest,
  CreateCommentResponse,
} from '@/types/interaction'

/**
 * 点赞/取消点赞
 * @param noteId 笔记ID
 */
export const toggleLike = (noteId: string) => {
  return request.post<LikeResponse['data']>(`/notes/${noteId}/like`)
}

/**
 * 获取笔记点赞数和当前用户点赞状态
 * @param noteId 笔记ID
 */
export const getLikeCount = (noteId: string) => {
  return request.get<LikeResponse['data']>(`/notes/${noteId}/likes`)
}

/**
 * 收藏/取消收藏
 * @param noteId 笔记ID
 */
export const toggleFavorite = (noteId: string) => {
  return request.post<FavoriteResponse['data']>(`/notes/${noteId}/favorite`)
}

/**
 * 获取笔记收藏数和当前用户收藏状态
 * @param noteId 笔记ID
 */
export const getFavoriteCount = (noteId: string) => {
  return request.get<FavoriteResponse['data']>(`/notes/${noteId}/favorites`)
}

/**
 * 获取当前用户的收藏列表
 * @param params 查询参数
 */
export const getUserFavorites = (params?: {
  page?: number
  page_size?: number
}) => {
  return request.get<FavoriteListResponse['data']>('/user/favorites', { params })
}

/**
 * 创建评论
 * @param noteId 笔记ID
 * @param data 评论数据
 */
export const createComment = (noteId: string, data: CreateCommentRequest) => {
  return request.post<CreateCommentResponse['data']>(`/notes/${noteId}/comments`, data)
}

/**
 * 获取笔记评论列表
 * @param noteId 笔记ID
 */
export const getComments = (noteId: string) => {
  return request.get<CommentListResponse['data']>(`/notes/${noteId}/comments`)
}

/**
 * 删除评论
 * @param commentId 评论ID
 */
export const deleteComment = (commentId: string | number) => {
  return request.delete<{ code: number; message: string; data: {} }>(`/comments/${commentId}`)
}

