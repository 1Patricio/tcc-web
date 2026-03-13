import { useOpenAI } from '@/composables/useOpenAIApi'

export class OpenAIService {
  private apiClient

  constructor() {
    const { apiClient } = useOpenAI()
    this.apiClient = apiClient
  }

  async enviarPergunta(pergunta: string) {
    try {
      const response = await this.apiClient.post('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: pergunta,
          },
        ],
      })

      return response.data.choices?.[0]?.message?.content || 'Sem resposta'
    } catch (erro) {
      throw new Error('Erro ao obter resposta da IA')
    }
  }
}

export const openaiService = new OpenAIService()
