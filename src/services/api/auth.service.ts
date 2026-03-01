import { useApi } from "@/composables/useApi";

export function useAuthService() {
  const api = useApi();

  async function register(data: {
    nome: string;
    email: string;
    password: string;
  }) {
    const response = await api.post("/auth/register", data);
    return response.data;
  }

  async function login(data: {
    email: string;
    password: string;
  }) {
    const response = await api.post("/auth/login", data);
    return response.data;
  }

  async function refresh() {
    const response = await api.get("/auth/me");
    return response.data;
  }

  return {
    register,
    login,
    refresh
  };
}