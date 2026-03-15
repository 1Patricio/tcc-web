import axios from 'axios'

export function useOpenAI() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  const baseURL = import.meta.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1'

  const apiClient = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}` 
    }
  })

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('Erro OpenAI:', error.response?.data || error.message)
      return Promise.reject(error)
    }
  )

  return { apiClient }
}