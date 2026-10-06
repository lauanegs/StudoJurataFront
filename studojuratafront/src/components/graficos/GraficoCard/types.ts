import type { ReactNode } from 'react'
import type { ItemTabelaResumo } from '@/components/graficos/TabelaResumo'

export interface GraficoCardProps {
  titulo: string
  descricao?: string
  renderGrafico: (altura: number, interativo: boolean) => ReactNode
  contexto?: ReactNode
  contextoTexto?: string[]
  detalhe?: ReactNode
  dados: ItemTabelaResumo[]
  colunaRotulo?: string
  colunaValor?: string
  alturaCompacta?: number
  alturaDetalhe?: number
}
