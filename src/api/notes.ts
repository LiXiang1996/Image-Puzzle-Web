/**
 * 笔记相关API接口
 */
import request from './request'
import type {
  NoteListResponse,
  NoteDetailResponse,
  CreateNoteRequest,
  UpdateNoteRequest,
  DiscoverListResponse,
} from '@/types/note'

/**
 * 获取我的笔记列表
 * @param params 查询参数
 */
export const getNotes = (params?: {
  page?: number
  page_size?: number
  search?: string
  status?: 'private' | 'public' | 'draft' | 'all'
}) => {
  return request.get<NoteListResponse>('/notes', { params })
}

/**
 * 获取笔记详情
 * @param noteId 笔记ID
 */
export const getNoteById = (noteId: string) => {
  return request.get<NoteDetailResponse>(`/notes/${noteId}`)
}

/**
 * 创建新笔记
 * @param data 笔记数据
 */
export const createNote = (data: CreateNoteRequest) => {
  return request.post<NoteDetailResponse>('/notes', data)
}

/**
 * 更新笔记
 * @param noteId 笔记ID
 * @param data 更新数据
 */
export const updateNote = (noteId: string, data: UpdateNoteRequest) => {
  return request.put<NoteDetailResponse>(`/notes/${noteId}`, data)
}

/**
 * 删除笔记
 * @param noteId 笔记ID
 */
export const deleteNote = (noteId: string) => {
  return request.delete<{ code: number; message: string; data: {} }>(`/notes/${noteId}`)
}

/**
 * 发布笔记（私密→公开）
 * @param noteId 笔记ID
 */
export const publishNote = (noteId: string) => {
  return request.put<NoteDetailResponse>(`/notes/${noteId}/publish`)
}

/**
 * 存为草稿（公开→私密）
 * @param noteId 笔记ID
 */
export const saveAsDraft = (noteId: string) => {
  return request.put<NoteDetailResponse>(`/notes/${noteId}/draft`)
}

/**
 * 自动保存笔记（只更新内容，不改变状态）
 * @param noteId 笔记ID
 * @param content 笔记内容
 */
export const autoSaveNote = (noteId: string, content: string) => {
  return request.put<NoteDetailResponse>(`/notes/${noteId}/autosave`, { content })
}

/**
 * 获取发现广场列表（公开文章）
 * @param params 查询参数
 */
export const getDiscoverNotes = (params?: {
  page?: number
  page_size?: number
}) => {
  return request.get<DiscoverListResponse>('/discover', { params })
}

/**
 * 获取公开笔记详情
 * @param noteId 笔记ID
 */
export const getPublicNoteById = (noteId: string) => {
  return request.get<NoteDetailResponse>(`/discover/${noteId}`)
}

/**
 * 获取用户公开文章列表
 * @param userId 用户ID
 * @param params 查询参数
 */
export const getUserPublicNotes = (
  userId: string,
  params?: {
    page?: number
    page_size?: number
  }
) => {
  return request.get<DiscoverListResponse>(`/users/${userId}/notes`, { params })
}

