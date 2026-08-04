import styled from 'styled-components'
import { Cake } from 'lucide-react'

import { Avatar } from '../Avatar'

const Container = styled.article`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  width: 180px;
  padding: ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.light};
  text-align: center;
`

const Nome = styled.strong`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`

const Data = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};

  padding: 4px ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.radius.sm};

  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};

  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};

  svg {
    width: 12px;
    height: 12px;
  }
`

const Complemento = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textTertiary};
`

interface AniversarianteCardProps {
  nome: string
  data: string
  /** Ex.: "faz 9 anos" — derivado de Pessoa.dataNascimento. */
  complemento?: string
  hoje?: boolean
  foto?: string | null
}

export function AniversarianteCard({ nome, data, complemento, hoje, foto }: AniversarianteCardProps) {
  return (
    <Container>
      <Avatar nome={nome} src={foto} size="large" destaque={hoje} />
      <Nome>{nome}</Nome>
      <Data>
        <Cake aria-hidden="true" />
        {hoje ? 'Hoje' : data}
      </Data>
      {complemento && <Complemento>{complemento}</Complemento>}
    </Container>
  )
}
