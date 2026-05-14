import { useApi } from "@/composables/useApi"
import type { TimelineEvento, TimelinePublica, TimelineResumo } from "@/types/timelines/TimelineEvento"

export function useTimelineService() {
  const api = useApi()

  async function resumo(): Promise<TimelineResumo[]> {
    const response = await api.get('/timeline/resumo')
    return response.data
  }

  async function listByProcesso(processoId: string): Promise<TimelineEvento[]> {
    const response = await api.get(`/processos/${processoId}/timeline`)
    return response.data
  }

  async function create(processoId: string, data: Partial<TimelineEvento>): Promise<TimelineEvento> {
    const response = await api.post(`/processos/${processoId}/timeline`, data)
    return response.data
  }

  async function update(id: string, data: Partial<TimelineEvento>): Promise<TimelineEvento> {
    const response = await api.put(`/timeline/${id}`, data)
    return response.data
  }

  async function remove(id: string): Promise<void> {
    await api.delete(`/timeline/${id}`)
  }

  async function getPublic(processoId: string, pin: string): Promise<TimelinePublica> {
    const response = await api.get(`/timeline/publica/${processoId}`, { params: { pin } })
    return response.data
  }

  return { resumo, listByProcesso, create, update, remove, getPublic }
}
