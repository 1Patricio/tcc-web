import axios from 'axios'
import { useNotification } from './useNotification'

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
      // Ações que alteram dado (criar/editar/excluir/login) já mostram sua própria
      // mensagem de erro na tela; o aviso genérico aqui é só para leituras (GET).
      const method = error.config?.method?.toLowerCase()
      if (method === 'get') {
        const message =
          error.response?.data?.message || 'Ocorreu um erro inesperado. Tente novamente.'
        useNotification().error(message)
      }
      return Promise.reject(error)
    }
  )

  return apiClient
}