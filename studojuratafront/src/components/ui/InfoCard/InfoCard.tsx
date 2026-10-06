import { theme as tokens } from '@/styles/theme'
import { comTamanho } from '@/utils/redimensionarIcone'

import { Container, Icone, Textos, Valor, Selo } from './styles'
import type { Tom, InfoCardProps } from './types'

const CORES: Record<Tom, string> = {
  purple: tokens.colors.purple,
  blue: tokens.colors.blue,
  success: tokens.colors.success,
  orange: tokens.colors.orange,
}

export function InfoCard({ value, label, icon, tom = 'purple' }: InfoCardProps) {
  return (
    <Container>
      {icon && (
        <Icone $bg={CORES[tom]} aria-hidden="true">
          {comTamanho(icon, 22)}
        </Icone>
      )}
      <Textos>
        <Valor>{value}</Valor>
        <Selo>{label}</Selo>
      </Textos>
    </Container>
  )
}
