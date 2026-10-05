import { Grupo, Opcao } from './styles'
import type { SeletorOpcoesProps } from './types'

/** Escolha entre poucas opções excludentes, em botões pequenos (ex.: tipo de questão). */
export function SeletorOpcoes<T extends string>({
  rotuloAcessivel,
  value,
  options,
  onChange,
  disabled,
}: SeletorOpcoesProps<T>) {
  return (
    <Grupo role="group" aria-label={rotuloAcessivel}>
      {options.map((opcao) => (
        <Opcao
          key={opcao.value}
          type="button"
          $ativa={opcao.value === value}
          disabled={disabled}
          aria-pressed={opcao.value === value}
          onClick={() => onChange(opcao.value)}
        >
          {opcao.label}
        </Opcao>
      ))}
    </Grupo>
  )
}
