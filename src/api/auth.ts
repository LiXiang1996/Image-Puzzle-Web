/**
 * 认证相关 API
 * 处理用户登录、注册、获取用户信息等认证相关接口
 */
import request from './request'

/**
 * 登录参数接口
 */
export interface LoginParams {
  username: string
  password: string
}

/**
 * 注册参数接口
 */
export interface RegisterParams {
  username: string
  password: string
  email: string
}

/**
 * 登录响应接口
 */
export interface LoginResponse {
  token: string
  userInfo: {
    id: string
    username: string
    email: string
    avatar?: string
  }
}

/**
 * 用户登录
 * @param data 登录参数（用户名和密码）
 * @returns 登录响应（包含 token 和用户信息）
 */
export const login = (data: LoginParams) => {
  return request.post<LoginResponse>('/auth/login', data)
}

/**
 * 用户注册
 * @param data 注册参数（用户名、密码、邮箱）
 * @returns 注册响应
 */
export const register = (data: RegisterParams) => {
  return request.post('/auth/register', data)
}

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export const getUserInfo = () => {
  return request.get('/auth/user')
}

/**
 * 更新用户信息参数接口
 */
export interface UpdateUserParams {
  email?: string
  nickname?: string
  phone?: string
  bio?: string
  location?: string
  website?: string
}

/**
 * 更新用户信息响应接口
 */
export interface UpdateUserResponse {
  id: string
  username: string
  email?: string
  nickname?: string
  avatar?: string
  phone?: string
  bio?: string
  location?: string
  website?: string
  createdAt: string
  updatedAt: string
}

/**
 * 上传头像响应接口
 */
export interface UploadAvatarResponse {
  code: number
  message: string
  data: {
    avatar: string
    url?: string
  }
}

/**
 * 更新用户信息
 * @param data 要更新的用户信息
 * @returns 更新后的用户信息
 */
export const updateUserInfo = (data: UpdateUserParams) => {
  return request.put<UpdateUserResponse>('/auth/user', data)
}

/**
 * 上传用户头像
 * @param file 图片文件
 * @returns 上传结果（包含图片URL）
 */
export const uploadAvatar = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  // 不设置Content-Type，让浏览器自动设置（包含boundary）
  // request拦截器会自动处理FormData
  return request.post<UploadAvatarResponse['data']>('/auth/upload-avatar', formData)
}

/**
 * 退出登录
 * @returns 退出登录响应
 */
export const logout = () => {
  return request.post('/auth/logout')
}

