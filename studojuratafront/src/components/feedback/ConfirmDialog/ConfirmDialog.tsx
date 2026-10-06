import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

import { Corpo, Descricao, Icone } from './styles'
import type { ConfirmDialogProps } from './types'


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
