import { useApi } from "@/composables/useApi";

export function createBaseService(resource: any) {
  const api = useApi()

  async function getAll(params = {}) {
    try {
      const response = await api.get(resource, { params })
      return response.data
    } catch (error) {
      throw error
    }
  }

  async function getTotal(params = {}) {
    const response = await api.get(resource, { params })
    return response.data?.length || 0
  }

  async function getById(id: string | number) {
    const response = await api.get(`${resource}/${id}`)
    return response.data
  }

  async function create(data: any) {
    const response = await api.post(resource, data)
    return response.data
  }

  async function update (id: string | number, data: any) {
    const response = await api.put(`${resource}/${id}`, data)
    return response.data
  }

  async function remove (id: string | number) {
    const response = await api.delete(`${resource}/${id}`)
    return response.data
  }

  return {
    getAll,
    getById,
    create,
    update,
    remove,
    getTotal
  }
}