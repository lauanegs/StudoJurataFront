import type { EntidadeBase } from './comum'
import type { Usuario } from './pessoas'

export interface Evento extends EntidadeBase {
  titulo: string
  descricao?: string
  /** LocalDateTime — enviar/receber como "YYYY-MM-DDTHH:mm:ss". */
  dataHorario: string
  concluido: boolean
  criadoPor?: Usuario | null
}
