import { Alert } from '@mantine/core'
import { Info } from 'lucide-react'

import { theme as tokens } from '@/styles/theme'
import { comTamanho } from '@/utils/redimensionarIcone'

import type { AlertaProps } from './types'

/** Aviso informativo fixo (não é toast): orienta o preenchimento de um campo ou tela. */
export function Alerta({ titulo, children }: AlertaProps) {
  return (
    <Alert
      title={titulo}
      icon={comTamanho(<Info />, 18)}
      radius="md"
      styles={{
        root: { backgroundColor: tokens.colors.infoBackground, border: `1px solid ${tokens.colors.info}` },
        title: { color: tokens.colors.infoText, fontWeight: tokens.typography.weights.semiBold },
        message: { color: tokens.colors.textSecondary, fontSize: tokens.typography.sizes.sm },
        icon: { color: tokens.colors.info },
      }}
    >
      {children}
    </Alert>
  )
}
