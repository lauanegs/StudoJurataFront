import type { EntidadeBase } from '@/dominios/comum/types'
import type { Usuario } from '@/dominios/pessoas/types'

export interface Evento extends EntidadeBase {
  titulo: string
  descricao?: string
  /** LocalDateTime — enviar/receber como "YYYY-MM-DDTHH:mm:ss". */
  dataHorario: string
  concluido: boolean
  criadoPor?: Usuario | null
}
