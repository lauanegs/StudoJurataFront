import { Table } from '@mantine/core'
import styled from 'styled-components'

import { corComOpacidade } from '@/utils/corComOpacidade'
import type { Alinhamento, Densidade } from './types'

export const Envelope = styled.div`
  width: 100%;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadow.base};
`

export const Rolagem = styled.div`
  width: 100%;
  overflow-x: auto;
`

export const RotuloOrdenavel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
`

export const Tabela = styled(Table)<{ $densidade: Densidade }>`
  width: 100%;

  thead {
    background: ${({ theme }) => corComOpacidade(theme.colors.background, 0.3)};
  }

  th {
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
    font-size: ${({ theme }) => theme.typography.sizes.md};
    font-weight: ${({ theme }) => theme.typography.weights.semiBold};
    letter-spacing: -0.8px;
    color: ${({ theme }) => theme.colors.textSecondary};
    white-space: nowrap;
  }

  tr {
    border-bottom: 2px solid ${({ theme }) => corComOpacidade(theme.colors.textTertiary, 0.1)};
  }

  tbody tr:last-child {
    border-bottom: none;
  }

  td {
    padding: ${({ $densidade, theme }) => `${$densidade === 'compacta' ? theme.spacing.xs : theme.spacing.sm} ${theme.spacing.lg}`};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    vertical-align: middle;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    &,
    tbody {
      display: block;
      width: 100%;
    }

    thead {
      display: none;
    }

    tr {
      display: flex;
      flex-direction: column;
      gap: ${({ theme }) => theme.spacing.xxs};
      padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
    }

    td {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: ${({ theme }) => theme.spacing.sm};
      padding: ${({ theme }) => theme.spacing.xxs} 0;
      text-align: right;
      border: none;
    }

    td.oculta-tela-pequena {
      display: flex;
    }

    td[data-label]::before {
      content: attr(data-label);
      flex-shrink: 0;
      font-size: ${({ theme }) => theme.typography.sizes.xs};
      font-weight: ${({ theme }) => theme.typography.weights.semiBold};
      color: ${({ theme }) => theme.colors.textTertiary};
      text-align: left;
    }

    td:first-child {
      justify-content: flex-start;
      text-align: left;
      font-size: ${({ theme }) => theme.typography.sizes.md};
      font-weight: ${({ theme }) => theme.typography.weights.semiBold};
      color: ${({ theme }) => theme.colors.textStrong};
    }

    td:first-child::before {
      display: none;
    }

    td:not([data-label]):last-child {
      justify-content: flex-end;
    }
  }
`

export const Cabecalho = styled(Table.Th)<{ $largura?: string; $alinhamento?: Alinhamento; $ordenavel?: boolean }>`
  width: ${({ $largura }) => $largura ?? 'auto'};
  text-align: ${({ $alinhamento }) => $alinhamento ?? 'left'};
  cursor: ${({ $ordenavel }) => ($ordenavel ? 'pointer' : 'auto')};
  user-select: ${({ $ordenavel }) => ($ordenavel ? 'none' : 'auto')};
`

export const CabecalhoAcoes = styled(Table.Th)<{ $quebrar: boolean }>`
  text-align: left;
  width: ${({ $quebrar }) => ($quebrar ? 'auto' : '1%')};
  white-space: ${({ $quebrar }) => ($quebrar ? 'normal' : 'nowrap')};
`

export const Linha = styled(Table.Tr)<{ $clicavel: boolean }>`
  cursor: ${({ $clicavel }) => ($clicavel ? 'pointer' : 'auto')};
`

export const Celula = styled(Table.Td)<{ $alinhamento?: Alinhamento }>`
  text-align: ${({ $alinhamento }) => $alinhamento ?? 'left'};
`

export const CelulaAcoes = styled(Table.Td)<{ $quebrar: boolean }>`
  text-align: left;
  white-space: ${({ $quebrar }) => ($quebrar ? 'normal' : 'nowrap')};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding-top: ${({ theme }) => theme.spacing.xs};

    & > div {
      flex-direction: column;
      align-items: stretch;
      gap: ${({ theme }) => theme.spacing.xs};
      width: 100%;
    }

    & > div > button {
      width: 100%;
      height: auto;
      min-height: 44px;
      gap: ${({ theme }) => theme.spacing.xs};
      padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
      border: 2px solid ${({ theme }) => theme.colors.borderStrong};
      font-size: ${({ theme }) => theme.typography.sizes.sm};
      font-weight: ${({ theme }) => theme.typography.weights.semiBold};
    }

    & > div > button[data-acao]::after {
      content: attr(data-acao);
    }

    & > div > button svg {
      width: 18px;
      height: 18px;
    }
  }
`
