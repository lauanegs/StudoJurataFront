import styled from 'styled-components'
import { AlertTriangle } from 'lucide-react'

import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

const Corpo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};

  padding-bottom: ${({ theme }) => theme.spacing.xs};
`

const Icone = styled.div<{ $perigo: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 44px;
  height: 44px;

  border-radius: ${({ theme }) => theme.radius.circle};
  background: ${({ theme, $perigo }) => ($perigo ? theme.colors.errorBackground : theme.colors.infoBackground)};
  color: ${({ theme, $perigo }) => ($perigo ? theme.colors.error : theme.colors.blue)};

  svg {
    width: 20px;
    height: 20px;
  }
`

const Descricao = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`

interface ConfirmDialogProps {
  aberto: boolean
  titulo: string
  descricao?: string
  rotuloConfirmar?: string
  rotuloCancelar?: string
  tone?: 'danger' | 'default'
  processando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

export function ConfirmDialog({
  aberto,
  titulo,
  descricao,
  rotuloConfirmar = 'Confirmar',
  rotuloCancelar = 'Cancelar',
  tone = 'default',
  processando = false,
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) {
  const perigo = tone === 'danger'

  return (
    <Modal
      aberto={aberto}
      onClose={onCancelar}
      titulo={titulo}
      largura="440px"
      bloqueado={processando}
      rodape={
        <>
          <Button variant="secondary" onClick={onCancelar} disabled={processando}>
            {rotuloCancelar}
          </Button>
          <Button
            variant={perigo ? 'danger' : 'primary'}
            onClick={onConfirmar}
            loading={processando}
          >
            {rotuloConfirmar}
          </Button>
        </>
      }
    >
      <Corpo>
        <Icone $perigo={perigo} aria-hidden="true">
          <AlertTriangle />
        </Icone>

        {descricao && <Descricao>{descricao}</Descricao>}
      </Corpo>
    </Modal>
  )
}
