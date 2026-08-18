import { Text } from '@mantine/core'

import { theme as tokens } from '../../../styles/theme'
import type { TextTone, TextoProps, TextVariant } from './types'

/** Tag semântica padrão de cada variant — pode ser trocada via `as`. */
const DEFAULT_TAG: Record<TextVariant, string> = {
  pageTitle: 'h1',
  displayTitle: 'h1',
  subtitle: 'p',
  largeNumber: 'strong',
  sectionTitle: 'h2',
  itemTitle: 'h3',
  body: 'p',
  bodyStrong: 'p',
  caption: 'span',
  captionStrong: 'span',
}

const VARIANTES: Record<TextVariant, { fontSize: string; fontWeight: number; lineHeight: number }> = {
  pageTitle: {
    fontSize: tokens.typography.sizes.title,
    fontWeight: tokens.typography.weights.medium,
    lineHeight: tokens.typography.lineHeight.tight,
  },
  displayTitle: {
    fontSize: tokens.typography.sizes.title,
    fontWeight: tokens.typography.weights.bold,
    lineHeight: tokens.typography.lineHeight.tight,
  },
  subtitle: {
    fontSize: tokens.typography.sizes.xl,
    fontWeight: tokens.typography.weights.medium,
    lineHeight: tokens.typography.lineHeight.normal,
  },
  largeNumber: {
    fontSize: tokens.typography.sizes.xxl,
    fontWeight: tokens.typography.weights.bold,
    lineHeight: tokens.typography.lineHeight.tight,
  },
  sectionTitle: {
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.semiBold,
    lineHeight: tokens.typography.lineHeight.tight,
  },
  itemTitle: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.semiBold,
    lineHeight: tokens.typography.lineHeight.tight,
  },
  body: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.regular,
    lineHeight: tokens.typography.lineHeight.normal,
  },
  bodyStrong: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.medium,
    lineHeight: tokens.typography.lineHeight.normal,
  },
  caption: {
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.regular,
    lineHeight: tokens.typography.lineHeight.normal,
  },
  captionStrong: {
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.semiBold,
    lineHeight: tokens.typography.lineHeight.normal,
  },
}

const TONS: Record<TextTone, string> = {
  strong: tokens.colors.textStrong,
  secondary: tokens.colors.textSecondary,
  tertiary: tokens.colors.textTertiary,
  purple: tokens.colors.purple,
  blue: tokens.colors.blue,
  success: tokens.colors.successText,
  error: tokens.colors.errorText,
  warning: tokens.colors.warningText,
  white: tokens.colors.white,
}

/** O corte de texto em N linhas (`lines`) era CSS `-webkit-line-clamp` na mão — a Mantine tem `lineClamp` pronto. */
export function Texto({
  variant = 'body',
  tone = 'strong',
  as,
  align,
  lines,
  children,
  style,
  ...rest
}: TextoProps) {
  const v = VARIANTES[variant]

  return (
    <Text
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- o `component` polimórfico da Mantine
         não infere bem uma união ampla de tags; forçar o tipo aqui é mais simples que replicar a factory. */
      component={(as ?? DEFAULT_TAG[variant]) as any}
      ta={align}
      lineClamp={lines}
      style={{
        margin: 0,
        fontSize: v.fontSize,
        fontWeight: v.fontWeight,
        lineHeight: v.lineHeight,
        color: TONS[tone],
        ...style,
      }}
      {...rest}
    >
      {children}
    </Text>
  )
}
