import type { Pasta } from "../pastas/Pasta";

export interface Arquivo {
  id: string,
  nome: string,
  pasta?: Pasta,
}
