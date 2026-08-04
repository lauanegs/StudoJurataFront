import type { ReactNode } from 'react'

import type { PaginacaoProps } from '../Paginacao/types'

export interface Coluna<T> {
  key: string
  cabecalho: string
  largura?: string
  alinhamento?: 'left' | 'center' | 'right'
  ordenavel?: boolean
  /** Valor bruto usado para ordenar (quando `render` devolve JSX). */
  valorOrdenacao?: (item: T) => string | number | null | undefined
  render: (item: T) => ReactNode
  /** Oculta a coluna abaixo de 1024px (colunas secundárias). */
  ocultarEmTelaPequena?: boolean
}

export interface ConfiguracaoVazio {
  titulo: string
  descricao?: string
  icon?: ReactNode
  acao?: ReactNode
}

export interface DataTableProps<T> {
  columns: Coluna<T>[]
  data: T[]
  /** Identificador estável de cada linha (nunca use o índice). */
  rowKey: (item: T) => string | number
  loading?: boolean
  error?: string | null
  onReload?: () => void
  empty?: ConfiguracaoVazio
  onRowClick?: (item: T) => void
  /** Coluna de ações fixa à direita, fora do fluxo de ordenação. */
  actions?: (item: T) => ReactNode
  rotuloColunaAcoes?: string
  paginacao?: PaginacaoProps
  densidade?: 'confortavel' | 'compacta'
  descricao?: string
  linhasSkeleton?: number
}
