import styled, { css } from 'styled-components'

export const Container = styled.section<{
  $semPadding: boolean
  $elevacao: 'none' | 'default' | 'medium'
}>`
  display: flex;
  flex-direction: column;

  width: 100%;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.lg};

  ${({ theme, $elevacao }) =>
    ({
      none: css`
        border: 1px solid ${theme.colors.border};
      `,
      default: css`
        box-shadow: ${theme.shadow.base};
      `,
      medium: css`
        box-shadow: ${theme.shadow.card};
      `,
    })[$elevacao]}

  overflow: hidden;
`

export const Cabecalho = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;

  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

export const TituloBloco = styled.div`
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

  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.gradients.primary};
  color: ${({ theme }) => theme.colors.white};

  svg {
    width: 16px;
    height: 16px;
  }
`

export const Titulo = styled.h2`
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
  padding: ${({ theme, $semPadding }) => ($semPadding ? '0' : `${theme.spacing.lg}`)};
`
