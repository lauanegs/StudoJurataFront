import type { ReactNode } from 'react'
import styled from 'styled-components'
import { Inbox } from 'lucide-react'

import { Container, Descricao, Icone, Titulo } from './styles'

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
      {descricao && <Descricao $larguraMaxima="380px">{descricao}</Descricao>}
      {acao && <Acao>{acao}</Acao>}
    </Container>
  )
}
