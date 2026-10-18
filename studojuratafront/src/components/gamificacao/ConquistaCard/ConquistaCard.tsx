import { Container, Imagem, Titulo, Descricao, Progresso } from './styles'
import type { ConquistaCardProps } from './types'

export function ConquistaCard({
  titulo,
  descricao,
  imagem,
  conquistada = true,
  progresso,
}: ConquistaCardProps) {
  return (
    <Container $conquistada={conquistada}>
      <Imagem src={imagem} alt="" aria-hidden="true" $conquistada={conquistada} />

      <Titulo>{titulo}</Titulo>
      <Descricao>{descricao}</Descricao>
      {progresso && <Progresso>{progresso}</Progresso>}
    </Container>
  )
}
