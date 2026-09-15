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
  /**
   * Deixa os botões da coluna de ações quebrarem pra uma linha extra quando
   * não cabem mais, em vez de reservar espaço pra todos numa linha só (o que
   * empurra a tabela pro scroll horizontal do wrapper). Usar só em tabelas
   * com muitas colunas (a partir de ~7) — nas demais, o scroll horizontal
   * discreto da própria tabela é preferível a espremer a coluna de ações.
   * @default false
   */
  quebrarAcoes?: boolean
  paginacao?: PaginacaoProps
  densidade?: 'confortavel' | 'compacta'
  descricao?: string
  linhasSkeleton?: number
}
