import * as S from './styles'
import type { AlternativaCardProps } from './types'

export function AlternativaCard({
  letra,
  texto,
  status = 'default'
}: AlternativaCardProps) {
  const feedbackMap = {
    correta: 'Resposta correta',
    incorreta: 'Resposta do aluno',
    default: ''
  }

  return (
    <S.Container status={status}>
      <S.Badge status={status}>{letra}</S.Badge>

      <S.Texto>{texto}</S.Texto>

      <S.Feedback status={status}>{feedbackMap[status]}</S.Feedback>
    </S.Container>
  )
}