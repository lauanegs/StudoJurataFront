import { Play } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'

import { Container, Conteudo, Titulo, Meta } from './styles'
import type { SimuladoIniciarCardProps } from './types'

export function SimuladoIniciarCard({
  disciplina,
  autor,
  quantidadeQuestoes,
  indisponivel = false,
  motivoIndisponivel,
  loading = false,
  onStart,
}: SimuladoIniciarCardProps) {
  return (
    <Container>
      <Conteudo>
        <Titulo>{disciplina}</Titulo>

        <Meta>
          <span>{autor ?? 'Professor'}{quantidadeQuestoes ? ` | ${quantidadeQuestoes} questões` : ''}</span>
          {indisponivel && motivoIndisponivel && (
            <Tag variant="warning" size="small">
              {motivoIndisponivel}
            </Tag>
          )}
        </Meta>
      </Conteudo>

      <Button
        icon={<Play />}
        onClick={onStart}
        disabled={indisponivel}
        loading={loading}
      >
        Iniciar
      </Button>
    </Container>
  )
}
