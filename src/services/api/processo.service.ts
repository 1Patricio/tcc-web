import { createBaseService } from "./base.service"

export function useProcessoService() {
  const baseService = createBaseService('/processos')

  return {
    ...baseService
  }
}