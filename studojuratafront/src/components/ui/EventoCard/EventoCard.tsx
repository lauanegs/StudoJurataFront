import { Pencil, Trash2 } from 'lucide-react'
import * as S from './styles'
import type { EventoCardProps } from './types'

export function EventoCard({ titulo, data, descricao, onEdit, onDelete }: EventoCardProps) {
  return (
    <S.Container>
      <S.Titulo>{titulo}</S.Titulo>
      <S.Data>{data}</S.Data>
      {descricao && <S.Descricao>{descricao}</S.Descricao>}

      <S.Acoes>
        <Pencil size={16} onClick={onEdit} />
        <Trash2 size={16} onClick={onDelete} />
      </S.Acoes>
    </S.Container>
  )
}
