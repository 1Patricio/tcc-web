import axios from 'axios'
export function useApi(baseUrl?: string) {

  const apiBaseUrl = baseUrl || import.meta.env.VITE_API_BASE_URL
  const TOKEN = 'token'

  const apiClient = axios.create({
    baseURL: apiBaseUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  })

  apiClient.interceptors.request.use(
    async (config) => {
      const token = localStorage.getItem(TOKEN)

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      if (config.data instanceof FormData) {
        delete config.headers['Content-Type']
      }

      return config
    },
    (error) => Promise.reject(error)
  )

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('Erro na requisição:', error.response?.data || error.message)
      return Promise.reject(error)
    }
  )

  return apiClient
}