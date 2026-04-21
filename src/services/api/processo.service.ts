import { useApi } from "@/composables/useApi"
import { createBaseService } from "./base.service"

export function useProcessoService() {
  const api = useApi()
  const baseService = createBaseService('/processos')

  async function getDashboard(): Promise<{
    stats: { status: string; total: number }[]
    proximosPrazos: any[]
  }> {
    const response = await api.get('/processos/dashboard')
    return response.data
  }

  return {
    ...baseService,
    getDashboard,
  }
}