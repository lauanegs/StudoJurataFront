import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { comTamanho } from '../../../utils/redimensionarIcone'
import * as S from './styles'
import type { HeaderProps, SubtituloItemProps } from './types'

export function Header({
  titulo,
  subtitulo,
  voltarPara,
  rotuloVoltar = 'Voltar',
  filtros,
  actions,
  children,
}: HeaderProps) {
  const navegar = useNavigate()

  return (
    <S.Container>
      <S.Cartao>
        <S.Titulos>
          <S.LinhaTitulo>
            {voltarPara && (
              // Botão quadrado só com o ícone, na mesma linha e centralizado
              // com a altura do título (não do bloco título+subtítulo
              // inteiro) — confirmado pelo usuário a partir do protótipo.
              <S.Voltar type="button" onClick={() => navegar(voltarPara)} aria-label={rotuloVoltar}>
                <ArrowLeft size={18} />
              </S.Voltar>
            )}
            <S.Titulo>{titulo}</S.Titulo>
          </S.LinhaTitulo>

          {subtitulo && <S.Subtitulo $recuada={Boolean(voltarPara)}>{subtitulo}</S.Subtitulo>}
        </S.Titulos>

        {(actions || children || filtros) && (
          <S.LinhaAcoes>
            {(actions || children) && <S.Acoes>{actions ?? children}</S.Acoes>}
            {filtros && <S.Filtros>{filtros}</S.Filtros>}
          </S.LinhaAcoes>
        )}
      </S.Cartao>
    </S.Container>
  )
}

/**
 * Item do subtítulo no estilo do Figma: ícone num badge cinza + texto
 * simples, um por linha (empilhados via CSS de `Subtitulo`).
 */
export function SubtituloItem({ icon, children }: SubtituloItemProps) {
  return (
    <S.ItemSubtitulo>
      <S.IconeSubtitulo>{comTamanho(icon, 14)}</S.IconeSubtitulo>
      {children}
    </S.ItemSubtitulo>
  )
}
