import { Tabs } from '@mantine/core'

import { comTamanho } from '@/utils/redimensionarIcone'
import { Contador, Envelope, Lista } from './styles'
import type { TabProps } from './types'

export function Tab<V extends string = string>({
  options,
  value,
  onChange,
  rotuloAcessivel = 'Seções da página',
}: TabProps<V>) {
  return (
    <Envelope>
      <Tabs value={value} onChange={(novoValor) => novoValor && onChange(novoValor as V)}>
        <Lista aria-label={rotuloAcessivel}>
          {options.map((option) => {
            const ativa = option.value === value

            return (
              <Tabs.Tab
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                leftSection={comTamanho(option.icon, 16)}
                rightSection={
                  option.contador !== undefined && option.contador > 0 ? (
                    <Contador $ativa={ativa}>{option.contador}</Contador>
                  ) : undefined
                }
              >
                {option.label}
              </Tabs.Tab>
            )
          })}
        </Lista>
      </Tabs>
    </Envelope>
  )
}
