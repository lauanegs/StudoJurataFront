import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  width: 100%;
  min-height: 100vh;
`

export const Area = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`

export const BarraMobile = styled.header`
  display: none;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.gradients.sidebar};
  color: ${({ theme }) => theme.colors.white};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: flex;
  }
`

export const BotaoMenu = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 36px;
  height: 36px;

  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.white};
  background: rgba(255, 255, 255, 0.18);

  svg {
    width: 20px;
    height: 20px;
  }
`

export const TituloMobile = styled.strong`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
`

export const Conteudo = styled.main<{ $largura: 'default' | 'wide' }>`
  flex: 1;
  min-width: 0;

  width: 100%;
  max-width: ${({ theme, $largura }) =>
    $largura === 'wide' ? 'none' : theme.layout.contentWidth};
  margin: 0 auto;

  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};

  padding: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.md};
    gap: ${({ theme }) => theme.spacing.md};
  }
`
