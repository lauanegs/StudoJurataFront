import type { ReactNode, RefObject } from 'react'

import type { InputProps } from '@/components/ui/Input/types'

export interface DatePickerProps extends Omit<InputProps, 'type' | 'icon'> {
  modo?: 'data' | 'dataHora'
}

export interface IconeCampoProps {
  icon: ReactNode
  campoRef: RefObject<HTMLInputElement | null>
  disabled?: boolean
}
