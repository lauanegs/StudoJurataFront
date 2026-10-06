import { formatarPorcentagem } from '@/utils/format'
import type { SecaoRelatorio, EntradaRelatorio } from './types'
/** Seções exportadas no "Exportar tudo" */
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
