const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth-token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      "Content-Type": "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(email: string, password: string, name: string) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    })
  }

  // IPO methods
  async getIPOs(filters?: any) {
    const params = new URLSearchParams(filters)
    return this.request(`/ipos?${params}`)
  }

  async getIPOById(id: string) {
    return this.request(`/ipos/${id}`)
  }

  // Partnership methods
  async createPartnership(data: any) {
    return this.request("/partnerships", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getPartnerships() {
    return this.request("/partnerships")
  }

  // Analytics methods
  async getAnalytics(type: string, period: string) {
    return this.request(`/analytics/${type}?period=${period}`)
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth-token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-token")
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
