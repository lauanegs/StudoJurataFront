import { Checkbox } from '@mantine/core'

import type { CheckBoxProps } from './types'

export function CheckBox({
  label,
  description,
  error,
  indeterminate = false,
  checked = false,
  disabled,
  size: _size,
  ...rest
}: CheckBoxProps) {
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
