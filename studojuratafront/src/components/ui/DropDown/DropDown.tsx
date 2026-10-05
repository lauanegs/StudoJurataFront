import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { Container, Gatilho, Titulo, Direita, Resumo, Chevron, Corpo, Item, Vazio } from './styles'
import type { DropDownProps } from './types'

export function DropDown({
  titulo,
  resumo,
  itens = [],
  children,
  abertoInicialmente = false,
  emptyText = 'Nenhum lançamento neste período.',
}: DropDownProps) {
  const idCorpo = useId()
  const [aberto, setAberto] = useState(abertoInicialmente)

  return (
    <Container>
      <Gatilho
        type="button"
        aria-expanded={aberto}
        aria-controls={idCorpo}
        onClick={() => setAberto((atual) => !atual)}
      >
        <Titulo>{titulo}</Titulo>

        <Direita>
          {resumo && <Resumo>{resumo}</Resumo>}
          <Chevron $aberto={aberto} aria-hidden="true">
            <ChevronDown />
          </Chevron>
        </Direita>
      </Gatilho>

      {aberto && (
        <Corpo id={idCorpo}>
          {children}

          {!children && itens.length === 0 && <Vazio>{emptyText}</Vazio>}

          {!children &&
            itens.map((item, indice) => (
              <Item key={`${item.label}-${indice}`}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </Item>
            ))}
        </Corpo>
      )}
    </Container>
  )
}
