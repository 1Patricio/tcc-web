import { createBaseService } from "./base.service"

export function useClienteService() {
  const baseService = createBaseService('/clientes')

  return {
    ...baseService
  }
}