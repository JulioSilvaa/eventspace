/**
 * Centralized API Client for Lazer Marketplace API
 * Handles all REST API communication with the backend
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
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
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

    // Add authorization header if we have a token
    const token = this.getToken()
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Always include cookies
      })

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && !endpoint.includes('/auth/refresh')) {
        const refreshed = await this.refreshToken()
        if (refreshed) {
          // Retry the request with new token
          return this.request<T>(endpoint, options)
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
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()

    files.forEach((file) => {
      formData.append('images', file)
    })

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, String(value))
        }
      })
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

    // Add authorization header if we have a token
    const getHeaders = (): Record<string, string> => {
      const token = this.getToken()
      return token ? { Authorization: `Bearer ${token}` } : {}
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: formData,
        credentials: 'include', // Always include cookies
      })

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && !endpoint.includes('/auth/refresh')) {
        const refreshed = await this.refreshToken()
        if (refreshed) {
          // Retry the request with new token
          return this.uploadFiles<T>(endpoint, files, additionalData)
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          error: {
            message: errorData.message || errorData.error || 'Upload failed',
            status: response.status,
            code: errorData.code,
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
