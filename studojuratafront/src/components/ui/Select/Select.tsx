import { useId, useMemo, useState } from 'react'
import { Select as MantineSelect, Group, Text } from '@mantine/core'
import { Check } from 'lucide-react'

import { Field } from '@/components/ui/Field'
import { comTamanho } from '@/utils/redimensionarIcone'
import { estilosCampo, Opcao } from './styles'
import type { SelectOption, SelectProps } from './types'

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
      <Group gap="xs" wrap="nowrap" w="100%">
        {comTamanho(original?.icon, 16)}
        <Opcao>
          <div>{option.label}</div>
          {original?.description && (
            <Text size="xs" c="dimmed">
              {original.description}
            </Text>
          )}
        </Opcao>
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
        maw={maxWidth}
        onFocus={() => setEmFoco(true)}
        onBlur={() => setEmFoco(false)}
        onDropdownOpen={() => setEmFoco(true)}
        onDropdownClose={() => setEmFoco(false)}
        styles={estilosCampo(Boolean(error), emFoco)}
      />
    </Field>
  )
}

export type { SelectOption }
