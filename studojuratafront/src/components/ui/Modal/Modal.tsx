import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

import { IconButton } from '../IconButton'
import * as S from './styles'
import type { ModalProps } from './types'

export function Modal({
  aberto,
  onClose,
  titulo,
  descricao,
  children,
  rodape,
  largura,
  bloqueado = false,
}: ModalProps) {
  const idTitulo = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const focoAnterior = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!aberto) return

    focoAnterior.current = document.activeElement as HTMLElement
    const overflowOriginal = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    requestAnimationFrame(() => {
      const focavel = containerRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      focavel?.focus()
    })

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape' && !bloqueado) {
        onClose()
        return
      }

      if (evento.key !== 'Tab') return

      const focaveis = containerRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focaveis || focaveis.length === 0) return

      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]

      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primeiro.focus()
      }
    }

    document.addEventListener('keydown', aoTeclar)

    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = overflowOriginal
      focoAnterior.current?.focus()
    }
  }, [aberto, onClose, bloqueado])

  if (!aberto) return null

  return createPortal(
    <S.Overlay onMouseDown={(evento) => evento.target === evento.currentTarget && !bloqueado && onClose()}>
      <S.Container
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        $largura={largura}
      >
        <S.Cabecalho>
          <S.Titulos>
            <S.Titulo id={idTitulo}>{titulo}</S.Titulo>
            {descricao && <S.Descricao>{descricao}</S.Descricao>}
          </S.Titulos>

          <IconButton label="Fechar" icon={<X />} onClick={onClose} disabled={bloqueado} />
        </S.Cabecalho>

        <S.Corpo>{children}</S.Corpo>

        {rodape && <S.Rodape>{rodape}</S.Rodape>}
      </S.Container>
    </S.Overlay>,
    document.body,
  )
}
