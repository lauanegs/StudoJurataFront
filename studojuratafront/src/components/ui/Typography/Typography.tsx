import * as S from './styles'
import type { TextoProps, TextVariant } from './types'

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

export function Texto({
  variant = 'body',
  tone = 'strong',
  as,
  align,
  lines,
  children,
  ...rest
}: TextoProps) {
  return (
    <S.Base
      as={as ?? (DEFAULT_TAG[variant] as never)}
      $variant={variant}
      $tone={tone}
      $align={align}
      $lines={lines}
      {...rest}
    >
      {children}
    </S.Base>
  )
}
