export interface SeletorOpcoesProps<T extends string> {
  rotuloAcessivel: string
  value: T
  options: { value: T; label: string }[]
  onChange: (valor: T) => void
  disabled?: boolean
}
