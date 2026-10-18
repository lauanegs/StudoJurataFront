import styled from 'styled-components'

export const Tela = styled.div`
  position: relative;
  overflow: hidden;

  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;

  background: ${({ theme }) => theme.colors.white};
`

export const Banner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 0;

  height: clamp(230px, min(28vw, 38vh), 360px);
  overflow: hidden;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    height: 220px;
  }
`

export const Gradiente = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.gradients.border};
`

export const ImagemBanner = styled.img`
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.15;
`

export const Recorte = styled.img`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);

  width: 1280px;
  height: 368px;
  pointer-events: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: max(100%, 640px);
    height: auto;
  }
`

export const Conteudo = styled.div`
  position: relative;
  z-index: 1;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  min-height: inherit;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    justify-content: flex-start;
    padding: 176px ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  }
`
