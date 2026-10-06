import styled from 'styled-components'

import { Button } from '@/components/ui/Button'

export const Cartao = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};

  width: 100%;
  max-width: 300px;
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

export const Campos = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;
`

export const LinkEsqueciSenha = styled.a`
  align-self: center;

  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: underline;

  &:hover {
    color: ${({ theme }) => theme.colors.blue};
  }
`

export const Alerta = styled.p`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};

  background: ${({ theme }) => theme.colors.errorBackground};
  border-radius: ${({ theme }) => theme.radius.md};

  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.errorText};
  text-align: center;
`

export const BotaoEntrar = styled(Button)`
  &&,
  &&:hover:not(:disabled) {
    background: ${({ theme }) => theme.gradients.sidebar};
    border-color: ${({ theme }) => theme.colors.blue};
  }
`
