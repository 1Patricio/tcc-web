import type { TipoClienteEnum } from "./TipoClienteEnum";

export interface Cliente {
  id: string,
  nome: string,
  email?: string,
  telefone?: string,
  tipoCliente: TipoClienteEnum,
  status: boolean,
  observacoes?: string,
}
