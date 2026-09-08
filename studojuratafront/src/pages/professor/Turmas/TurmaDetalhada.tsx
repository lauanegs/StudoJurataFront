import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarPlus, Users } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { BuscaInput } from '../../../components/ui/BuscaInput'
import { Button } from '../../../components/ui/Button'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { useDebounce } from '../../../hooks/useDebounce'
import { useRequisicao } from '../../../hooks/useRequisicao'
import {
  frequencias as servicoFrequencias,
  matriculas,
  planosAula,
  turmaDisciplinas,
  turmas as servicoTurmas,
} from '../../../services/endpoints'
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

  const vinculosDaTurma = useMemo(
    () => (requisicaoVinculos.data ?? []).filter((vinculo) => vinculo.turma?.id === idTurma),
    [requisicaoVinculos.data, idTurma],
  )

  /**
   * Carga horária já cursada por cada aluno nesta turma — soma das aulas já
   * ministradas (com frequência marcada presente) em qualquer disciplina da
   * turma. Mesmo cálculo usado na chamada do professor (RegistrarAulaTurma),
   * só que somando todas as disciplinas em vez de uma só.
   */
  const requisicaoCargaHoraria = useRequisicao(
    async () => {
      const alunos = requisicaoAlunos.data ?? []
      if (alunos.length === 0 || vinculosDaTurma.length === 0) return new Map<number, number>()

      const planosDaTurma = await Promise.all(
        vinculosDaTurma.map((vinculo) => planosAula.listarPorTurmaDisciplina(vinculo.id)),
      )
      const idsPlanosDaTurma = new Set(planosDaTurma.flat().map((plano) => plano.id))

      const frequenciasPorAluno = await Promise.all(
        alunos.map((matricula) => servicoFrequencias.listarPorAluno(matricula.aluno.id)),
      )

      return new Map(
        alunos.map((matricula, indice) => {
          const total = frequenciasPorAluno[indice]
            .filter((frequencia) => {
              const idPlanoAula = frequencia.aula?.planoAula?.id
              return frequencia.presente && idPlanoAula !== undefined && idsPlanosDaTurma.has(idPlanoAula)
            })
            .reduce((soma, frequencia) => soma + (frequencia.aula?.cargaHoraria ?? 0), 0)

          return [matricula.aluno.id, total]
        }),
      )
    },
    [requisicaoAlunos.data, vinculosDaTurma],
    { ativo: !requisicaoAlunos.loading && !requisicaoVinculos.loading },
  )

  const cargaHorariaPorAluno = requisicaoCargaHoraria.data ?? new Map<number, number>()

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
      cabecalho: 'Carga horária',
      ocultarEmTelaPequena: true,
      render: (matricula) => formatarCargaHoraria(cargaHorariaPorAluno.get(matricula.aluno.id) ?? 0),
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
