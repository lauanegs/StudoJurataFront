import type { ReactNode } from 'react'

import type { PaginacaoProps } from '@/components/ui/Paginacao/types'

export interface Coluna<T> {
  key: string
  cabecalho: string
  largura?: string
  alinhamento?: 'left' | 'center' | 'right'
  ordenavel?: boolean
  valorOrdenacao?: (item: T) => string | number | null | undefined
  render: (item: T) => ReactNode
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
  rowKey: (item: T) => string | number
  loading?: boolean
  error?: string | null
  onReload?: () => void
  empty?: ConfiguracaoVazio
  onRowClick?: (item: T) => void
  actions?: (item: T) => ReactNode
  rotuloColunaAcoes?: string
  /**
   * Deixa os botões da coluna de ações quebrarem pra uma linha extra quando
   * não cabem mais, em vez de reservar espaço pra todos numa linha só (o que
   * empurra a tabela pro scroll horizontal do wrapper). Usar só em tabelas
   * com muitas colunas (a partir de ~7) — nas demais, o scroll horizontal
   * discreto da própria tabela é preferível a espremer a coluna de ações.
   */
  quebrarAcoes?: boolean
  paginacao?: PaginacaoProps
  densidade?: Densidade
  descricao?: string
  linhasSkeleton?: number
}

export type Direcao = 'asc' | 'desc'

export type Densidade = 'confortavel' | 'compacta'
