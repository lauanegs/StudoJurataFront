import { AlternativaCard } from '@/components/simulados/AlternativaCard'
import { AlternativaVerdadeiroFalso } from '@/components/simulados/AlternativaVerdadeiroFalso'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { letraAlternativa } from '@/utils/format'

import { Alternativas, Cabecalho, Enunciado, Titulo } from './styles'
import type { QuestaoCorrigidaProps } from './types'

export function QuestaoCorrigida({
  numero,
  enunciado,
  ehVF,
  respondida,
  acertou,
  rotuloAcerto,
  rotuloErro,
  alternativas,
  marcadasVerdadeiras,
  alternativaMarcada,
}: QuestaoCorrigidaProps) {
  return (
    <Card>
      <Cabecalho>
        <Titulo>Questão {numero}</Titulo>

        {!respondida ? (
          <Tag variant="neutral">Em branco</Tag>
        ) : acertou ? (
          <Tag variant="success">{rotuloAcerto}</Tag>
        ) : (
          <Tag variant="error">{rotuloErro}</Tag>
        )}
      </Cabecalho>

      <Enunciado>{enunciado}</Enunciado>

      <Alternativas>
        {ehVF
          ? alternativas.map((alternativa) => (
              <AlternativaVerdadeiroFalso
                key={alternativa.id}
                texto={alternativa.texto}
                valor={respondida ? marcadasVerdadeiras.has(alternativa.id) : null}
                revelado
                correta={alternativa.correta}
                disabled
              />
            ))
          : alternativas.map((alternativa, posicao) => (
              <AlternativaCard
                key={alternativa.id}
                letra={letraAlternativa(posicao)}
                texto={alternativa.texto}
                status={alternativa.correta ? 'correct' : alternativa.id === alternativaMarcada ? 'incorrect' : 'neutral'}
                legenda=""
              />
            ))}
      </Alternativas>
    </Card>
  )
}
