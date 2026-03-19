import { useApi } from "@/composables/useApi"
import { createBaseService } from "./base.service"

export function useJurisprudenciaService(resource?: any) {
  const api = useApi()

  const baseService = createBaseService('/jurisprudencias')

  async function getAllByProcesso(processoId: string) {
    try {
      const response = await api.get(`/jurisprudencias/${processoId}`, { data: resource })
      return response.data
    } catch (error) {
      throw error
    }
  }

  async function getAll() {
    try {
      const response = await api.get(`/jurisprudencias`, { data: resource })
      return response.data
    } catch (error) {
      throw error
    }
  }

  async function buscaRs(termo: string, conteudoBusca: string) {
    try {
      const response = await api.post("/busca-rs", {
        termo: termo,
        conteudoBusca: conteudoBusca
      })

      return response.data.response
    } catch (error) {
      throw error
    }
  }


  return {
    ...baseService,
    getAllByProcesso,
    buscaRs
  }
}