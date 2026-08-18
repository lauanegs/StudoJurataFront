import { useMemo } from 'react'
import styled from 'styled-components'
import { Cake, CalendarDays } from 'lucide-react'

import { Layout } from '../../components/layout'
import { AniversarianteCard } from '../../components/ui/AniversarianteCard'
import { Banner } from '../../components/ui/Banner'
import { Card } from '../../components/ui/Card'
import { EventoCard } from '../../components/ui/EventoCard'
import { SeparadorCard } from '../../components/ui/SeparadorCard'
import { EstadoVazio } from '../../components/feedback/EstadoVazio'
import { Skeleton, SkeletonCartao } from '../../components/feedback/Skeleton'
import { useRequisicao } from '../../hooks/useRequisicao'
import { eventos as servicoEventos, pessoas as servicoPessoas } from '../../services/endpoints'
import { aniversariantesDaSemana } from '../_compartilhado/aniversariantes'

/** Altura fixa confirmada no Figma; a largura é definida pela grade de colunas do SeparadorCard. */
const ItemEvento = styled.div`
  width: 100%;
  min-width: 0;
  height: 160px;
`

export default function ProfessorHome() {
  const requisicaoPessoas = useRequisicao(() => servicoPessoas.listar(), [])
  const requisicaoEventos = useRequisicao(() => servicoEventos.listarPendentes(), [])

  const aniversariantes = useMemo(
    () => aniversariantesDaSemana(requisicaoPessoas.data ?? []),
    [requisicaoPessoas.data],
  )

  const proximosEventos = useMemo(
    () =>
      [...(requisicaoEventos.data ?? [])]
        .sort((a, b) => new Date(a.dataHorario).getTime() - new Date(b.dataHorario).getTime())
        .slice(0, 4),
    [requisicaoEventos.data],
  )

  return (
    <Layout>
      <Banner />

      {requisicaoPessoas.loading ? (
        <SkeletonCartao />
      ) : aniversariantes.length > 0 ? (
        <SeparadorCard titulo="Aniversariantes da semana" icon={<Cake />} colunas={5}>
          {aniversariantes.map((aniversariante) => (
            <AniversarianteCard
              key={aniversariante.id}
              nome={aniversariante.nome}
              data={aniversariante.data}
              hoje={aniversariante.hoje}
            />
          ))}
        </SeparadorCard>
      ) : null}

      {requisicaoEventos.loading ? (
        <Card titulo="Próximos eventos" icon={<CalendarDays />}>
          <Skeleton $altura="120px" $raio="8px" />
        </Card>
      ) : proximosEventos.length === 0 ? (
        <Card titulo="Próximos eventos" icon={<CalendarDays />}>
          <EstadoVazio
            titulo="Nenhum evento pendente"
            descricao="A secretaria publica aqui as datas importantes da escola."
            icon={<CalendarDays />}
          />
        </Card>
      ) : (
        <SeparadorCard titulo="Próximos eventos" icon={<CalendarDays />} colunas={4}>
          {proximosEventos.map((evento) => (
            <ItemEvento key={evento.id}>
              <EventoCard
                titulo={evento.titulo}
                dataHorario={evento.dataHorario}
                descricao={evento.descricao}
                concluido={evento.concluido}
              />
            </ItemEvento>
          ))}
        </SeparadorCard>
      )}
    </Layout>
  )
}
