import type { ReactNode } from 'react'
import styled from 'styled-components'

import { Button } from '../Button'

const Linha = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`

interface RodapeDosPassosProps {
  /** Ausente no primeiro passo. */
  aoVoltar?: () => void
  aoAvancar: () => void
  rotuloAvancar: string
  iconeAvancar?: ReactNode
  carregando?: boolean
}

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
