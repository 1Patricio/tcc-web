import { useApi } from "@/composables/useApi"
import { createBaseService } from "./base.service"

export function useArquivoService(resource?: any) {
  const api = useApi()

  const baseService = createBaseService('/arquivos')

  async function getAllByPasta(pastaId: string) {
    try {
      const response = await api.get(`/arquivos/${pastaId}`, { data: resource })
      return response.data
    } catch (error) {
      throw error
    }
  }

  async function upload(pastaId: string, file: File) {
    const formData = new FormData()
    formData.append('pastaId', pastaId)
    formData.append('file', file)

    const response = await api.post('/arquivos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }


  return {
    ...baseService,
    getAllByPasta,
    upload
  }
}