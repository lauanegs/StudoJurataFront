import { Tabs } from '@mantine/core'

import { comTamanho } from '@/utils/redimensionarIcone'
import { Contador, Envelope, estiloLista, estilosAba } from './styles'
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
        <Tabs.List aria-label={rotuloAcessivel} style={estiloLista}>
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
                styles={estilosAba(ativa)}
              >
                {option.label}
              </Tabs.Tab>
            )
          })}
        </Tabs.List>
      </Tabs>
    </Envelope>
  )
}
