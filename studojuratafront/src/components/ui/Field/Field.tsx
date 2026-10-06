import * as S from './styles'
import type { FieldProps } from './types'

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
