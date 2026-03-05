import { createBaseService } from "./base.service"

export function usePastaService() {
  const baseService = createBaseService('/pastas')

  return {
    ...baseService
  }
}