import styled from 'styled-components'
export const CamposCabecalho = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`

export const CampoLargura = styled.div<{ $largura: string }>`
  width: ${({ $largura }) => $largura};
  max-width: 100%;
`

export const BotoesFlutuantes = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.xs};
`

export const BotaoSalvar = styled.div`
  flex-shrink: 0;
`

export const ColunaCargaHoraria = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  min-width: 130px;
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
