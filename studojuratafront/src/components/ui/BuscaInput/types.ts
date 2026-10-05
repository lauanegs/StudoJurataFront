import type { InputProps } from '@/components/ui/Input/types'

export interface BuscaInputProps extends Omit<InputProps, 'icon' | 'onClear' | 'label' | 'onChange'> {
  value: string
  onChange: (value: string) => void
}
