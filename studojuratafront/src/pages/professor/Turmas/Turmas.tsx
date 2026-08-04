import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Users } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { BuscaInput } from '../../../components/ui/BuscaInput'
import { Button } from '../../../components/ui/Button'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { Tag } from '../../../components/ui/Tag'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { useDebounce } from '../../../hooks/useDebounce'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { professores as servicoProfessores } from '../../../services/endpoints'
import { normalizar } from '../../../utils/format'
import { ROTULO_STATUS_TURMA } from '../../../utils/labels'
import type { TurmaDisciplina } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

/**
 * Turmas do professor logado.
 *
 * O back expõe isso como GET /professores/{id}/turmas, que devolve
 * TurmaDisciplina — ou seja, um registro por par turma+disciplina.
 */
export default function TurmasProfessor() {
  const navegar = useNavigate()
  const { professorId, loading: carregandoProfessor, error: erroProfessor } = useProfessorLogado()

  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)

  const { data, loading, error, reload } = useRequisicao(
    () => servicoProfessores.turmasLecionadas(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )

  const filtrados = useMemo(() => {
    const lista = (data ?? []).filter((vinculo) => vinculo.status !== 'INATIVO')
    if (!buscaAtrasada.trim()) return lista

    const termo = normalizar(buscaAtrasada)

    return lista.filter(
      (vinculo) =>
        normalizar(vinculo.turma?.titulo).includes(termo) ||
        normalizar(vinculo.disciplina?.titulo).includes(termo),
    )
  }, [data, buscaAtrasada])

  const colunas: Coluna<TurmaDisciplina>[] = [
    {
      key: 'turma',
      cabecalho: 'Turma',
      ordenavel: true,
      valorOrdenacao: (vinculo) => vinculo.turma?.titulo ?? '',
      render: (vinculo) => vinculo.turma?.titulo ?? '—',
    },
    {
      key: 'disciplina',
      cabecalho: 'Disciplina',
      render: (vinculo) => <Tag variant="purple">{vinculo.disciplina?.titulo ?? '—'}</Tag>,
    },
    {
      key: 'curso',
      cabecalho: 'Curso',
      ocultarEmTelaPequena: true,
      render: (vinculo) => vinculo.turma?.curso?.nome ?? '—',
    },
    {
      key: 'status',
      cabecalho: 'Situação da turma',
      render: (vinculo) =>
        vinculo.turma?.status ? (
          <Tag variant={vinculo.turma.status === 'ATIVA' ? 'success' : 'neutral'} ponto>
            {ROTULO_STATUS_TURMA[vinculo.turma.status]}
          </Tag>
        ) : (
          '—'
        ),
    },
  ]

  if (erroProfessor) {
    return (
      <Layout>
        <Header titulo="Minhas turmas" />
        <ErroCarregamento mensagem={erroProfessor} />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo="Minhas turmas"
        subtitulo={
          !loading && !error ? `${filtrados.length} vínculo(s) turma/disciplina` : undefined
        }
        filtros={<BuscaInput value={busca} onChange={setBusca} placeholder="Buscar turma ou disciplina..." />}
      />

      <DataTable
        descricao="Turmas em que você leciona"
        columns={colunas}
        data={filtrados}
        rowKey={(vinculo) => vinculo.id}
        loading={loading || carregandoProfessor}
        error={error}
        onReload={reload}
        onRowClick={(vinculo) => navegar(`/professor/turmas/${vinculo.id}`)}
        empty={{
          titulo: busca ? 'Nenhuma turma encontrada' : 'Você ainda não leciona em nenhuma turma',
          descricao: busca
            ? 'Revise o termo buscado ou limpe o filtro.'
            : 'A coordenação vincula professores às turmas na tela de cadastro da turma.',
          icon: <Users />,
        }}
        actions={(vinculo) => (
          <Button
            variant="subtle"
            size="small"
            icon={<ClipboardList />}
            onClick={() => navegar(`/professor/turmas/${vinculo.id}`)}
          >
            Abrir
          </Button>
        )}
      />
    </Layout>
  )
}
