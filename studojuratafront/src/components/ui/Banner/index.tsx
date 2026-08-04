import type { ReactNode } from 'react'
import styled from 'styled-components'

const Container = styled.section`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.lg};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xxl};

  background: ${({ theme }) => theme.gradients.banner};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.floating};
  overflow: hidden;

  /* Brilho decorativo — apenas visual, não interativo. */
  &::after {
    content: '';
    position: absolute;
    top: -60%;
    right: -10%;
    width: 320px;
    height: 320px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    pointer-events: none;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
    text-align: center;
    padding: ${({ theme }) => theme.spacing.lg};
  }
`

const Conteudo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  min-width: 0;
  z-index: 1;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
  }
`

const Mascote = styled.img`
  width: 120px;
  height: auto;
  flex-shrink: 0;
  object-fit: contain;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 88px;
  }
`

const Textos = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 0;
`

const Titulo = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  color: ${({ theme }) => theme.colors.white};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: ${({ theme }) => theme.typography.sizes.lg};
  }
`

const Subtitulo = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.92;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: ${({ theme }) => theme.typography.sizes.xs};
  }
`

const Extra = styled.div`
  z-index: 1;
  flex-shrink: 0;
`

export interface BannerProps {
  titulo?: string
  subtitulo?: string
  mascoteSrc?: string
  /** Slot à direita: contador de moedas, XP, ação rápida. */
  extra?: ReactNode
}

export function Banner({
  titulo = 'Bem-vindo ao Studo Jurata!',
  subtitulo = 'Vamos estudar muito juntos, aprender nunca foi tão fácil!',
  mascoteSrc = '/images/mascote.png',
  extra,
}: BannerProps) {
  return (
    <Container>
      <Conteudo>
        <Mascote src={mascoteSrc} alt="" aria-hidden="true" />

        <Textos>
          <Titulo>{titulo}</Titulo>
          <Subtitulo>{subtitulo}</Subtitulo>
        </Textos>
      </Conteudo>

      {extra && <Extra>{extra}</Extra>}
    </Container>
  )
}
