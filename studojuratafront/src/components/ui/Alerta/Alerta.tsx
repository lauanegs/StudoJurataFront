import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

import { Acao, Container, Conteudo, Descricao, Icone, Titulo } from './styles'
import type { AlertaProps, TomAlerta } from './types'

const ICONES: Record<TomAlerta, typeof Info> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
}

export function Alerta({ titulo, descricao, acao, tom = 'info' }: AlertaProps) {
  const IconeDoTom = ICONES[tom]

  return (
    <Container role={tom === 'error' ? 'alert' : 'status'} $tom={tom}>
      <Icone aria-hidden="true" $tom={tom}>
        <IconeDoTom />
      </Icone>

      <Conteudo>
        {titulo && <Titulo>{titulo}</Titulo>}
        <Descricao>{descricao}</Descricao>
      </Conteudo>

      {acao && <Acao>{acao}</Acao>}
    </Container>
  )
}
