import { Cake } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'

import { Container, Nome, Data, Complemento, Moldura } from './styles'
import type { AniversarianteCardProps } from './types'

export function AniversarianteCard({ nome, data, complemento, hoje, foto }: AniversarianteCardProps) {
  return (
    <Container>
      <Moldura>
        <Avatar nome={nome} src={foto} size="large" destaque={hoje} />
      </Moldura>
      <Nome>{nome}</Nome>
      <Data>
        <Cake aria-hidden="true" />
        {hoje ? 'Hoje' : data}
      </Data>
      {complemento && <Complemento>{complemento}</Complemento>}
    </Container>
  )
}
