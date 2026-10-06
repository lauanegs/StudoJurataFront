import styled from 'styled-components'

export const Bloco = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};

  width: 100%;
  max-width: 400px;
`

export const Logo = styled.img`
  width: clamp(90px, 14vh, 140px);
  height: clamp(90px, 14vh, 140px);
  object-fit: cover;
`

export const Titulos = styled.div`
  text-align: center;
`

export const Titulo = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.title};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textSecondary};
  letter-spacing: -0.6px;
`

export const Subtitulo = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
`

/* Se houver muitos cursos a lista rola, sem fazer a tela inteira rolar. */
export const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  width: 100%;
  max-height: 38vh;
  overflow-y: auto;
  padding: 2px;
`

export const CartaoCurso = styled.button`
  display: flex;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing.md};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.white};
  border: 2px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.md};
  text-align: left;
  cursor: pointer;
  transition: border-color ${({ theme }) => theme.transition.base};

  &:hover {
    border-color: ${({ theme }) => theme.colors.blue};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }

`

/* Quadrado azul na altura útil do card (até o padding), com o símbolo em branco. */
export const IconeQuadrado = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  align-self: stretch;
  aspect-ratio: 1;
  border-radius: ${({ theme }) => theme.radius.sm};

  background: ${({ theme }) => theme.colors.blue};
  color: ${({ theme }) => theme.colors.white};

  svg {
    width: 24px;
    height: 24px;
  }
`

export const Textos = styled.span`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  flex: 1;
`

export const SituacaoDaMatricula = styled.span`
  display: inline-flex;
  align-items: center;
`

export const NomeCurso = styled.strong`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const NomeTurma = styled.small`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const BotaoVoltar = styled.div`
  width: 100%;
  max-width: 300px;
`
