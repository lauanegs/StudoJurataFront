import { useTheme } from 'styled-components'

import * as S from './styles'
import type { CircularProgressProps } from './types'

/**
 * Medidor circular de desempenho (doc §5.9).
 *
 * A faixa de cor segue a mesma régua usada no restante do produto:
 * abaixo de 40% é crítico, até 70% é atenção, acima disso é bom.
 */
export function CircularProgress({
  value,
  label,
  size = 96,
  espessura = 10,
  cor,
  textoCentral,
}: CircularProgressProps) {
  const theme = useTheme()

  const percentual = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0))

  const corFinal =
    cor ??
    (percentual < 40
      ? theme.colors.error
      : percentual < 70
        ? theme.colors.warning
        : theme.colors.success)

  const raio = (size - espessura) / 2
  const circunferencia = 2 * Math.PI * raio
  const preenchido = (percentual / 100) * circunferencia

  return (
    <S.Container>
      <S.Anel
        $size={size}
        role="img"
        aria-label={`${label ? `${label}: ` : ''}${Math.round(percentual)}%`}
      >
        <S.Svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={raio}
            fill="none"
            stroke={theme.colors.background}
            strokeWidth={espessura}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={raio}
            fill="none"
            stroke={corFinal}
            strokeWidth={espessura}
            strokeLinecap="round"
            strokeDasharray={`${preenchido} ${circunferencia}`}
            style={{ transition: 'stroke-dasharray 400ms ease' }}
          />
        </S.Svg>

        <S.Centro $cor={corFinal} $size={size}>
          {textoCentral ?? `${Math.round(percentual)}%`}
        </S.Centro>
      </S.Anel>

      {label && <S.Rotulo>{label}</S.Rotulo>}
    </S.Container>
  )
}
