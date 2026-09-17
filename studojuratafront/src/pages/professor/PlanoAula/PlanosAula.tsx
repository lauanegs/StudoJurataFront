import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, ClipboardList, Layers } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { DataTable } from '../../../components/ui/DataTable'
import { Header, CamposFiltro, CampoFiltro } from '../../../components/ui/Header'
import { Select } from '../../../components/ui/Select'
import { Tag } from '../../../components/ui/Tag'
import { usePaginacao } from '../../../hooks/usePaginacao'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { professores } from '../../../services/pessoas'
import { planosAula as servicoPlanos } from '../../../services/planejamento'
import { formatarPeriodo } from '../../../utils/format'
import { ROTULO_STATUS_PLANO, STATUS_PLANO_VARIANT } from '../../../utils/labels'
import type { PlanoAula } from '../../../types/planejamento'
import type { Coluna } from '../../../components/ui/DataTable/types'

export default function PlanosAula() {
  const navegar = useNavigate()
  const { professorId } = useProfessorLogado()

  const [turmaId, setTurmaId] = useState<number | null>(null)

  const requisicaoVinculos = useRequisicao(
    () => professores.turmasLecionadas(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )

  const { data, loading, error, reload } = useRequisicao(() => servicoPlanos.listar(), [])

  const opcoesTurmas = useMemo(() => {
    const unicas = new Map<number, string>()
    for (const vinculo of requisicaoVinculos.data ?? []) {
      if (vinculo.turma) unicas.set(vinculo.turma.id, vinculo.turma.titulo)
    }
    return [...unicas.entries()].map(([value, label]) => ({ value, label }))
  }, [requisicaoVinculos.data])

  const meusPlanos = useMemo(() => {
    const meusVinculos = new Set((requisicaoVinculos.data ?? []).map((vinculo) => vinculo.id))

    return (data ?? []).filter((plano) => meusVinculos.has(plano.turmaDisciplina?.id ?? -1))
  }, [data, requisicaoVinculos.data])

  const filtrados = useMemo(() => {
    if (!turmaId) return meusPlanos
    return meusPlanos.filter((plano) => plano.turmaDisciplina?.turma?.id === turmaId)
  }, [meusPlanos, turmaId])

  const paginacao = usePaginacao(filtrados)

  const colunas: Coluna<PlanoAula>[] = [
    {
      key: 'turma',
      cabecalho: 'Turma',
      ordenavel: true,
      valorOrdenacao: (plano) => plano.turmaDisciplina?.turma?.titulo ?? '',
      render: (plano) => plano.turmaDisciplina?.turma?.titulo ?? '—',
    },
    {
      key: 'curso',
      cabecalho: 'Curso',
      render: (plano) => plano.turmaDisciplina?.turma?.curso?.nome ?? '—',
    },
    {
      key: 'disciplina',
      cabecalho: 'Disciplina',
      ocultarEmTelaPequena: true,
      render: (plano) => plano.turmaDisciplina?.disciplina?.titulo ?? '—',
    },
    {
      // O plano de aula referencia o plano de ensino de origem.
      key: 'planoEnsino',
      cabecalho: 'Plano de ensino',
      ocultarEmTelaPequena: true,
      render: (plano) => (plano.planoEnsino ? `Nº ${plano.planoEnsino.id}` : '—'),
    },
    {
      key: 'periodo',
      cabecalho: 'Período',
      ocultarEmTelaPequena: true,
      // Herdado do plano de ensino (nível macro) — PlanoAula não duplica datas.
      render: (plano) => formatarPeriodo(plano.planoEnsino?.dataInicio, plano.planoEnsino?.dataFim),
    },
    {
      key: 'situacao',
      cabecalho: 'Situação',
      render: (plano) =>
        plano.status && (
          <Tag variant={STATUS_PLANO_VARIANT[plano.status]}>
            {ROTULO_STATUS_PLANO[plano.status]}
          </Tag>
        ),
    },
  ]

  return (
    <Layout>
      <Header
        titulo="Planos de Aula"
        filtros={
          <CamposFiltro>
            <CampoFiltro $largura="220px">
              <Select<number>
                placeholder="Filtrar por turma"
                options={opcoesTurmas}
                value={turmaId}
                loading={requisicaoVinculos.loading}
                clearable
                searchable
                emptyText="Você ainda não leciona em nenhuma turma"
                onChange={setTurmaId}
              />
            </CampoFiltro>
          </CamposFiltro>
        }
      />

      <DataTable
        descricao="Planos de aula"
        columns={colunas}
        data={paginacao.itensDaPagina}
        rowKey={(plano) => plano.id}
        loading={loading || requisicaoVinculos.loading}
        error={error}
        onReload={reload}
        paginacao={{
          pagina: paginacao.pagina,
          totalPaginas: paginacao.totalPaginas,
          label: paginacao.label,
          temAnterior: paginacao.temAnterior,
          temProxima: paginacao.temProxima,
          onPrevious: paginacao.anterior,
          onNext: paginacao.proxima,
        }}
        empty={{
          titulo: turmaId ? 'Nenhum plano encontrado' : 'Nenhum plano de aula',
          descricao: turmaId
            ? 'Nenhum plano de aula para a turma selecionada.'
            : 'O plano de aula nasce sozinho quando você cria um plano de ensino com turma e disciplina vinculadas.',
          icon: <Layers />,
        }}
        actions={(plano) => (
          <>
            <Button
              variant="subtle"
              size="small"
              icon={<ClipboardList />}
              onClick={() => navegar(`/professor/plano-aula/${plano.id}`)}
            >
              Detalhar
            </Button>
            <Button
              variant="subtle"
              size="small"
              icon={<CalendarDays />}
              onClick={() => navegar(`/professor/plano-aula/${plano.id}/aulas`)}
            >
              Aulas
            </Button>
          </>
        )}
      />
    </Layout>
  )
}
