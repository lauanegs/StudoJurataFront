import type { ReactNode } from 'react'
import styled from 'styled-components'

import { theme as tokens } from '../../../styles/theme'
import { comTamanho } from '../../../utils/redimensionarIcone'

const Container = styled.article`
  display: flex;
  align-items: center;
  flex: 1 0 0;
  gap: ${({ theme }) => theme.spacing.md};

  padding: ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.base};
`

const Icone = styled.div<{ $bg: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 48px;
  height: 48px;

  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ $bg }) => $bg};
  color: ${({ theme }) => theme.colors.white};
`

const Textos = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  min-width: 0;
`

const Valor = styled.strong`
  font-size: 28px;
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  letter-spacing: -0.5px;
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-variant-numeric: tabular-nums;
`

/* Cinza neutro: verde sugeriria "acerto" num indicador que é contagem, não taxa. */
const Selo = styled.span`
  display: inline-flex;
  align-items: center;
  white-space: nowrap;

  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.textTertiary};
`

type Tom = 'purple' | 'blue' | 'success' | 'orange'

// Badge em cor sólida com ícone branco: fundo suave não destacava o suficiente.
const CORES: Record<Tom, string> = {
  purple: tokens.colors.purple,
  blue: tokens.colors.blue,
  success: tokens.colors.success,
  orange: tokens.colors.orange,
}

interface InfoCardProps {
  value: ReactNode
  label: string
  /** Ícone pra memória visual — ajuda a diferenciar os cards num relance, sem depender só do texto do rótulo. */
  icon?: ReactNode
  /** @default 'purple' */
  tom?: Tom
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
