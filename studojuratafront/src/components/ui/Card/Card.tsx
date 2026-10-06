import { theme as tokens } from '@/styles/theme'

import { Acoes, Cabecalho, Container, Corpo, Icone, TextoTitulo, Titulo } from './styles'
import type { CardProps } from './types'

const ELEVACAO: Record<NonNullable<CardProps['elevacao']>, { shadow?: string; border?: string }> = {
  none: { border: `2px solid ${tokens.colors.border}` },
  default: { shadow: tokens.shadow.base },
  medium: { shadow: tokens.shadow.card },
}

export function Card({
  children,
  titulo,
  icon,
  actions,
  semPadding = false,
  corpoComFundo = false,
  elevacao = 'default',
  ...rest
}: CardProps) {
  const temCabecalho = Boolean(titulo || actions)
  const el = ELEVACAO[elevacao]

  return (
    <Container $sombra={el.shadow} $borda={el.border} $comFundo={corpoComFundo} {...rest}>
      {temCabecalho && (
        <Cabecalho $comFundo={corpoComFundo}>
          <Titulo>
            {icon && (
              <Icone aria-hidden="true" className="icone-card">
                {icon}
              </Icone>
            )}
            {titulo && <TextoTitulo>{titulo}</TextoTitulo>}
          </Titulo>

          {actions && <Acoes>{actions}</Acoes>}
        </Cabecalho>
      )}

      <Corpo $semPadding={semPadding}>{children}</Corpo>
    </Container>
  )
}
