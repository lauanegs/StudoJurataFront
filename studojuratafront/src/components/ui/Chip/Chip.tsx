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
      // O pill encolhe pro tamanho do próprio conteúdo (inline-flex sem
      // largura própria) — não sobra espaço nenhum pro texto "flutuar"
      // dentro dele, então nem padding simétrico nem `flex:1` no label
      // conseguem centralizar o texto de fato: o botão de remover ocupa
      // espaço só do lado direito, puxando o bloco inteiro (e o texto
      // dentro dele) pra a esquerda. A correção real é compensar isso do
      // outro lado: padding esquerdo maior, do tamanho exato do que o
      // botão + o gap ocupam à direita — aí sim o texto fica visualmente
      // no meio do pill, não só o bloco texto+botão.
      styles={{
        root: {
          backgroundColor: cor.bg,
          color: cor.texto,
          border: cor.borda ? `1px solid ${cor.borda}` : undefined,
          fontWeight: tokens.typography.weights.medium,
          fontSize: tokens.typography.sizes.sm,
          opacity: disabled ? 0.55 : 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: tokens.spacing.xs,
          height: '56px',
          // Sem botão de remover: padding simétrico. Com botão: o esquerdo
          // absorve o espaço que o botão (24px) + o gap (8px) ocupam à
          // direita, pra o texto ficar centralizado no pill inteiro.
          paddingInlineStart: onRemove ? tokens.spacing.xxxl : tokens.spacing.md,
          paddingInlineEnd: tokens.spacing.md,
          maxWidth: '100%',
        },
        remove: {
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
