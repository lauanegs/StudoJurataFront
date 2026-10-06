import { theme as tokens } from '@/styles/theme'

import type { NivelDesempenho } from './types'
export const LIMIAR_BAIXO_DESEMPENHO = 60

export function nivelDesempenho(porcentagem: number): NivelDesempenho {
  if (porcentagem < 40) return 'baixo'
  if (porcentagem < 70) return 'medio'
  return 'alto'
}

export const CORES_NIVEL_DESEMPENHO: Record<NivelDesempenho, string> = {
  baixo: tokens.colors.error,
  medio: tokens.colors.warning,
  alto: tokens.colors.success,
}

const FAIXAS_HISTOGRAMA = [
  { min: 0, max: 20, rotulo: '0-20' },
  { min: 20, max: 40, rotulo: '20-40' },
  { min: 40, max: 60, rotulo: '40-60' },
  { min: 60, max: 80, rotulo: '60-80' },
  { min: 80, max: 100, rotulo: '80-100' },
]

export function estaNaFaixaHistograma(valor: number, rotuloFaixa: string): boolean {
  const faixa = FAIXAS_HISTOGRAMA.find((item) => item.rotulo === rotuloFaixa)
  if (!faixa) return false
  return valor >= faixa.min && (faixa.max === 100 ? valor <= faixa.max : valor < faixa.max)
}

export function calcularFaixasHistograma(valores: number[]) {
  return FAIXAS_HISTOGRAMA.map((faixa) => ({
    rotulo: faixa.rotulo,
    quantidade: valores.filter((valor) => estaNaFaixaHistograma(valor, faixa.rotulo)).length,
  }))
}
