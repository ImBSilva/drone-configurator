import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('drone-auth-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('drone-auth-token')
      localStorage.removeItem('drone-auth-user')
      localStorage.removeItem('drone-auth-email')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export function login(email, password) {
  return api.post('/api/auth/login', { email, password })
}

export function register(data) {
  return api.post('/api/auth/register', data)
}

export function getMe() {
  return api.get('/api/auth/me')
}

export function updateProfile(data) {
  return api.put('/api/auth/profile', data)
}

export function updatePassword(data) {
  return api.put('/api/auth/password', data)
}

export function getConfigs() {
  return api.get('/api/drones')
}

export function createConfig(data) {
  return api.post('/api/drones', data)
}

export function getConfigById(id) {
  return api.get(`/api/drones/${id}`)
}

export function updateConfig(id, data) {
  return api.put(`/api/drones/${id}`, data)
}

export function deleteConfig(id) {
  return api.delete(`/api/drones/${id}`)
}

export default api
