import { getSessionToken } from './supabase'

const API_BASE_URL = 'http://localhost:5555/api'

class ApiClient {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await getSessionToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  async get(endpoint: string) {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }

  async post(endpoint: string, data?: any) {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }

  async put(endpoint: string, data?: any) {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }

  async delete(endpoint: string) {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }
}

export const api = new ApiClient()

// Specific API methods for different resources
export const setsApi = {
  getPublic: () => api.get('/sets/public'),
  getById: (id: string) => api.get(`/sets/${id}`),
  getUserSets: () => api.get('/sets'),
  create: (data: any) => api.post('/sets', data),
  update: (id: string, data: any) => api.put(`/sets/${id}`, data),
  delete: (id: string) => api.delete(`/sets/${id}`),
}

export const cardsApi = {
  getBySet: (setId: string) => api.get(`/cards/set/${setId}`),
  create: (setId: string, data: any) => api.post(`/cards/set/${setId}`, data),
  update: (id: string, data: any) => api.put(`/cards/${id}`, data),
  delete: (id: string) => api.delete(`/cards/${id}`),
  deleteBySet: (setId: string) => api.delete(`/cards/set/${setId}`),
  createMultiple: (data: any) => api.post('/cards/batch', data),
}

export const progressApi = {
  getUserProgress: (userId: string) => api.get(`/progress/${userId}`),
  getSetProgress: (userId: string, setId: string) => api.get(`/progress/${userId}/${setId}`),
  update: (data: any) => api.post('/progress', data),
}

export const testsApi = {
  generate: (data: any) => api.post('/tests/generate', data),
  saveResult: (data: any) => api.post('/tests/save', data),
  getHistory: (userId: string) => api.get(`/tests/history/${userId}`),
}
