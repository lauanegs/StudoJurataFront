import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import * as S from './styles'
import type { HeaderProps } from './types'

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
      {voltarPara && (
        <S.Voltar type="button" onClick={() => navegar(voltarPara)}>
          <ArrowLeft aria-hidden="true" />
          {rotuloVoltar}
        </S.Voltar>
      )}

      <S.Cartao>
        <S.Titulos>
          <S.Titulo>{titulo}</S.Titulo>
          {subtitulo && <S.Subtitulo>{subtitulo}</S.Subtitulo>}
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
