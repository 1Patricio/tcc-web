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

  async function buscaRs(termo: string, tipoConsulta: string = "Inteiro Teor") {
    try {
      const response = await api.post("/busca-rs", {
        termo,
        tipoConsulta
      })

      return response.data
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