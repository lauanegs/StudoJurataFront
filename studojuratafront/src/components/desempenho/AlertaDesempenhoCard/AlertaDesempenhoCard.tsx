import { AlertTriangle, CheckCircle2 } from 'lucide-react'

import { Container, Icone, Conteudo, Titulo, Descricao, Acao } from './styles'
import type { AlertaDesempenhoCardProps } from './types'

export function AlertaDesempenhoCard({ titulo, descricao, acao, tom = 'warning' }: AlertaDesempenhoCardProps) {
  return (
    <Container role="status" $tom={tom}>
      <Icone aria-hidden="true" $tom={tom}>
        {tom === 'success' ? <CheckCircle2 /> : <AlertTriangle />}
      </Icone>

      <Conteudo>
        <Titulo $tom={tom}>{titulo}</Titulo>
        <Descricao>{descricao}</Descricao>
      </Conteudo>

      {acao && <Acao>{acao}</Acao>}
    </Container>
  )
}
