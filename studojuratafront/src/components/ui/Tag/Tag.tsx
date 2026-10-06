import { Badge } from '@mantine/core'

import { comTamanho } from '@/utils/redimensionarIcone'
import { CORES, estilosTag, TAMANHOS } from './styles'
import type { TagProps } from './types'

export function Tag({ children, variant = 'neutral', icon, size = 'medium' }: TagProps) {
  const cor = CORES[variant]
  const tamanho = TAMANHOS[size]

  return (
    <Badge
      variant="light"
      radius="sm"
      leftSection={icon && comTamanho(icon, tamanho.icone)}
      styles={estilosTag(cor, tamanho)}
    >
      {children}
    </Badge>
  )
}
