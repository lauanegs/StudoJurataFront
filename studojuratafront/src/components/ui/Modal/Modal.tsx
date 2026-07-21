import { X } from 'lucide-react'
import * as S from './styles'
import type { ModalProps } from './types'

export function Modal({ isOpen, onClose, title, children, width }: ModalProps) {
  if (!isOpen) return null

  return (
    <S.Overlay onClick={onClose}>
      <S.Container $width={width} onClick={(e) => e.stopPropagation()}>
        <S.Header>
          <S.Title>{title}</S.Title>
          <S.CloseButton onClick={onClose} aria-label="Fechar">
            <X size={22} />
          </S.CloseButton>
        </S.Header>

        {children}
      </S.Container>
    </S.Overlay>
  )
}
