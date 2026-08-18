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
import { matriculas, turmas as servicoTurmas } from '../../../services/endpoints'
import { formatarData, formatarIdade, normalizar } from '../../../utils/format'
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
        rotuloVoltar="Voltar para minhas turmas"
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
