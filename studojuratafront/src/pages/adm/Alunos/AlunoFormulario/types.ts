import type { Parentesco } from '@/types/pessoas'

export interface VinculoForm {
  /** Id do ResponsavelAluno quando o vínculo já existe no back. */
  id?: number
  chave: string
  responsavelId: number
  parentesco: Parentesco
}
