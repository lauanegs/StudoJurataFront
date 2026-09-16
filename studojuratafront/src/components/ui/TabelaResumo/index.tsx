/**
 * Formato genérico de linha usada tanto pelos valores exatos exportados de um
 * GraficoCard (PDF/Excel) quanto pela DataTable de detalhamento na tela —
 * cada uma dessas telas monta suas próprias colunas a partir dele.
 */
export interface ItemTabelaResumo {
  chave: string
  rotulo: string
  /** Já formatado — cada tela decide se é porcentagem, contagem etc. */
  valor: string
}
