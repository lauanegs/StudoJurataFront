import type { ItemGraficoBarras } from '../../../components/graficos/GraficoBarras'
import type { PontoGraficoLinha } from '../../../components/graficos/GraficoLinha'
import { formatarData } from '../../../utils/format'
import type { TentativaDesempenho, TipoDestinacaoSimulado } from '../../../types/simulados'

export interface DesempenhoSimulado {
  simuladoId: number
  titulo: string
  turmaId: number | null
  turma: string
  disciplinaId: number | null
  disciplina: string
  /** Nota média das tentativas sobre a nota máxima, de 0 a 100. */
  percentual: number
  tentativas: number
  notaMaxima: number
  data?: string
  tipoDestinacao?: TipoDestinacaoSimulado
}

/** Uma linha por simulado, na ordem em que aparecem nas tentativas. */
export function agruparPorSimulado(tentativas: TentativaDesempenho[]): DesempenhoSimulado[] {
  const porSimulado = new Map<number, { primeira: TentativaDesempenho; soma: number; quantidade: number }>()

  for (const tentativa of tentativas) {
    const atual = porSimulado.get(tentativa.simuladoId)
    if (atual) {
      atual.soma += tentativa.nota
      atual.quantidade += 1
    } else {
      porSimulado.set(tentativa.simuladoId, { primeira: tentativa, soma: tentativa.nota, quantidade: 1 })
    }
  }

  return [...porSimulado.values()].map(({ primeira, soma, quantidade }) => ({
    simuladoId: primeira.simuladoId,
    titulo: primeira.simuladoTitulo,
    turmaId: primeira.turmaId,
    turma: primeira.turma ?? 'Sem turma',
    disciplinaId: primeira.disciplinaId,
    disciplina: primeira.disciplina ?? 'Sem disciplina',
    percentual: Math.min(100, (soma / quantidade / primeira.notaMaxima) * 100),
    tentativas: quantidade,
    notaMaxima: primeira.notaMaxima,
    data: primeira.data ?? undefined,
    tipoDestinacao: primeira.tipoDestinacao,
  }))
}

/** Média dos percentuais por simulado, do pior para o melhor. */
export function mediaPorDisciplina(desempenhos: DesempenhoSimulado[]): ItemGraficoBarras[] {
  const acumulado = new Map<string, { soma: number; quantidade: number }>()

  for (const item of desempenhos) {
    const atual = acumulado.get(item.disciplina) ?? { soma: 0, quantidade: 0 }
    acumulado.set(item.disciplina, { soma: atual.soma + item.percentual, quantidade: atual.quantidade + 1 })
  }

  return [...acumulado.entries()]
    .map(([disciplina, valores]) => ({ chave: disciplina, rotulo: disciplina, valor: valores.soma / valores.quantidade }))
    .sort((a, b) => a.valor - b.valor)
}

/** Simulados de cada disciplina em ordem cronológica; só disciplinas com 2+ simulados, pois tendência não existe com um ponto só. */
export function tendenciaPorDisciplina(desempenhos: DesempenhoSimulado[]) {
  const porDisciplina = new Map<string, DesempenhoSimulado[]>()

  for (const item of desempenhos) {
    if (!item.data) continue
    const lista = porDisciplina.get(item.disciplina) ?? []
    lista.push(item)
    porDisciplina.set(item.disciplina, lista)
  }

  return [...porDisciplina.entries()]
    .map(([disciplina, itens]) => ({
      disciplina,
      pontos: [...itens]
        .sort((a, b) => new Date(a.data as string).getTime() - new Date(b.data as string).getTime())
        .map<PontoGraficoLinha>((item) => ({
          chave: String(item.simuladoId),
          rotulo: formatarData(item.data),
          valor: item.percentual,
        })),
    }))
    .filter((item) => item.pontos.length >= 2)
}
