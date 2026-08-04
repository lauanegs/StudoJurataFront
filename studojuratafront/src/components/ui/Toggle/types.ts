export interface ToggleProps {
  ligado: boolean
  onChange: (ligado: boolean) => void
  /** Rótulo à direita do switch. Se omitido, informe `rotuloAcessivel`. */
  label?: string
  rotuloAcessivel?: string
  textoLigado?: string
  textoDesligado?: string
  descricao?: string
  disabled?: boolean
  id?: string
}
