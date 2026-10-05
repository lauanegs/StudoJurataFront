import { Award, Lock } from 'lucide-react'

import { Container, Medalha, Titulo, Descricao, Progresso } from './styles'
import type { ConquistaCardProps } from './types'

/** Medalha de conquista do aluno (derivada dos simulados concluídos). */
export function ConquistaCard({
  titulo,
  descricao,
  conquistada = true,
  progresso,
}: ConquistaCardProps) {
  return (
    <Container $conquistada={conquistada}>
      <Medalha $conquistada={conquistada} aria-hidden="true">
        {conquistada ? <Award /> : <Lock />}
      </Medalha>

      <Titulo>{titulo}</Titulo>
      <Descricao>{descricao}</Descricao>
      {progresso && <Progresso>{progresso}</Progresso>}
    </Container>
  )
}
