import { useId, useMemo, useState } from 'react'
import { Select as MantineSelect, Group, Text } from '@mantine/core'
import { Check } from 'lucide-react'

import { Field } from '../Field'
import { theme as tokens } from '../../../styles/theme'
import { corComOpacidade } from '../../../utils/corComOpacidade'
import { comTamanho } from '../../../utils/redimensionarIcone'
import type { SelectOption, SelectProps } from './types'

/**
 * Delega a lógica de abrir/fechar, busca, navegação por teclado e clique
 * fora pro Combobox da Mantine — o Select caseiro reimplementava tudo isso
 * na mão. O <Field> continua sendo o mesmo, pra bater visualmente com Input,
 * TextArea e DatePicker enquanto eles ainda não migraram.
 */
export function Select<V extends string | number = string | number>({
  options,
  value,
  onChange,
  label,
  required,
  hint,
  error,
  placeholder = 'Selecione...',
  disabled,
  loading,
  clearable = false,
  searchable = false,
  emptyText = 'Nenhuma opção disponível',
  maxWidth,
}: SelectProps<V>) {
  const fieldId = useId()
  const [emFoco, setEmFoco] = useState(false)

  const optionsByValue = useMemo(
    () => new Map(options.map((option) => [option.value, option])),
    [options],
  )

  const data = useMemo(
    () => options.map((option) => ({ value: option.value, label: option.label, disabled: option.disabled })),
    [options],
  )

  function renderOption({
    option,
    checked,
  }: {
    option: { value: V; label: string }
    checked?: boolean
  }) {
    const original = optionsByValue.get(option.value)

    return (
      <Group gap="xs" wrap="nowrap" style={{ width: '100%' }}>
        {comTamanho(original?.icon, 16)}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div>{option.label}</div>
          {original?.description && (
            <Text size="xs" c="dimmed">
              {original.description}
            </Text>
          )}
        </div>
        {checked && <Check size={16} />}
      </Group>
    )
  }

  return (
    <Field label={label} htmlFor={fieldId} required={required} hint={hint} error={error}>
      <MantineSelect<V>
        id={fieldId}
        data={data}
        value={value ?? null}
        onChange={(novoValor) => onChange(novoValor)}
        placeholder={loading ? 'Carregando...' : placeholder}
        disabled={disabled || loading}
        loading={loading}
        searchable={searchable}
        clearable={clearable}
        error={Boolean(error)}
        nothingFoundMessage={emptyText}
        renderOption={renderOption}
        radius="md"
        style={{ maxWidth }}
        onFocus={() => setEmFoco(true)}
        onBlur={() => setEmFoco(false)}
        onDropdownOpen={() => setEmFoco(true)}
        onDropdownClose={() => setEmFoco(false)}
        styles={{
          input: {
            minHeight: '56px',
            borderWidth: '2px',
            borderColor: error
              ? corComOpacidade(tokens.colors.error, emFoco ? 1 : 0.45)
              : corComOpacidade(tokens.colors.buttonPurple, emFoco ? 1 : 0.45),
            boxShadow: tokens.shadow.base,
            transition: `border-color ${tokens.transition.base}`,
          },
        }}
      />
    </Field>
  )
}

export type { SelectOption }
