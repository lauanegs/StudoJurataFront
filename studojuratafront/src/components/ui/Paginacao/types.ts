export interface PaginacaoProps {
  pagina: number
  totalPaginas: number
  label: string
  temAnterior: boolean
  temProxima: boolean
  onPrevious: () => void
  onNext: () => void
}
