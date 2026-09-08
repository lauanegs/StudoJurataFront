import { Pill } from '@mantine/core'

import { theme as tokens } from '../../../styles/theme'
import { comTamanho } from '../../../utils/redimensionarIcone'
import type { ChipProps } from './types'

const CORES: Record<
  NonNullable<ChipProps['variant']>,
  { bg: string; texto: string; borda?: string }
> = {
  neutral: { bg: 'rgba(230, 234, 242, 0.6)', texto: tokens.colors.textTertiary },
  purple: { bg: tokens.colors.purpleSoft, texto: tokens.colors.purple, borda: tokens.colors.purple },
  blue: { bg: tokens.colors.infoBackground, texto: tokens.colors.infoText, borda: tokens.colors.blue },
}

export function Chip({
  children,
  icon,
  onRemove,
  rotuloRemover,
  variant = 'neutral',
  disabled,
}: ChipProps) {
  const cor = CORES[variant]

  return (
    <Pill
      withRemoveButton={Boolean(onRemove)}
      onRemove={onRemove}
      disabled={disabled}
      removeButtonProps={{ 'aria-label': rotuloRemover ?? `Remover ${String(children)}` }}
      // 56px de altura, ícone de remover em 24px — bem maior e mais
      // espaçoso do que o tamanho padrão de Pill da Mantine.
      //
      // O botão de remover fica fora do fluxo do flex (position: absolute),
      // não conta mais como um "irmão" do texto disputando espaço. Padding
      // simétrico dos dois lados (mesmo valor, spacing.xl) reserva à direita
      // exatamente o espaço que o botão precisa pra caber sem sobrepor o
      // texto, sem puxar o centro pra nenhum lado.
      // `justifyContent: center` no root sozinho NÃO bastava: o
      // `.mantine-Pill-label` (elemento interno da Mantine, não o nosso
      // <span>) já vem esticado (flex:1) pelo CSS da própria lib — ele
      // ocupava 100% da caixa de conteúdo, deixando o `justifyContent` do
      // root sem espaço sobrando pra centralizar. É por isso que era preciso
      // sobrescrever também `styles.label`, centralizando o conteúdo dentro
      // dele mesmo.
      styles={{
        root: {
          position: 'relative',
          backgroundColor: cor.bg,
          color: cor.texto,
          border: cor.borda ? `1px solid ${cor.borda}` : undefined,
          fontWeight: tokens.typography.weights.medium,
          fontSize: tokens.typography.sizes.sm,
          opacity: disabled ? 0.55 : 1,
          display: 'inline-flex',
          alignItems: 'center',
          height: '56px',
          paddingInlineStart: onRemove ? tokens.spacing.xl : tokens.spacing.md,
          paddingInlineEnd: onRemove ? tokens.spacing.xl : tokens.spacing.md,
          maxWidth: '100%',
        },
        label: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        },
        remove: {
          position: 'absolute',
          right: tokens.spacing.xs,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '24px',
          height: '24px',
          minWidth: '24px',
        },
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: tokens.spacing.xs,
          minWidth: 0,
        }}
      >
        {comTamanho(icon, 12)}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{children}</span>
      </span>
    </Pill>
  )
}
