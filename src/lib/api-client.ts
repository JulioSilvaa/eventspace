/**
 * Centralized API Client for Marketplace API
 * Replaces Supabase client with REST API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

interface ApiError {
  message: string
  status?: number
  code?: string
}

interface ApiResponse<T> {
  data?: T
  error?: ApiError
}

class ApiClient {
  private accessToken: string | null = null

  /**
   * Set the access token for authenticated requests
   */
  setToken(token: string): void {
    this.accessToken = token
    // Persist token for page refreshes
    localStorage.setItem('accessToken', token)
  }

  /**
   * Clear the access token (logout)
   */
  clearToken(): void {
    this.accessToken = null
    localStorage.removeItem('accessToken')
  }

  /**
   * Get current access token
   */
  getToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('accessToken')
    }
    return this.accessToken
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  /**
   * Refresh access token using httpOnly cookie
   */
  async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        this.clearToken()
        return false
      }

      const data = await response.json()
      if (data.accessToken) {
        this.setToken(data.accessToken)
        return true
      }

      return false
    } catch (error) {
      console.error('Error refreshing token:', error)
      this.clearToken()
      return false
    }
  }

  /**
   * Generic request method with auth and error handling
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    const token = this.getToken()
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
      })

      // If unauthorized, try to refresh token and retry
      if (response.status === 401 && token) {
        const refreshed = await this.refreshToken()
        if (refreshed) {
          const newToken = this.getToken()
          if (newToken) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`
          }
          response = await fetch(url, {
            ...options,
            headers,
          })
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          error: {
            message: errorData.message || errorData.error || `Request failed with status ${response.status}`,
            status: response.status,
            code: errorData.code,
          },
        }
      }

      // Handle empty responses
      const text = await response.text()
      if (!text) {
        return { data: {} as T }
      }

      const data = JSON.parse(text) as T
      return { data }
    } catch (error) {
      console.error('API request error:', error)
      return {
        error: {
          message: error instanceof Error ? error.message : 'Network error',
        },
      }
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> {
    let url = endpoint
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url = `${endpoint}?${queryString}`
      }
    }
    return this.request<T>(url, { method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  /**
   * Upload files (multipart/form-data)
   */
  async uploadFiles<T>(
    endpoint: string,
    files: File[],
    additionalData?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()

    files.forEach((file) => {
      formData.append('images', file)
    })

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    const url = `${API_BASE_URL}${endpoint}`
    const token = this.getToken()

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          error: {
            message: errorData.message || errorData.error || 'Upload failed',
            status: response.status,
          },
        }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      console.error('Upload error:', error)
      return {
        error: {
          message: error instanceof Error ? error.message : 'Upload failed',
        },
      }
    }
  }
}

// Singleton instance
export const apiClient = new ApiClient()

// Export types
export type { ApiError, ApiResponse }
