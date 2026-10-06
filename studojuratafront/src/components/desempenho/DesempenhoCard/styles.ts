import styled from 'styled-components'

export const Container = styled.article<{ $clicavel: boolean; $horizontal: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  width: 100%;
  height: 100%;
  padding: ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};

  ${({ $horizontal }) =>
    $horizontal &&
    `
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    `}

  ${({ $clicavel, theme }) =>
    $clicavel &&
    `
      cursor: pointer;
      transition: box-shadow ${theme.transition.fast}, transform ${theme.transition.fast};

      &:hover {
        box-shadow: ${theme.shadow.base};
        transform: translateY(-1px);
      }

      &:focus-visible {
        outline: none;
        box-shadow: ${theme.shadow.focus};
      }
    `}
`

export const Cabecalho = styled.div<{ $horizontal: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;

  ${({ $horizontal }) => $horizontal && `flex: 1;`}
`

export const IconeSelo = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 28px;
  height: 28px;

  color: ${({ theme }) => theme.colors.textTertiary};
`

export const Conteudo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 0;
`

export const Titulo = styled.strong`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const Descricao = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textTertiary};
`

export const BarraPorcentagem = styled.div<{ $cor: string; $horizontal: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;

  padding: ${({ theme }) => theme.spacing.sm};

  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ $cor }) => $cor};

  ${({ $horizontal }) =>
    $horizontal
      ? `
      flex-shrink: 0;
      min-width: 96px;
    `
      : `
      margin-top: auto;
    `}
`

export const Valor = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.white};
  font-variant-numeric: tabular-nums;
`
