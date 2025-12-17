/**
 * Auth types and utilities for API authentication
 */

export interface AuthUser {
  id: string
  name: string
  email: string
  phone?: string
  status?: string
  role?: string
  created_at?: string
}

export interface LoginResponse {
  accessToken: string
  user: AuthUser
}

export interface RegisterResponse {
  message: string
  accessToken: string
  user: AuthUser
}

export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  status: string
  role: string
  created_at: string
  updated_at: string
}

// Re-export User type for compatibility
export type User = UserProfile
