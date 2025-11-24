export interface UserInfo {
  id: string
  username: string
  email: string
  avatar?: string
  nickname?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends UserInfo {
  bio?: string
  location?: string
  website?: string
}

