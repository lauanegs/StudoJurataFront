export interface RadioOption<V extends string = string> {
  value: V
  label: string
  description?: string
  disabled?: boolean
}

export interface RadioGroupProps<V extends string = string> {
  options: RadioOption<V>[]
  value: V | null | undefined
  onChange: (value: V) => void
  label?: string
  required?: boolean
  hint?: string
  error?: string
  direction?: 'horizontal' | 'vertical'
  name?: string
}
