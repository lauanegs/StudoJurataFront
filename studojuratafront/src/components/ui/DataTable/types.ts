import type { ReactNode } from 'react'

import type { PaginacaoProps } from '@/components/ui/Paginacao/types'

export type Alinhamento = 'left' | 'center' | 'right'

export interface Coluna<T> {
  key: string
  cabecalho: string
  largura?: string
  alinhamento?: Alinhamento
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
  quebrarAcoes?: boolean
  paginacao?: PaginacaoProps
  densidade?: Densidade
  descricao?: string
  linhasSkeleton?: number
}

export type Direcao = 'asc' | 'desc'

export type Densidade = 'confortavel' | 'compacta'
