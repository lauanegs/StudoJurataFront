export interface HistogramaProps {
  /** Uma nota (0-100) por aluno/tentativa — o histograma agrupa em faixas de 20 pontos. */
  valores: number[]
  rotuloAcessivel?: string
  /** Em px — maior no modal de detalhamento do que dentro do card compacto. */
  altura?: number
  /** Quando informado, clicar numa coluna chama isso com o rótulo da faixa (ex.: "40-60") — usado no
   * modal de detalhamento pra mostrar quem está naquela faixa (aluno, simulado, nota) abaixo do gráfico. */
  onFaixaClick?: (rotuloFaixa: string) => void
  /** Rótulo da faixa clicada — pinta essa coluna numa cor diferente, marcando a seleção atual. */
  faixaSelecionada?: string | null
}
