import { Button } from '@/components/ui/Button'

import { Linha } from './styles'
import type { RodapeDosPassosProps } from './types'

/** Botões Voltar / Próximo abaixo do conteúdo de um passo do Stepper. */
export function RodapeDosPassos({ aoVoltar, aoAvancar, rotuloAvancar, iconeAvancar, carregando }: RodapeDosPassosProps) {
  return (
    <Linha>
      {aoVoltar ? (
        <Button variant="secondary" onClick={aoVoltar} disabled={carregando}>
          Voltar
        </Button>
      ) : (
        <span />
      )}
      <Button icon={iconeAvancar} loading={carregando} onClick={aoAvancar}>
        {rotuloAvancar}
      </Button>
    </Linha>
  )
}
