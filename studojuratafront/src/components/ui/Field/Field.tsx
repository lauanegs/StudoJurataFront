import * as S from './styles'
import type { FieldProps } from './types'

/**
 * Moldura padrão de campo de formulário: rótulo, marcação de obrigatório,
 * contador e a linha de ajuda/erro. Todos os controles (Input, Select,
 * TextArea, DatePicker...) usam este wrapper para ficarem alinhados.
 */
export function Field({ label, htmlFor, required, hint, error, counter, children }: FieldProps) {
  return (
    <S.Container>
      {(label || counter) && (
        <S.LabelRow>
          {label && (
            <S.Label htmlFor={htmlFor}>
              {label}
              {required && <S.Asterisk aria-hidden="true">*</S.Asterisk>}
            </S.Label>
          )}
          {counter && <S.Counter>{counter}</S.Counter>}
        </S.LabelRow>
      )}

      {children}

      {(error || hint) && (
        <S.Message $error={Boolean(error)} role={error ? 'alert' : undefined}>
          {error ?? hint}
        </S.Message>
      )}
    </S.Container>
  )
}
