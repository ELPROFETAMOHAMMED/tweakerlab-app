export interface User {
  id: string
  email: string
  full_name: string
  avatar_url: string
  role: 'user' | 'admin'
  has_scanned_pc: boolean
  created_at: string
  updated_at: string
}

export interface AuthSession {
  user: User | null
  access_token: string | null
}

export interface CachedSession {
  user: User | null
  timestamp: number
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
  avatar: File
}

export interface LoginData {
  email: string
  password: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface AuthResponse {
  success: boolean
  error?: string
}

export interface SessionData {
  user: User
  needsVerification?: boolean
}
