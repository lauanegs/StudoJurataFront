import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarPlus, Clock, GraduationCap, Users } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { AlertaDesempenhoCard } from '../../../components/ui/AlertaDesempenhoCard'
import { BuscaInput } from '../../../components/ui/BuscaInput'
import { Button } from '../../../components/ui/Button'
import { DataTable } from '../../../components/ui/DataTable'
import { Header, SubtituloItem } from '../../../components/ui/Header'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { useAvisosDispensados } from '../../../hooks/useAvisosDispensados'
import { useCargaHorariaCursada } from '../../../hooks/useCargaHorariaCursada'
import { useDebounce } from '../../../hooks/useDebounce'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { matriculas, turmaDisciplinas, turmas as servicoTurmas } from '../../../services/endpoints'
import { formatarCargaHoraria, formatarData, formatarIdade, normalizar } from '../../../utils/format'
import type { AlunoTurma } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

export default function TurmaDetalhada() {
  const { turmaId } = useParams()
  const navegar = useNavigate()

  const idTurma = Number(turmaId)

  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)

  const requisicaoTurma = useRequisicao(() => servicoTurmas.buscar(idTurma), [idTurma])
  const requisicaoAlunos = useRequisicao(() => matriculas.ativosPorTurma(idTurma), [idTurma])
  const requisicaoVinculos = useRequisicao(() => turmaDisciplinas.listar(), [])
  const requisicaoHistorico = useRequisicao(() => matriculas.historicoPorTurma(idTurma), [idTurma])

  const { dispensados: avisosDispensados, dispensar: dispensarAviso } = useAvisosDispensados()
  /** Aviso (só informativo) quando um aluno concluiu automaticamente a
   * matrícula por ter atingido a carga horária do curso — ver
   * FrequenciaService no back. */
  const avisosCargaHoraria = useMemo(
    () =>
      (requisicaoHistorico.data ?? []).filter(
        (matricula) => matricula.status === 'CONCLUIDA' && !avisosDispensados.includes(matricula.id),
      ),
    [requisicaoHistorico.data, avisosDispensados],
  )

  const vinculosDaTurma = useMemo(
    () =>
      (requisicaoVinculos.data ?? []).filter(
        (vinculo) => vinculo.turma?.id === idTurma && vinculo.status !== 'INATIVO',
      ),
    [requisicaoVinculos.data, idTurma],
  )

  const requisicaoCargaHoraria = useCargaHorariaCursada(
    requisicaoAlunos.data ?? [],
    vinculosDaTurma,
    !requisicaoAlunos.loading && !requisicaoVinculos.loading,
  )

  const cargaHorariaPorAluno = requisicaoCargaHoraria.data?.cargaHoraria ?? new Map<number, number>()
  const faltasPorAluno = requisicaoCargaHoraria.data?.faltas ?? new Map<number, number>()

  const filtrados = useMemo(() => {
    const lista = requisicaoAlunos.data ?? []
    if (!buscaAtrasada.trim()) return lista

    const termo = normalizar(buscaAtrasada)
    return lista.filter((matricula) => normalizar(matricula.aluno?.pessoa?.nome).includes(termo))
  }, [requisicaoAlunos.data, buscaAtrasada])

  const colunas: Coluna<AlunoTurma>[] = [
    {
      key: 'aluno',
      cabecalho: 'Nome aluno',
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
      key: 'cargaHoraria',
      // Soma todas as disciplinas ativas da turma (nível do curso) — não é
      // por disciplina; ver a coluna equivalente em "Realizar chamada"
      // (RegistrarAulaTurma), que é escopada só à disciplina da aula.
      cabecalho: 'Carga horária atingida (curso)',
      ocultarEmTelaPequena: true,
      render: (matricula) => formatarCargaHoraria(cargaHorariaPorAluno.get(matricula.aluno.id) ?? 0),
    },
    {
      key: 'faltas',
      cabecalho: 'Nº de faltas',
      alinhamento: 'center',
      ocultarEmTelaPequena: true,
      render: (matricula) => faltasPorAluno.get(matricula.aluno.id) ?? 0,
    },
    {
      key: 'matricula',
      cabecalho: 'Data matrícula',
      ocultarEmTelaPequena: true,
      render: (matricula) => formatarData(matricula.dataInicio),
    },
  ]

  if (requisicaoTurma.error) {
    return (
      <Layout>
        <Header titulo="Turma" voltarPara="/professor/turmas" />
        <ErroCarregamento
          mensagem={requisicaoTurma.error}
          onRetry={requisicaoTurma.reload}
        />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo={requisicaoTurma.data?.titulo ?? 'Turma'}
        subtitulo={
          requisicaoTurma.data?.curso && (
            <>
              <SubtituloItem icon={<GraduationCap />}>Curso: {requisicaoTurma.data.curso.nome}</SubtituloItem>
              <SubtituloItem icon={<Clock />}>
                Carga horária: {formatarCargaHoraria(requisicaoTurma.data.curso.cargaHorariaTotal)}
              </SubtituloItem>
            </>
          )
        }
        voltarPara="/professor/turmas"
        rotuloVoltar="Minhas turmas"
        actions={
          <Button
            size="large"
            icon={<CalendarPlus />}
            onClick={() => navegar(`/professor/turmas/${idTurma}/registrar-aula`)}
          >
            Registrar aula
          </Button>
        }
        filtros={<BuscaInput value={busca} onChange={setBusca} placeholder="Buscar aluno..." />}
      />

      {avisosCargaHoraria.map((matricula) => (
        <AlertaDesempenhoCard
          key={matricula.id}
          tom="success"
          titulo={`${matricula.aluno?.pessoa?.nome ?? 'Aluno'} concluiu a carga horária`}
          descricao={`Matrícula concluída automaticamente em ${formatarData(matricula.dataFim)}. Se for necessário reativar, entre em contato com a administração.`}
          acao={
            <Button variant="secondary" size="small" onClick={() => dispensarAviso(matricula.id)}>
              Ciente
            </Button>
          }
        />
      ))}

      <DataTable
        descricao="Alunos ativos na turma"
        columns={colunas}
        data={filtrados}
        rowKey={(matricula) => matricula.id}
        loading={requisicaoAlunos.loading || requisicaoTurma.loading}
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
