import { formatarPorcentagem } from '@/utils/format'
import type { DesempenhoSimulado } from './agregacoesDesempenho'

interface LinhaRelatorio {
  chave: string
  rotulo: string
  valor: string
}

export interface SecaoRelatorio {
  titulo: string
  colunaRotulo: string
  colunaValor: string
  linhas: LinhaRelatorio[]
}

interface EntradaRelatorio {
  desempenhos: DesempenhoSimulado[]
  totalTentativasConcluidas: number
  totalAlunosAvaliados: number
  totalDisciplinasAvaliadas: number
  tabelaDistribuicaoGeral: LinhaRelatorio[]
  tabelaDesempenhoPorDisciplina: LinhaRelatorio[]
  tendenciaPorDisciplina: { disciplina: string; pontos: { chave: string; rotulo: string; valor: number }[] }[]
}

/** Seções exportadas no "Exportar tudo": uma aba por seção no Excel, uma tabela por seção no PDF. */
export function montarSecoesRelatorio(entrada: EntradaRelatorio): SecaoRelatorio[] {
  const { desempenhos, tendenciaPorDisciplina } = entrada

  return [
    {
      titulo: 'Resumo geral',
      colunaRotulo: 'Indicador',
      colunaValor: 'Valor',
      linhas: [
        { chave: 'simulados', rotulo: 'Simulados aplicados', valor: String(desempenhos.length) },
        { chave: 'tentativas', rotulo: 'Tentativas concluídas', valor: String(entrada.totalTentativasConcluidas) },
        { chave: 'alunos', rotulo: 'Alunos avaliados', valor: String(entrada.totalAlunosAvaliados) },
        { chave: 'disciplinas', rotulo: 'Disciplinas avaliadas', valor: String(entrada.totalDisciplinasAvaliadas) },
      ],
    },
    {
      titulo: 'Distribuição geral das notas',
      colunaRotulo: 'Faixa de nota',
      colunaValor: 'Quantidade',
      linhas: entrada.tabelaDistribuicaoGeral,
    },
    {
      titulo: 'Desempenho médio por disciplina',
      colunaRotulo: 'Disciplina',
      colunaValor: 'Desempenho médio',
      linhas: entrada.tabelaDesempenhoPorDisciplina,
    },
    ...tendenciaPorDisciplina.map((item) => ({
      titulo: `Evolução — ${item.disciplina}`,
      colunaRotulo: 'Simulado',
      colunaValor: 'Nota',
      linhas: item.pontos.map((ponto) => ({
        chave: ponto.chave,
        rotulo: ponto.rotulo,
        valor: formatarPorcentagem(ponto.valor),
      })),
    })),
    {
      titulo: 'Desempenho por simulado',
      colunaRotulo: 'Simulado',
      colunaValor: 'Desempenho',
      linhas: desempenhos.map((item) => ({
        chave: String(item.simuladoId),
        rotulo: `${item.titulo} — ${item.turma} — ${item.disciplina}`,
        valor: formatarPorcentagem(item.percentual),
      })),
    },
  ]
}
