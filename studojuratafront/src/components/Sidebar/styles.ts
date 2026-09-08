import styled, { css } from 'styled-components'

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndex.sidebar};
  background: rgba(24, 39, 75, 0.4);

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none;
  }
`

export const Container = styled.aside<{ $colapsada: boolean; $abertaNoMobile: boolean }>`
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.sidebar};

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.lg};

  width: ${({ theme, $colapsada }) =>
    $colapsada ? theme.layout.sidebarWidthCollapsed : theme.layout.sidebarWidth};
  height: 100vh;
  flex-shrink: 0;

  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.sm};

  background: ${({ theme }) => theme.gradients.sidebar};
  color: ${({ theme }) => theme.colors.white};

  transition: width ${({ theme }) => theme.transition.base};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    position: fixed;
    left: 0;
    top: 0;

    width: ${({ theme }) => theme.layout.sidebarWidth};
    transform: translateX(${({ $abertaNoMobile }) => ($abertaNoMobile ? '0' : '-100%')});
    transition: transform ${({ theme }) => theme.transition.base};
    box-shadow: ${({ theme }) => theme.shadow.modal};
  }
`

export const Topo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  min-height: 0;
`

export const BotaoColapso = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: flex-end;

  width: 32px;
  height: 32px;

  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.white};
  background: rgba(255, 255, 255, 0.15);

  transition: background ${({ theme }) => theme.transition.fast};

  &:hover {
    background: rgba(255, 255, 255, 0.28);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.white};
    outline-offset: 2px;
  }

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none;
  }
`

export const BlocoUsuario = styled.div<{ $colapsada: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  padding: 0 ${({ theme }) => theme.spacing.xs};

  ${({ $colapsada }) =>
    $colapsada &&
    css`
      justify-content: center;
      padding: 0;
    `}
`

export const DadosUsuario = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`

export const NomeUsuario = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.white};

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const CargoUsuario = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.8;
`

export const Navegacao = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};

  overflow-y: auto;
  min-height: 0;
  overscroll-behavior-y: contain;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
  }
`

/**
 * Doc §9.5: o Figma não definia estilo para o item ativo. Aqui ele ganhou
 * fundo branco translúcido, texto em peso maior e um indicador na lateral
 * esquerda — suficiente para leitura rápida sem depender só da cor.
 */
export const ItemNav = styled.button<{ $ativo: boolean; $colapsada: boolean }>`
  position: relative;

  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};

  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.white};
  text-align: left;

  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme, $ativo }) =>
    $ativo ? theme.typography.weights.semiBold : theme.typography.weights.regular};

  /* Confirmado no Figma: item ativo tem fundo azul-claro sólido, não branco translúcido. */
  background: ${({ theme, $ativo }) => ($ativo ? theme.colors.blueLight : 'transparent')};

  transition:
    background ${({ theme }) => theme.transition.fast},
    padding ${({ theme }) => theme.transition.base};

  ${({ $colapsada }) =>
    $colapsada &&
    css`
      justify-content: center;
      padding: 12px 0;
    `}

  &:hover {
    background: rgba(255, 255, 255, 0.14);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.white};
    outline-offset: -2px;
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 20%;
    bottom: 20%;

    width: 3px;
    border-radius: 0 3px 3px 0;
    background: ${({ theme }) => theme.colors.white};

    opacity: ${({ $ativo }) => ($ativo ? 1 : 0)};
    transition: opacity ${({ theme }) => theme.transition.fast};
  }

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
`

export const RotuloItem = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const Rodape = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`

export const BotaoSair = styled.button<{ $colapsada: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $colapsada }) => ($colapsada ? 'center' : 'flex-start')};
  gap: ${({ theme }) => theme.spacing.sm};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};

  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.typography.sizes.sm};

  transition: background ${({ theme }) => theme.transition.fast};

  &:hover {
    background: rgba(255, 255, 255, 0.14);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.white};
    outline-offset: -2px;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`

export const Marca = styled.div<{ $colapsada: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  padding: ${({ theme }) => theme.spacing.xs};

  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.md};

  ${({ $colapsada }) =>
    $colapsada &&
    css`
      justify-content: center;
    `}
`

export const LogoMarca = styled.img`
  width: 36px;
  height: 36px;
  object-fit: contain;
`

export const TextoMarca = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;

  strong {
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    font-weight: ${({ theme }) => theme.typography.weights.semiBold};
    color: ${({ theme }) => theme.colors.purple};
    line-height: 1.2;
  }

  small {
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.2;
  }
`
