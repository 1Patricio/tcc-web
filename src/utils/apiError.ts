export function getApiErrorMessage(error: any, fallback = 'Ocorreu um erro inesperado. Tente novamente.'): string {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.detail ||
    error?.code ||
    error?.message ||
    fallback
  )
}
