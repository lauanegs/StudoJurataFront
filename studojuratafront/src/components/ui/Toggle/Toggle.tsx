import { useId } from 'react'

import * as S from './styles'
import type { ToggleProps } from './types'

/**
 * Switch de dois estados. Nas telas do Studo Jurata ele representa
 * StatusAtivoInativo / StatusTurma — por isso `textoLigado`/`textoDesligado`
 * mostram o rótulo real do enum ao lado do controle.
 */
export function Toggle({
  ligado,
  onChange,
  label,
  rotuloAcessivel,
  textoLigado,
  textoDesligado,
  descricao,
  disabled,
  id,
}: ToggleProps) {
  const idGerado = useId()
  const idCampo = id ?? idGerado

  return (
    <S.Container>
      <S.Linha htmlFor={idCampo} $disabled={disabled}>
        <S.Entrada
          id={idCampo}
          type="checkbox"
          role="switch"
          checked={ligado}
          disabled={disabled}
          aria-label={rotuloAcessivel ?? label}
          aria-checked={ligado}
          onChange={(evento) => onChange(evento.target.checked)}
        />

        <S.Trilho $ligado={ligado} aria-hidden="true" />

        {label && <S.Texto>{label}</S.Texto>}

        {(textoLigado || textoDesligado) && (
          <S.Estado $ligado={ligado}>{ligado ? textoLigado : textoDesligado}</S.Estado>
        )}
      </S.Linha>

      {descricao && <S.Descricao>{descricao}</S.Descricao>}
    </S.Container>
  )
}
