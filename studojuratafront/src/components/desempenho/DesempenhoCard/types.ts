import type { ReactNode } from 'react'

export interface DesempenhoCardProps {
  titulo: string
  descricao?: ReactNode
  /** 0 a 100. */
  porcentagem: number
  /** Selo no cabeçalho, ao lado do título — identifica do que se trata o card (ex.: simulado). */
  icon?: ReactNode
  /** 'vertical' (padrão): cabeçalho em cima, barra embaixo — pra grades compactas. 'horizontal': cabeçalho à esquerda, porcentagem à direita — pra listas de largura total. */
  orientacao?: 'vertical' | 'horizontal'
  /** Quando informado, o card vira um botão — usado pra abrir o detalhamento do simulado. */
  onClick?: () => void
}
