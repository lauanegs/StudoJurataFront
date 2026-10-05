import { Tela, Icone, Titulo, Descricao } from './styles'
import type { TelaAvisoProps } from './types'

/** Tela cheia de aviso de navegação (acesso negado, página inexistente). */
export function TelaAviso({ icone, corIcone, fundoIcone, titulo, descricao, larguraDescricao, acao }: TelaAvisoProps) {
  return (
    <Tela>
      <Icone aria-hidden="true" $fundo={fundoIcone} $cor={corIcone}>
        {icone}
      </Icone>
      <Titulo>{titulo}</Titulo>
      <Descricao $larguraMaxima={larguraDescricao}>{descricao}</Descricao>
      {acao}
    </Tela>
  )
}
