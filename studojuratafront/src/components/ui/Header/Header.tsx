import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { comTamanho } from '@/utils/redimensionarIcone'
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

export function SubtituloItem({ icon, children }: SubtituloItemProps) {
  return (
    <S.ItemSubtitulo>
      <S.IconeSubtitulo>{comTamanho(icon, 14)}</S.IconeSubtitulo>
      {children}
    </S.ItemSubtitulo>
  )
}
