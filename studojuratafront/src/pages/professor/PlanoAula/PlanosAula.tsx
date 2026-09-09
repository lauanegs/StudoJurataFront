import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { CalendarDays, ClipboardList, Layers, Plus } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { BuscaInput } from '../../../components/ui/BuscaInput'
import { Button } from '../../../components/ui/Button'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { Tag } from '../../../components/ui/Tag'
import { useDebounce } from '../../../hooks/useDebounce'
import { usePaginacao } from '../../../hooks/usePaginacao'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { planosAula as servicoPlanos, professores } from '../../../services/endpoints'
import { formatarPeriodo, normalizar } from '../../../utils/format'
import { ROTULO_STATUS_PLANO, STATUS_PLANO_VARIANT } from '../../../utils/labels'
import type { PlanoAula } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

/* Confirmado no Figma: botão "Adicionar plano" (150px) + busca (250px) na
   mesma linha, coladas — mesmo padrão de Planos de Ensino. */
const CamposCabecalho = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`

const LarguraBusca = styled.div`
  width: 250px;
`

export default function PlanosAula() {
  const navegar = useNavigate()
  const { professorId } = useProfessorLogado()

  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)

  const requisicaoVinculos = useRequisicao(
    () => professores.turmasLecionadas(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )

  const { data, loading, error, reload } = useRequisicao(() => servicoPlanos.listar(), [])

  const meusPlanos = useMemo(() => {
    const meusVinculos = new Set((requisicaoVinculos.data ?? []).map((vinculo) => vinculo.id))

    return (data ?? []).filter((plano) => meusVinculos.has(plano.turmaDisciplina?.id ?? -1))
  }, [data, requisicaoVinculos.data])

  const filtrados = useMemo(() => {
    if (!buscaAtrasada.trim()) return meusPlanos

    const termo = normalizar(buscaAtrasada)

    return meusPlanos.filter(
      (plano) =>
        normalizar(plano.turmaDisciplina?.turma?.titulo).includes(termo) ||
        normalizar(plano.turmaDisciplina?.turma?.curso?.nome).includes(termo) ||
        normalizar(plano.turmaDisciplina?.disciplina?.titulo).includes(termo),
    )
  }, [meusPlanos, buscaAtrasada])

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
          <CamposCabecalho>
            <Button icon={<Plus />} size="large" onClick={() => navegar('/professor/plano-aula/novo')}>
              Adicionar plano
            </Button>

            <LarguraBusca>
              <BuscaInput value={busca} onChange={setBusca} placeholder="Buscar plano..." />
            </LarguraBusca>
          </CamposCabecalho>
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
          titulo: busca ? 'Nenhum plano encontrado' : 'Nenhum plano de aula',
          descricao: busca
            ? 'Revise o termo buscado ou limpe o filtro.'
            : 'O plano de aula liga uma turma/disciplina a um plano de ensino e organiza as aulas do período.',
          icon: <Layers />,
          acao: !busca && (
            <Button icon={<Plus />} onClick={() => navegar('/professor/plano-aula/novo')}>
              Criar plano de aula
            </Button>
          ),
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
