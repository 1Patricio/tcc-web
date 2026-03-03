import type { StatusProcessoEnum } from "./StatusProcessoEnum";

export interface Processo {
  id: string,
  numeroProcesso: string,
  clienteId?: string,
  tipoAcaoProcesso?: string,
  status: StatusProcessoEnum,
  vara?: boolean,
  comarca?: string,
  dataDistribuicao?: Date,
  valorCausa?: number
  descricao?: string;
  observacoes?: string
}
