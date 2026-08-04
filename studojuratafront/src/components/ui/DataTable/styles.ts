import styled, { css } from 'styled-components'

export const Container = styled.div`
  width: 100%;

  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.floating};
  overflow: hidden;
`

export const Rolagem = styled.div`
  width: 100%;
  overflow-x: auto;
`

export const Tabela = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`

export const Cabecalho = styled.thead`
  background: rgba(230, 234, 242, 0.3);
`

export const Th = styled.th<{
  $largura?: string
  $alinhamento?: 'left' | 'center' | 'right'
  $ordenavel?: boolean
  $ocultarEmTelaPequena?: boolean
}>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  width: ${({ $largura }) => $largura ?? 'auto'};
  text-align: ${({ $alinhamento }) => $alinhamento ?? 'left'};
  white-space: nowrap;

  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  letter-spacing: -0.8px;
  color: ${({ theme }) => theme.colors.textSecondary};

  ${({ $ordenavel, theme }) =>
    $ordenavel &&
    css`
      cursor: pointer;
      user-select: none;

      &:hover {
        color: ${theme.colors.purple};
      }
    `}

  ${({ $ocultarEmTelaPequena, theme }) =>
    $ocultarEmTelaPequena &&
    css`
      @media (max-width: ${theme.breakpoints.tablet}) {
        display: none;
      }
    `}
`

export const ConteudoTh = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};

  svg {
    width: 14px;
    height: 14px;
  }
`

export const Tr = styled.tr<{ $clicavel?: boolean }>`
  border-bottom: 2px solid rgba(115, 115, 115, 0.1);
  transition: background ${({ theme }) => theme.transition.fast};

  &:last-child {
    border-bottom: none;
  }

  ${({ $clicavel, theme }) =>
    $clicavel &&
    css`
      cursor: pointer;

      &:hover {
        background: ${theme.colors.purpleSoft};
      }

      &:focus-visible {
        outline: 2px solid ${theme.colors.purple};
        outline-offset: -2px;
      }
    `}
`

export const Td = styled.td<{
  $alinhamento?: 'left' | 'center' | 'right'
  $densidade: 'confortavel' | 'compacta'
  $ocultarEmTelaPequena?: boolean
}>`
  padding: ${({ theme, $densidade }) =>
      $densidade === 'compacta' ? theme.spacing.xs : theme.spacing.sm}
    ${({ theme }) => theme.spacing.lg};

  text-align: ${({ $alinhamento }) => $alinhamento ?? 'left'};

  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  vertical-align: middle;

  ${({ $ocultarEmTelaPequena, theme }) =>
    $ocultarEmTelaPequena &&
    css`
      @media (max-width: ${theme.breakpoints.tablet}) {
        display: none;
      }
    `}
`

export const CelulaAcoes = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.xxs};
`
