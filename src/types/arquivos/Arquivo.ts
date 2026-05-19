import type { Pasta } from "../pastas/Pasta";

export interface Arquivo {
  id: string,
  nome: string,
  nomeFisico: string,
  url: string,
  pastaId: string,
  createdAt: string,
  pasta?: Pasta,
}
