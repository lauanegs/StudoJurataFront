import styled from 'styled-components'

export const Container = styled.div<{ $sombra?: string; $borda?: string; $comFundo: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.white};
  ${({ $sombra }) => $sombra && `box-shadow: ${$sombra};`}
  ${({ $borda }) => $borda && `border: ${$borda};`}
  ${({ $comFundo, theme }) => $comFundo && `background: ${theme.colors.whiteVeil};`}
`

export const Cabecalho = styled.header<{ $comFundo: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  ${({ $comFundo, theme }) => $comFundo && `background: ${theme.colors.white};`}
`

export const Titulo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 0;
`

export const Icone = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const TextoTitulo = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textStrong};
`

export const Acoes = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-wrap: wrap;
`

export const Corpo = styled.div<{ $semPadding: boolean }>`
  flex: 1;
  min-width: 0;
  padding: ${({ $semPadding, theme }) => ($semPadding ? 0 : theme.spacing.lg)};
`
