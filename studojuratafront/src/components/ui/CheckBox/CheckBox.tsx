import { Checkbox } from '@mantine/core'

import type { CheckBoxProps } from './types'

export function CheckBox({
  label,
  description,
  error,
  indeterminate = false,
  checked = false,
  disabled,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  size: _size,
  ...rest
}: CheckBoxProps) {
  // Descarta o `size` nativo do <input> para não colidir com o token de escala da Mantine.
  return (
    <Checkbox
      checked={checked}
      indeterminate={indeterminate}
      disabled={disabled}
      label={label}
      description={description}
      error={error}
      color="brandPurple"
      radius="sm"
      {...rest}
    />
  )
}
