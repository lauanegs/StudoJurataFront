import styled from 'styled-components'
export const BotoesFlutuantes = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.xs};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;

    & > button {
      width: 100%;
      min-height: 44px;
      border: 2px solid ${({ theme }) => theme.colors.borderStrong};
    }
  }
`

export const ColunaCargaHoraria = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  min-width: 130px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex: 1 1 100%;
    min-width: 0;
  }
`

export const TrilhaCargaHoraria = styled.div`
  height: 6px;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`

export const PreenchimentoCargaHoraria = styled.div<{ $percentual: number }>`
  height: 100%;
  width: ${({ $percentual }) => Math.min(100, $percentual)}%;
  background: ${({ theme }) => theme.colors.purple};
  border-radius: inherit;
`
