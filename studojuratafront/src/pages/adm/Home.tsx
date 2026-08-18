import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { BookOpen, Cake, CalendarDays, GraduationCap, Plus, UserCog, Users } from 'lucide-react'

import { Layout } from '../../components/layout'
import { AniversarianteCard } from '../../components/ui/AniversarianteCard'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EventoCard } from '../../components/ui/EventoCard'
import { InfoCard } from '../../components/ui/InfoCard'
import { SeparadorCard } from '../../components/ui/SeparadorCard'
import { ErroCarregamento } from '../../components/feedback/ErroCarregamento'
import { EstadoVazio } from '../../components/feedback/EstadoVazio'
import { Skeleton, SkeletonCartao } from '../../components/feedback/Skeleton'
import { useAuth } from '../../hooks/useAuth'
import { useRequisicao } from '../../hooks/useRequisicao'
import {
  alunos as servicoAlunos,
  disciplinas as servicoDisciplinas,
  eventos as servicoEventos,
  pessoas as servicoPessoas,
  professores as servicoProfessores,
  turmas as servicoTurmas,
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

export default function AdmHome() {
  const navegar = useNavigate()
  const { usuario } = useAuth()

  const requisicaoAlunos = useRequisicao(() => servicoAlunos.listar(), [])
  const requisicaoProfessores = useRequisicao(() => servicoProfessores.listar(), [])
  const requisicaoTurmas = useRequisicao(() => servicoTurmas.listar(), [])
  const requisicaoDisciplinas = useRequisicao(() => servicoDisciplinas.listar(), [])
  const requisicaoPessoas = useRequisicao(() => servicoPessoas.listar(), [])
  const requisicaoEventos = useRequisicao(() => servicoEventos.listarPendentes(), [])

  const aniversariantes = useMemo(
    () => aniversariantesDaSemana(requisicaoPessoas.data ?? []),
    [requisicaoPessoas.data],
  )

  /** Só os eventos mais próximos entram na Home; a lista completa fica em /adm/eventos. */
  const proximosEventos = useMemo(
    () =>
      [...(requisicaoEventos.data ?? [])]
        .sort((a, b) => new Date(a.dataHorario).getTime() - new Date(b.dataHorario).getTime())
        .slice(0, 6),
    [requisicaoEventos.data],
  )

  const turmasAtivas = (requisicaoTurmas.data ?? []).filter((turma) => turma.status !== 'INATIVA')

  const carregandoIndicadores =
    requisicaoAlunos.loading ||
    requisicaoProfessores.loading ||
    requisicaoTurmas.loading ||
    requisicaoDisciplinas.loading

  return (
    <Layout>
      <Banner
        titulo={`Bem-vindo, ${nomeCurto(usuario?.nomePessoa) ?? 'Administrador'}!`}
        subtitulo="Acompanhe a escola em um só lugar: turmas, pessoas e agenda."
      />

      {carregandoIndicadores ? (
        <Indicadores>
          <Skeleton $altura="80px" $raio="8px" />
          <Skeleton $altura="80px" $raio="8px" />
          <Skeleton $altura="80px" $raio="8px" />
          <Skeleton $altura="80px" $raio="8px" />
        </Indicadores>
      ) : (
        <Indicadores>
          <InfoCard
            value={requisicaoAlunos.data?.length ?? 0}
            label="alunos cadastrados"
            icon={<GraduationCap />}
            tone="purple"
          />
          <InfoCard
            value={requisicaoProfessores.data?.length ?? 0}
            label="professores"
            icon={<UserCog />}
            tone="blue"
          />
          <InfoCard value={turmasAtivas.length} label="turmas ativas" icon={<Users />} tone="success" />
          <InfoCard
            value={requisicaoDisciplinas.data?.length ?? 0}
            label="disciplinas"
            icon={<BookOpen />}
            tone="warning"
          />
        </Indicadores>
      )}

      {requisicaoPessoas.loading ? (
        <SkeletonCartao />
      ) : requisicaoPessoas.error ? (
        <Card titulo="Aniversariantes da semana" icon={<Cake />}>
          <ErroCarregamento
            mensagem={requisicaoPessoas.error}
            onRetry={requisicaoPessoas.reload}
          />
        </Card>
      ) : aniversariantes.length > 0 ? (
        <SeparadorCard titulo="Aniversariantes da semana" icon={<Cake />} colunas={5}>
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
      ) : (
        <Card titulo="Aniversariantes da semana" icon={<Cake />}>
          <EstadoVazio
            titulo="Nenhum aniversário nos próximos 7 dias"
            descricao="A lista considera a data de nascimento de alunos, professores e responsáveis."
            icon={<Cake />}
          />
        </Card>
      )}

      <Card
        titulo="Próximos eventos"
        icon={<CalendarDays />}
        actions={
          <>
            <Button variant="subtle" size="small" onClick={() => navegar('/adm/eventos')}>
              Ver todos
            </Button>
            <Button size="small" icon={<Plus />} onClick={() => navegar('/adm/eventos')}>
              Novo evento
            </Button>
          </>
        }
      >
        {requisicaoEventos.loading ? (
          <Skeleton $altura="120px" $raio="8px" />
        ) : requisicaoEventos.error ? (
          <ErroCarregamento
            mensagem={requisicaoEventos.error}
            onRetry={requisicaoEventos.reload}
          />
        ) : proximosEventos.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum evento pendente"
            descricao="Cadastre aulas demonstrativas, reuniões e datas importantes."
            icon={<CalendarDays />}
            acao={
              <Button icon={<Plus />} onClick={() => navegar('/adm/eventos')}>
                Criar evento
              </Button>
            }
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
                onEdit={() => navegar('/adm/eventos')}
              />
            ))}
          </GradeEventos>
        )}
      </Card>
    </Layout>
  )
}
