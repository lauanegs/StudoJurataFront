import type { EntidadeBase } from '@/dominios/comum/types'
import type { Usuario } from '@/dominios/pessoas/types'

export interface Evento extends EntidadeBase {
  titulo: string
  descricao?: string
  dataHorario: string
  concluido: boolean
  criadoPor?: Usuario | null
}

export interface DadosEvento {
  dataHorario: string
  titulo: string
  descricao: string
  concluido: boolean
}
