import type { ReactNode } from 'react'
import styled from 'styled-components'
import { Inbox } from 'lucide-react'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.lg};
  text-align: center;
`

const Icone = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 64px;
  height: 64px;

  border-radius: ${({ theme }) => theme.radius.circle};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textTertiary};

  svg {
    width: 28px;
    height: 28px;
  }
`

const Titulo = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textStrong};
`

const Descricao = styled.p`
  max-width: 380px;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const Acao = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs};
`

interface EstadoVazioProps {
  titulo: string
  descricao?: string
  icon?: ReactNode
  acao?: ReactNode
}

/**
 * Estado vazio de listas e tabelas. Sempre explica o porquê e, quando faz
 * sentido, oferece a ação que resolve (ex.: "Cadastrar primeira turma").
 */
export function EstadoVazio({ titulo, descricao, icon, acao }: EstadoVazioProps) {
  return (
    <Container>
      <Icone aria-hidden="true">{icon ?? <Inbox />}</Icone>
      <Titulo>{titulo}</Titulo>
      {descricao && <Descricao>{descricao}</Descricao>}
      {acao && <Acao>{acao}</Acao>}
    </Container>
  )
}
