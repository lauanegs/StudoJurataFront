import type { Parentesco } from '@/dominios/pessoas/types'

export interface VinculoForm {
  id?: number
  chave: string
  responsavelId: number
  parentesco: Parentesco
}
