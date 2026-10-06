export interface StepperOption<V extends string = string> {
  value: V
  label: string
  description?: string
}

export interface StepperProps<V extends string = string> {
  options: StepperOption<V>[]
  value: V
  onChange?: (value: V) => void
  rotuloAcessivel?: string
}
