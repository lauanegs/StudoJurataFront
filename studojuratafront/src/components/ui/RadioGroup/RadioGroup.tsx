import { useId } from 'react'

import { Field } from '../Field'
import * as S from './styles'
import type { RadioGroupProps } from './types'

/**
 * Escolha única. Substitui o par de checkboxes "Feminino/Masculino" das telas
 * antigas — o back tem um único campo `sexo`, então dois checkboxes permitiam
 * um estado impossível (os dois marcados).
 */
export function RadioGroup<V extends string = string>({
  options,
  value,
  onChange,
  label,
  required,
  hint,
  error,
  direction = 'horizontal',
  name,
}: RadioGroupProps<V>) {
  const generatedId = useId()
  const groupName = name ?? generatedId

  return (
    <Field label={label} required={required} hint={hint} error={error}>
      <S.Lista role="radiogroup" aria-label={label} $direction={direction}>
        {options.map((option) => (
          <S.Opcao key={option.value} $disabled={option.disabled}>
            <S.Entrada
              type="radio"
              name={groupName}
              value={option.value}
              checked={value === option.value}
              disabled={option.disabled}
              aria-invalid={error ? true : undefined}
              onChange={() => onChange(option.value)}
            />

            <S.Marcador $marked={value === option.value} $error={Boolean(error)} aria-hidden="true" />

            <S.Conteudo>
              <S.Texto>{option.label}</S.Texto>
              {option.description && <S.Descricao>{option.description}</S.Descricao>}
            </S.Conteudo>
          </S.Opcao>
        ))}
      </S.Lista>
    </Field>
  )
}
