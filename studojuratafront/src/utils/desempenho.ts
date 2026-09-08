export type NivelDesempenho = 'baixo' | 'medio' | 'alto'

/**
 * Classifica uma porcentagem (0 a 100) de desempenho — mesmos limiares usados
 * pelos gráficos de desempenho (DesempenhoCard), para que qualquer indicador
 * de nota/desempenho na aplicação use sempre a mesma regra de cor.
 */
export function nivelDesempenho(porcentagem: number): NivelDesempenho {
  if (porcentagem < 40) return 'baixo'
  if (porcentagem < 70) return 'medio'
  return 'alto'
}

const FAIXAS_HISTOGRAMA = [
  { min: 0, max: 20, rotulo: '0-20' },
  { min: 20, max: 40, rotulo: '20-40' },
  { min: 40, max: 60, rotulo: '40-60' },
  { min: 60, max: 80, rotulo: '60-80' },
  { min: 80, max: 100, rotulo: '80-100' },
]

/** Testa se uma nota (0-100) cai na faixa de 20 pontos identificada pelo rótulo (ex.: "40-60"). */
export function estaNaFaixaHistograma(valor: number, rotuloFaixa: string): boolean {
  const faixa = FAIXAS_HISTOGRAMA.find((item) => item.rotulo === rotuloFaixa)
  if (!faixa) return false
  return valor >= faixa.min && (faixa.max === 100 ? valor <= faixa.max : valor < faixa.max)
}

/**
 * Agrupa notas (0-100) em faixas de 20 pontos — mesma regra usada pelo
 * gráfico de histograma (Histograma) e pelo detalhamento de quem está em
 * cada faixa (ex.: clique numa coluna do gráfico), para não duplicar a regra
 * em dois lugares.
 */
export function calcularFaixasHistograma(valores: number[]) {
  return FAIXAS_HISTOGRAMA.map((faixa) => ({
    rotulo: faixa.rotulo,
    quantidade: valores.filter((valor) => estaNaFaixaHistograma(valor, faixa.rotulo)).length,
  }))
}
