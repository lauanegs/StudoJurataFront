import { Paper, Tabs } from '@mantine/core'

import { theme as tokens } from '../../../styles/theme'
import { comTamanho } from '../../../utils/redimensionarIcone'
import type { TabProps } from './types'

/**
 * Confirmado no Figma (aba "Realizar chamada"): estilo de sublinhado, não
 * pílula — ativo/inativo variam só por fundo e borda inferior, o texto
 * mantém a mesma cor e peso nos dois estados. A navegação por seta
 * esquerda/direita, antes feita na mão, já vem pronta na Mantine (loop,
 * roving tabIndex, ARIA).
 */
export function Tab<V extends string = string>({
  options,
  value,
  onChange,
  rotuloAcessivel = 'Seções da página',
}: TabProps<V>) {
  return (
    <Paper
      radius="md"
      shadow="md"
      style={{ width: '100%', overflow: 'hidden', padding: `0 ${tokens.spacing.md}` }}
    >
      <Tabs value={value} onChange={(novoValor) => novoValor && onChange(novoValor as V)}>
        <Tabs.List
          aria-label={rotuloAcessivel}
          style={{ flexWrap: 'nowrap', overflowX: 'auto', border: 'none' }}
        >
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
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 20,
                      height: 20,
                      padding: '0 6px',
                      borderRadius: tokens.radius.pill,
                      background: ativa ? tokens.colors.purple : tokens.colors.background,
                      color: ativa ? tokens.colors.white : tokens.colors.textSecondary,
                      fontSize: '11px',
                      fontWeight: tokens.typography.weights.bold,
                    }}
                  >
                    {option.contador}
                  </span>
                ) : undefined
              }
              styles={{
                tab: {
                  height: '52px',
                  padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
                  borderRadius: `${tokens.radius.md} ${tokens.radius.md} 0 0`,
                  borderBottom: `2px solid ${ativa ? tokens.colors.buttonPurple : tokens.colors.border}`,
                  fontSize: tokens.typography.sizes.md,
                  fontWeight: tokens.typography.weights.semiBold,
                  letterSpacing: '-0.8px',
                  color: tokens.colors.textSecondary,
                  background: ativa ? 'rgba(230, 234, 242, 0.3)' : 'transparent',
                },
              }}
            >
              {option.label}
            </Tabs.Tab>
          )
        })}
        </Tabs.List>
      </Tabs>
    </Paper>
  )
}
