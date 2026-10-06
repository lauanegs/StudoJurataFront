import { Alert } from '@mantine/core'
import { Info } from 'lucide-react'

import { comTamanho } from '@/utils/redimensionarIcone'

import { estilosAlerta } from './styles'
import type { AlertaProps } from './types'

export function Alerta({ titulo, children }: AlertaProps) {
  return (
    <Alert
      title={titulo}
      icon={comTamanho(<Info />, 18)}
      radius="md"
      styles={estilosAlerta}
    >
      {children}
    </Alert>
  )
}
