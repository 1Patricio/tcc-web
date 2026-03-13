import { createBaseService } from "./base.service"

export function usePeticaoService() {
  const baseService = createBaseService('/peticoes')

  return {
    ...baseService
  }
}