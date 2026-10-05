import type { ReactNode } from 'react'
import type { ItemTabelaResumo } from '@/components/graficos/TabelaResumo'

export interface GraficoCardProps {
  titulo: string
  /** Descrição opcional mostrada só no modal de detalhamento (o card compacto não tem espaço pra ela). */
  descricao?: string
  /** Recebe a altura (px) a usar e se é a versão interativa (dentro do modal) — o mesmo gráfico é
   * renderizado compacto (não interativo) no card e maior (interativo) no modal. Interações como
   * clicar numa coluna pra detalhar só devem ficar ativas quando `interativo` for true. */
  renderGrafico: (altura: number, interativo: boolean) => ReactNode
  /** Resumo do recorte aplicado (turma/disciplina/aluno/período) — mostrado só no modal de detalhamento, antes do gráfico. */
  contexto?: ReactNode
  /** Mesmo recorte de `contexto`, como texto puro — vai no cabeçalho do PDF exportado (que não sabe renderizar o ReactNode de `contexto`). */
  contextoTexto?: string[]
  /** Conteúdo extra abaixo do gráfico — tabela de valores exatos, ou o detalhe de uma coluna clicada
   * (e o pedido pra selecionar uma, enquanto nada foi clicado). Mostrado só no modal de detalhamento, nunca no card compacto. */
  detalhe?: ReactNode
  /** Valores exatos por trás do gráfico — o que é exportado pro PDF e pro Excel. */
  dados: ItemTabelaResumo[]
  colunaRotulo?: string
  colunaValor?: string
  alturaCompacta?: number
  alturaDetalhe?: number
}
