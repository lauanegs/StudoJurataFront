export interface Option {
  value: string | number
  label: string
}

export interface SelectProps {
  options: Option[]
  value?: string | number
  onChange?: (value: string | number) => void
  placeholder?: string
}