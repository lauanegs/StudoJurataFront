import { Clock } from 'lucide-react'

import { Input } from '../Input'
import type { TimePickerProps } from './types'

/** Campo de hora (HH:mm) — usado nos horários semanais da turma. */
export function TimePicker(props: TimePickerProps) {
  return <Input type="time" icon={<Clock />} {...props} />
}
