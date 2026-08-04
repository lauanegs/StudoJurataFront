import * as S from './styles'
import type { CardProps } from './types'

export function Card({
  children,
  titulo,
  icon,
  actions,
  semPadding = false,
  elevacao = 'default',
  ...rest
}: CardProps) {
  const temCabecalho = Boolean(titulo || actions)

  return (
    <S.Container $semPadding={semPadding} $elevacao={elevacao} {...rest}>
      {temCabecalho && (
        <S.Cabecalho>
          <S.TituloBloco>
            {icon && <S.Icone aria-hidden="true">{icon}</S.Icone>}
            {titulo && <S.Titulo>{titulo}</S.Titulo>}
          </S.TituloBloco>

          {actions && <S.Acoes>{actions}</S.Acoes>}
        </S.Cabecalho>
      )}

      <S.Corpo $semPadding={semPadding}>{children}</S.Corpo>
    </S.Container>
  )
}
