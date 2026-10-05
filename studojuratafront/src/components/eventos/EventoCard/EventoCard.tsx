import { CalendarClock, Check, Pencil, Trash2 } from 'lucide-react'

import { IconButton } from '@/components/ui/IconButton'
import { Tag } from '@/components/ui/Tag'
import { formatarDataHora } from '@/utils/format'

import { Container, Topo, Titulo, Data, Descricao, Acoes } from './styles'
import type { EventoCardProps } from './types'

export function EventoCard({
  titulo,
  dataHorario,
  descricao,
  concluido = false,
  onEdit,
  onDelete,
  onComplete,
}: EventoCardProps) {
  const temAcoes = Boolean(onEdit || onDelete || onComplete)

  return (
    <Container $concluido={concluido}>
      <Topo>
        <Titulo $concluido={concluido}>{titulo}</Titulo>
        {concluido && (
          <Tag variant="success" size="small">
            Concluído
          </Tag>
        )}
      </Topo>

      <Data>
        <CalendarClock aria-hidden="true" />
        {formatarDataHora(dataHorario)}
      </Data>

      {descricao && <Descricao>{descricao}</Descricao>}

      {temAcoes && (
        <Acoes>
          {onComplete && !concluido && (
            <IconButton
              label="Marcar como concluído"
              icon={<Check />}
              variant="success"
              size="small"
              onClick={onComplete}
            />
          )}
          {onEdit && (
            <IconButton label="Editar evento" icon={<Pencil />} size="small" onClick={onEdit} />
          )}
          {onDelete && (
            <IconButton
              label="Excluir evento"
              icon={<Trash2 />}
              variant="danger"
              size="small"
              onClick={onDelete}
            />
          )}
        </Acoes>
      )}
    </Container>
  )
}
