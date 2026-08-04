import styled from 'styled-components'

import { calcularNivel } from './calcularNivel'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  width: 100%;
`

const Linha = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xs};
`

const Nivel = styled.strong`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.white};
`

const Contagem = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.85;
  font-variant-numeric: tabular-nums;
`

const Trilha = styled.div`
  width: 100%;
  height: 10px;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: rgba(255, 255, 255, 0.28);
  overflow: hidden;
`

const Preenchimento = styled.div<{ $percentual: number }>`
  width: ${({ $percentual }) => $percentual}%;
  height: 100%;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.colors.warning};
  transition: width 500ms ease;
`

interface XPBarProps {
  xpTotal: number
}

export function XPBar({ xpTotal }: XPBarProps) {
  const { nivel, xpNoNivel, xpParaProximo, percentual } = calcularNivel(xpTotal)

  return (
    <Container>
      <Linha>
        <Nivel>Nível {nivel}</Nivel>
        <Contagem>
          {xpNoNivel} / {xpParaProximo} XP
        </Contagem>
      </Linha>

      <Trilha
        role="progressbar"
        aria-valuenow={Math.round(percentual)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progresso do nível ${nivel}`}
      >
        <Preenchimento $percentual={percentual} />
      </Trilha>
    </Container>
  )
}
