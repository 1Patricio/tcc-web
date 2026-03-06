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

  return {
    ...baseService,
    getAllByPasta
  }
}