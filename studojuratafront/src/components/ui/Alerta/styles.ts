import styled, { type DefaultTheme } from 'styled-components'

import { corComOpacidade } from '@/utils/corComOpacidade'
import type { CoresAlerta, TomAlerta } from './types'

const cores = (theme: DefaultTheme): Record<TomAlerta, CoresAlerta> => ({
  success: { cor: theme.colors.success, glifo: theme.colors.white },
  warning: { cor: theme.colors.warning, glifo: theme.colors.warningText },
  error: { cor: theme.colors.error, glifo: theme.colors.white },
  info: { cor: theme.colors.info, glifo: theme.colors.white },
})

export const Container = styled.div<{ $tom: TomAlerta }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};

  width: 100%;
  padding: 20px 28px;

  background-color: ${({ theme }) => theme.colors.white};
  background-image: ${({ $tom, theme }) => {
    const tinta = corComOpacidade(cores(theme)[$tom].cor, 0.02)
    return `linear-gradient(${tinta}, ${tinta})`
  }};
  border: 3px solid ${({ $tom, theme }) => corComOpacidade(cores(theme)[$tom].cor, 0.8)};
  border-radius: 12px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-wrap: wrap;
    padding: ${({ theme }) => theme.spacing.md};
  }
`

export const Icone = styled.span<{ $tom: TomAlerta }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 40px;
  height: 40px;

  background: ${({ $tom, theme }) => cores(theme)[$tom].cor};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ $tom, theme }) => cores(theme)[$tom].glifo};

  svg {
    width: 20px;
    height: 20px;
  }
`

export const Conteudo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  flex: 1 1 0;
  min-width: 0;
  align-self: center;
`

export const Titulo = styled.strong`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const Descricao = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const Acao = styled.div`
  margin-left: auto;
  align-self: center;
  flex-shrink: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex: 1 1 100%;
    margin-left: 0;

    & > * {
      width: 100%;
    }
  }
`
