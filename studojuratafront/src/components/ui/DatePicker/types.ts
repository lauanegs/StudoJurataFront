import type { InputProps } from '@/components/ui/Input/types'

export interface DatePickerProps extends Omit<InputProps, 'type' | 'icon'> {
  modo?: 'data' | 'dataHora'
}
