import { useApi } from "@/composables/useApi"
import { createBaseService } from "./base.service"

export function useUsuarioService() {
  const baseService = createBaseService('/usuarios')
  const api = useApi()

  async function changeSenha(id: string, novaSenha: string) {
    const response = await api.patch(`/usuarios/${id}/senha`, { novaSenha })
    return response.data
  }

  return {
    ...baseService,
    changeSenha,
  }
}
