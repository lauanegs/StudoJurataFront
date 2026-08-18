import { Checkbox } from '@mantine/core'

import type { CheckBoxProps } from './types'

/**
 * O estado indeterminado (usado na seleção em massa de linhas de tabela) era
 * um useEffect setando `inputRef.current.indeterminate` na mão — a Mantine
 * já aceita `indeterminate` como prop.
 */
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
  // `size` chega tipado como o atributo nativo de <input> (número) por herdar
  // InputHTMLAttributes — não faz sentido pra checkbox, então é descartado
  // aqui pra não colidir com o `size` (token de escala) da Mantine.
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
