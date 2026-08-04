import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarClock, Layers, NotebookPen, Users } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { BuscaInput } from '../../../components/ui/BuscaInput'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { Tag } from '../../../components/ui/Tag'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { useDebounce } from '../../../hooks/useDebounce'
import { useRequisicao } from '../../../hooks/useRequisicao'
import {
  horariosTurma,
  matriculas,
  planosAula,
  turmaDisciplinas,
} from '../../../services/endpoints'
import { formatarData, formatarHora, formatarIdade, normalizar } from '../../../utils/format'
import { ROTULO_DIA_SEMANA_CURTO } from '../../../utils/labels'
import type { AlunoTurma } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

export default function TurmaDetalhada() {
  const { turmaDisciplinaId } = useParams()
  const navegar = useNavigate()

  const idVinculo = Number(turmaDisciplinaId)

  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)

  const requisicaoVinculo = useRequisicao(() => turmaDisciplinas.buscar(idVinculo), [idVinculo])

  const turmaId = requisicaoVinculo.data?.turma?.id ?? null

  const requisicaoAlunos = useRequisicao(
    () => matriculas.ativosPorTurma(turmaId as number),
    [turmaId],
    { ativo: Boolean(turmaId) },
  )

  const requisicaoHorarios = useRequisicao(
    () => horariosTurma.listarPorTurma(turmaId as number),
    [turmaId],
    { ativo: Boolean(turmaId) },
  )

  const requisicaoPlanos = useRequisicao(
    () => planosAula.listarPorTurmaDisciplina(idVinculo),
    [idVinculo],
  )

  const filtrados = useMemo(() => {
    const lista = requisicaoAlunos.data ?? []
    if (!buscaAtrasada.trim()) return lista

    const termo = normalizar(buscaAtrasada)
    return lista.filter((matricula) => normalizar(matricula.aluno?.pessoa?.nome).includes(termo))
  }, [requisicaoAlunos.data, buscaAtrasada])

  const colunas: Coluna<AlunoTurma>[] = [
    {
      key: 'aluno',
      cabecalho: 'Aluno',
      ordenavel: true,
      valorOrdenacao: (matricula) => matricula.aluno?.pessoa?.nome ?? '',
      render: (matricula) => matricula.aluno?.pessoa?.nome ?? '—',
    },
    {
      key: 'idade',
      cabecalho: 'Idade',
      render: (matricula) => formatarIdade(matricula.aluno?.pessoa?.dataNascimento),
    },
    {
      key: 'matricula',
      cabecalho: 'Data da matrícula',
      ocultarEmTelaPequena: true,
      render: (matricula) => formatarData(matricula.dataInicio),
    },
  ]

  if (requisicaoVinculo.error) {
    return (
      <Layout>
        <Header titulo="Turma" voltarPara="/professor/turmas" />
        <ErroCarregamento
          mensagem={requisicaoVinculo.error}
          onRetry={requisicaoVinculo.reload}
        />
      </Layout>
    )
  }

  const vinculo = requisicaoVinculo.data
  const planos = requisicaoPlanos.data ?? []

  return (
    <Layout>
      <Header
        titulo={vinculo?.turma?.titulo ?? 'Turma'}
        subtitulo={
          vinculo && (
            <>
              <Tag variant="purple">{vinculo.disciplina?.titulo}</Tag>
              {vinculo.turma?.curso?.nome && <span>{vinculo.turma.curso.nome}</span>}
              {(requisicaoHorarios.data ?? []).map((horario) => (
                <Tag key={horario.id} variant="neutral" icon={<CalendarClock />}>
                  {ROTULO_DIA_SEMANA_CURTO[horario.diaSemana]} {formatarHora(horario.horaInicio)}–
                  {formatarHora(horario.horaFim)}
                </Tag>
              ))}
            </>
          )
        }
        voltarPara="/professor/turmas"
        rotuloVoltar="Voltar para minhas turmas"
        actions={
          <>
            <Button
              variant="secondary"
              icon={<NotebookPen />}
              onClick={() => navegar('/professor/notas')}
            >
              Ver notas
            </Button>
            <Button
              icon={<Layers />}
              onClick={() =>
                planos.length === 1
                  ? navegar(`/professor/plano-aula/${planos[0].id}/aulas`)
                  : navegar('/professor/plano-aula')
              }
            >
              {planos.length === 0 ? 'Criar plano de aula' : 'Abrir plano de aula'}
            </Button>
          </>
        }
        filtros={<BuscaInput value={busca} onChange={setBusca} placeholder="Buscar aluno..." />}
      />

      {planos.length === 0 && !requisicaoPlanos.loading && (
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
                Esta turma ainda não tem plano de aula
              </strong>
              <span style={{ fontSize: '14px', color: '#656565' }}>
                O plano de aula é o que permite registrar aulas, conteúdos e chamadas.
              </span>
            </div>

            <Button icon={<Layers />} onClick={() => navegar('/professor/plano-aula/novo')}>
              Criar plano de aula
            </Button>
          </div>
        </Card>
      )}

      <DataTable
        descricao="Alunos ativos na turma"
        columns={colunas}
        data={filtrados}
        rowKey={(matricula) => matricula.id}
        loading={requisicaoAlunos.loading || requisicaoVinculo.loading}
        error={requisicaoAlunos.error}
        onReload={requisicaoAlunos.reload}
        empty={{
          titulo: busca ? 'Nenhum aluno encontrado' : 'Nenhum aluno matriculado',
          descricao: busca
            ? 'Revise o termo buscado ou limpe o filtro.'
            : 'A secretaria matricula os alunos na tela de cadastro da turma.',
          icon: <Users />,
        }}
      />
    </Layout>
  )
}
