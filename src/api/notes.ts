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
  return request.get<NoteListResponse['data']>('/notes', { params })
}

/**
 * 获取笔记详情
 * @param noteId 笔记ID
 */
export const getNoteById = (noteId: string) => {
  return request.get<NoteDetailResponse['data']>(`/notes/${noteId}`)
}

/**
 * 创建新笔记
 * @param data 笔记数据
 */
export const createNote = (data: CreateNoteRequest) => {
  return request.post<NoteDetailResponse['data']>('/notes', data)
}

/**
 * 更新笔记
 * @param noteId 笔记ID
 * @param data 更新数据
 */
export const updateNote = (noteId: string, data: UpdateNoteRequest) => {
  return request.put<NoteDetailResponse['data']>(`/notes/${noteId}`, data)
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
  return request.put<NoteDetailResponse['data']>(`/notes/${noteId}/publish`)
}

/**
 * 存为草稿（公开→私密）
 * @param noteId 笔记ID
 */
export const saveAsDraft = (noteId: string) => {
  return request.put<NoteDetailResponse['data']>(`/notes/${noteId}/draft`)
}

/**
 * 自动保存笔记（只更新内容，不改变状态）
 * @param noteId 笔记ID
 * @param content 笔记内容
 */
export const autoSaveNote = (noteId: string, content: string) => {
  return request.put<NoteDetailResponse['data']>(`/notes/${noteId}/autosave`, { content })
}

/**
 * 获取发现广场列表（公开文章）
 * @param params 查询参数
 */
export const getDiscoverNotes = (params?: {
  page?: number
  page_size?: number
}) => {
  return request.get<DiscoverListResponse['data']>('/discover', { params })
}

/**
 * 获取公开笔记详情
 * @param noteId 笔记ID
 */
export const getPublicNoteById = (noteId: string) => {
  return request.get<NoteDetailResponse['data']>(`/discover/${noteId}`)
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
  return request.get<DiscoverListResponse['data']>(`/users/${userId}/notes`, { params })
}

/**
 * 上传笔记内容中的图片
 * @param file 图片文件
 * @returns 上传结果（包含图片URL）
 */
export const uploadNoteImage = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<{ url: string; image?: string }>('/notes/upload-image', formData)
}
