import { LetterBadge } from '@/components/simulados/LetterBadge'
import { Container, Texto } from './styles'
import type { AlternativaButtonProps } from './types'

export function AlternativaButton({
  letra,
  texto,
  state = 'default',
  onSelect,
  disabled = false,
}: AlternativaButtonProps) {
  return (
    <Container
      type="button"
      $state={state}
      $blocked={disabled}
      disabled={disabled}
      aria-pressed={state === 'selected'}
      onClick={onSelect}
    >
      <LetterBadge letra={letra} state={state} />
      <Texto>{texto}</Texto>
    </Container>
  )
}
