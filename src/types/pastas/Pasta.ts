import type { Arquivo } from "../arquivos/Arquivo";

export interface Pasta {
  id: string,
  nome: string,
  dataUltimaModificacao?: Date,
  arquivos?: Arquivo[],
  status: boolean,
}
