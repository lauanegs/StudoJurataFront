import type { Parentesco } from '@/dominios/pessoas/types'

export interface VinculoForm {
  /** Id do ResponsavelAluno quando o vínculo já existe no back. */
  id?: number
  chave: string
  responsavelId: number
  parentesco: Parentesco
}
