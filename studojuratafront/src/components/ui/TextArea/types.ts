import type { TextareaHTMLAttributes } from 'react'

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  required?: boolean
  hint?: string
  error?: string
  /** Cresce sozinho conforme o conteúdo, respeitando `rows` como mínimo. */
  autoAltura?: boolean
}
