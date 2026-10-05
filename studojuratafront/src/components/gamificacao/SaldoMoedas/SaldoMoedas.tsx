import { MoedaIcone } from '@/components/gamificacao/MoedaIcone'
import { formatarMoedas } from '@/utils/format'

import { Container } from './styles'
import type { SaldoMoedasProps } from './types'

export function SaldoMoedas({ moedas, sufixo = 'moedas' }: SaldoMoedasProps) {
  return (
    <Container>
      <MoedaIcone size={20} aria-hidden="true" />
      {formatarMoedas(moedas)} {sufixo}
    </Container>
  )
}
