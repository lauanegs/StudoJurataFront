import styled from 'styled-components'

export const Tela = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};

  width: 100%;
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.lg};

  text-align: center;
`

export const Icone = styled.div<{ $fundo: string; $cor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 88px;
  height: 88px;

  border-radius: ${({ theme }) => theme.radius.circle};
  background: ${({ $fundo }) => $fundo};
  color: ${({ $cor }) => $cor};

  svg {
    width: 40px;
    height: 40px;
  }
`

export const Titulo = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.textStrong};
`

export const Descricao = styled.p<{ $larguraMaxima: string }>`
  max-width: ${({ $larguraMaxima }) => $larguraMaxima};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`
