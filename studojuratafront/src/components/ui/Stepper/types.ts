export interface StepperOption<V extends string = string> {
  value: V
  label: string
  description?: string
}

export interface StepperProps<V extends string = string> {
  options: StepperOption<V>[]
  value: V
  /** Omitido = passo não é clicável (só avança pelos botões "Próximo"/"Voltar" da tela). */
  onChange?: (value: V) => void
  rotuloAcessivel?: string
}
