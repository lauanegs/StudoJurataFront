import * as S from './styles'
import type { AlternativaButtonProps } from './types'

export function AlternativaButton({
  letra,
  texto,
  selecionado,
  onClick
}: AlternativaButtonProps) {
  return (
    <S.Container selecionado={selecionado} onClick={onClick}>
      <S.LetraBox selecionado={selecionado}>{letra}</S.LetraBox>
      <S.TextoBox>{texto}</S.TextoBox>
    </S.Container>
  )
}