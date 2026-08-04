import styled from 'styled-components'
import { CalendarClock, Check, Pencil, Trash2 } from 'lucide-react'

import { IconButton } from '../IconButton'
import { Tag } from '../Tag'
import { formatarDataHora } from '../../../utils/format'

const Container = styled.article<{ $concluido: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  width: 100%;
  min-width: 240px;
  padding: ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.light};

  opacity: ${({ $concluido }) => ($concluido ? 0.75 : 1)};
`

const Topo = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xs};
`

const Titulo = styled.strong<{ $concluido: boolean }>`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: ${({ $concluido }) => ($concluido ? 'line-through' : 'none')};
`

const Data = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  align-self: flex-start;

  padding: 4px ${({ theme }) => theme.spacing.xs};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radius.sm};

  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.textSecondary};

  svg {
    width: 12px;
    height: 12px;
  }
`

const Descricao = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};

  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Acoes = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.xxs};
  margin-top: auto;
`

interface EventoCardProps {
  titulo: string
  dataHorario: string
  descricao?: string
  concluido?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onComplete?: () => void
}

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
