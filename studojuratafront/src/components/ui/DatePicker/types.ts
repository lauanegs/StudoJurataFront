import type { InputProps } from '../Input/types'

export interface DatePickerProps extends Omit<InputProps, 'type' | 'icon'> {
  /** 'data' → YYYY-MM-DD · 'dataHora' → YYYY-MM-DDTHH:mm (LocalDateTime). */
  modo?: 'data' | 'dataHora'
}
