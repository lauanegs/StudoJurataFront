import styled, { keyframes } from 'styled-components'

const surgir = keyframes`
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`

const aparecer = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndex.modal};

  display: flex;
  align-items: center;
  justify-content: center;

  padding: ${({ theme }) => theme.spacing.lg};

  /* Doc §6.5: overlay com desfoque de fundo. */
  background: rgba(24, 39, 75, 0.35);
  backdrop-filter: blur(4px);

  animation: ${aparecer} ${({ theme }) => theme.transition.base};
`

export const Container = styled.div<{ $largura?: string }>`
  display: flex;
  flex-direction: column;

  width: 100%;
  max-width: ${({ $largura }) => $largura ?? '440px'};
  max-height: 90vh;

  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.floating};

  animation: ${surgir} ${({ theme }) => theme.transition.base};
`

export const Cabecalho = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};

  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xl} 0;
`

export const Titulos = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
`

export const Titulo = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const Descricao = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const Corpo = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
`

export const Rodape = styled.footer`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};

  padding: 0 ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xl};
`
