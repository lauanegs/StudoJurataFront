import { formatarDataHora } from './format'
import type { SimuladoResponse } from '../types/simulados'

export interface DisponibilidadeSimulado {
  indisponivel: boolean
  /** Não abre mais: simulado encerrado ou prazo vencido (diferente de "ainda vai abrir"). */
  encerrado?: boolean
  motivo?: string
}

/** Fora da janela de datas (ou encerrado) o simulado não pode ser iniciado. */
export function disponibilidadeDoSimulado(simulado?: SimuladoResponse, agora = Date.now()): DisponibilidadeSimulado {
  if (!simulado) return { indisponivel: true, motivo: 'Simulado indisponível' }

  if (simulado.status === 'ENCERRADO') return { indisponivel: true, encerrado: true, motivo: 'Encerrado' }

  if (simulado.dataInicio && new Date(simulado.dataInicio).getTime() > agora) {
    return { indisponivel: true, motivo: `Abre em ${formatarDataHora(simulado.dataInicio)}` }
  }

  if (simulado.dataFim && new Date(simulado.dataFim).getTime() < agora) {
    return { indisponivel: true, encerrado: true, motivo: 'Prazo encerrado' }
  }

  return { indisponivel: false }
}
