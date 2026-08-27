import type { ReactNode } from 'react'
import styled from 'styled-components'

import { corComOpacidade } from '../../../utils/corComOpacidade'

const Container = styled.article`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};

  height: 100%;
  padding: ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.base};
`

const Anel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 100px;
  height: 100px;

  border: 4px solid ${({ theme }) => theme.colors.background};
  border-radius: 300px;
`

const Valor = styled.strong`
  font-size: 38px;
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  letter-spacing: -1.9px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-variant-numeric: tabular-nums;
`

/* Confirmado no Figma (frame "home - professor", nós 1:3368/1:3374): o selo
   abaixo do número usa sempre o mesmo verde translúcido, independente da
   categoria do indicador — não é uma cor por tom. */
const Selo = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;

  padding: 4px 8px;

  background: ${corComOpacidade('#18CB53', 0.3)};
  border-radius: 4px;

  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
`

interface InfoCardProps {
  value: ReactNode
  label: string
}

export function InfoCard({ value, label }: InfoCardProps) {
  return (
    <Container>
      <Anel>
        <Valor>{value}</Valor>
      </Anel>
      <Selo>{label}</Selo>
    </Container>
  )
}
