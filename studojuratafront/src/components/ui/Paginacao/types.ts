export interface PaginacaoProps {
  pagina: number
  totalPaginas: number
  /** Texto no formato "1 - 20 de 36" (doc §4.3). */
  label: string
  temAnterior: boolean
  temProxima: boolean
  onPrevious: () => void
  onNext: () => void
}
