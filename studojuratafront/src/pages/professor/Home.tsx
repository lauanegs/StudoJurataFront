import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Cake, CalendarDays, ClipboardCheck, Layers, Sparkles, Users } from 'lucide-react'

import { Layout } from '../../components/layout'
import { AniversarianteCard } from '../../components/ui/AniversarianteCard'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EventoCard } from '../../components/ui/EventoCard'
import { InfoCard } from '../../components/ui/InfoCard'
import { SeparadorCard } from '../../components/ui/SeparadorCard'
import { EstadoVazio } from '../../components/feedback/EstadoVazio'
import { Skeleton, SkeletonCartao } from '../../components/feedback/Skeleton'
import { useAuth } from '../../hooks/useAuth'
import { useProfessorLogado } from '../../hooks/usePerfilLogado'
import { useRequisicao } from '../../hooks/useRequisicao'
import {
  eventos as servicoEventos,
  pessoas as servicoPessoas,
  professores as servicoProfessores,
  questoes as servicoQuestoes,
} from '../../services/endpoints'
import { nomeCurto } from '../../utils/format'
import { aniversariantesDaSemana } from '../_compartilhado/aniversariantes'

const Indicadores = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

const GradeEventos = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

export default function ProfessorHome() {
  const navegar = useNavigate()
  const { usuario } = useAuth()
  const { professorId, loading: carregandoProfessor } = useProfessorLogado()

  const requisicaoTurmas = useRequisicao(
    () => servicoProfessores.turmasLecionadas(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )

  const requisicaoPendentes = useRequisicao(() => servicoQuestoes.listarPendentes(), [])
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

  const vinculos = useMemo(() => requisicaoTurmas.data ?? [], [requisicaoTurmas.data])

  /** Um professor pode lecionar várias disciplinas na mesma turma. */
  const turmasDistintas = useMemo(
    () => new Set(vinculos.map((vinculo) => vinculo.turma?.id).filter(Boolean)).size,
    [vinculos],
  )

  const pendentes = requisicaoPendentes.data?.length ?? 0

  return (
    <Layout>
      <Banner
        titulo={`Olá, ${nomeCurto(usuario?.nomePessoa) ?? 'professor'}!`}
        subtitulo="Suas turmas, planos e simulados em um só painel."
      />

      {carregandoProfessor || requisicaoTurmas.loading ? (
        <Indicadores>
          <Skeleton $altura="80px" $raio="16px" />
          <Skeleton $altura="80px" $raio="16px" />
          <Skeleton $altura="80px" $raio="16px" />
        </Indicadores>
      ) : (
        <Indicadores>
          <InfoCard value={turmasDistintas} label="turmas que você leciona" icon={<Users />} tone="purple" />
          <InfoCard value={vinculos.length} label="disciplinas atribuídas" icon={<Layers />} tone="blue" />
          <InfoCard
            value={pendentes}
            label="questões aguardando revisão"
            icon={<ClipboardCheck />}
            tone={pendentes > 0 ? 'warning' : 'success'}
          />
        </Indicadores>
      )}

      {pendentes > 0 && (
        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <strong style={{ display: 'block', marginBottom: '4px' }}>
                {pendentes} questão(ões) geradas pela IA aguardando sua aprovação
              </strong>
              <span style={{ fontSize: '14px', color: '#656565' }}>
                Questões só entram nos simulados dos alunos depois de aprovadas.
              </span>
            </div>

            <Button
              icon={<Sparkles />}
              onClick={() => navegar('/professor/reforco/questoes')}
            >
              Revisar questões
            </Button>
          </div>
        </Card>
      )}

      {requisicaoPessoas.loading ? (
        <SkeletonCartao />
      ) : aniversariantes.length > 0 ? (
        <SeparadorCard titulo="Aniversariantes da semana" icon={<Cake />}>
          {aniversariantes.map((aniversariante) => (
            <AniversarianteCard
              key={aniversariante.id}
              nome={aniversariante.nome}
              data={aniversariante.data}
              hoje={aniversariante.hoje}
              complemento={aniversariante.complemento}
            />
          ))}
        </SeparadorCard>
      ) : null}

      <Card titulo="Próximos eventos" icon={<CalendarDays />}>
        {requisicaoEventos.loading ? (
          <Skeleton $altura="120px" $raio="8px" />
        ) : proximosEventos.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum evento pendente"
            descricao="A secretaria publica aqui as datas importantes da escola."
            icon={<CalendarDays />}
          />
        ) : (
          <GradeEventos>
            {proximosEventos.map((evento) => (
              <EventoCard
                key={evento.id}
                titulo={evento.titulo}
                dataHorario={evento.dataHorario}
                descricao={evento.descricao}
                concluido={evento.concluido}
              />
            ))}
          </GradeEventos>
        )}
      </Card>
    </Layout>
  )
}
