import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { ClipboardList, ListTree, Plus } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { BuscaInput } from '../../../components/ui/BuscaInput'
import { Button } from '../../../components/ui/Button'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { useDebounce } from '../../../hooks/useDebounce'
import { usePaginacao } from '../../../hooks/usePaginacao'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { planosEnsino as servicoPlanos } from '../../../services/endpoints'
import { formatarCargaHoraria, normalizar } from '../../../utils/format'
import type { PlanoEnsino } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

/* Confirmado no Figma: botão "Adicionar plano" (150px) + busca (250px) na
   mesma linha, coladas uma na outra — mesmo padrão já usado em Registrar
   Aula/Notas (o slot de filtros do Header encolhe pro conteúdo real). */
const CamposCabecalho = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  width: fit-content;
  max-width: 100%;
  overflow-x: auto;
`

const LarguraBusca = styled.div`
  width: 250px;
`

export default function PlanosEnsino() {
  const navegar = useNavigate()

  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)

  const { data, loading, error, reload } = useRequisicao(() => servicoPlanos.listar(), [])

  const filtrados = useMemo(() => {
    const lista = data ?? []
    if (!buscaAtrasada.trim()) return lista

    const termo = normalizar(buscaAtrasada)

    return lista.filter(
      (plano) =>
        normalizar(plano.turmaDisciplina?.turma?.titulo).includes(termo) ||
        normalizar(plano.curso?.nome).includes(termo) ||
        normalizar(plano.turmaDisciplina?.disciplina?.titulo).includes(termo) ||
        normalizar(plano.periodoLetivo).includes(termo),
    )
  }, [data, buscaAtrasada])

  const paginacao = usePaginacao(filtrados)

  const colunas: Coluna<PlanoEnsino>[] = [
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
      render: (plano) => plano.curso?.nome ?? '—',
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
      ordenavel: true,
      valorOrdenacao: (plano) => plano.periodoLetivo,
      render: (plano) => plano.periodoLetivo,
    },
    {
      key: 'carga',
      cabecalho: 'Carga horária',
      ocultarEmTelaPequena: true,
      render: (plano) => formatarCargaHoraria(plano.cargaHoraria),
    },
  ]

  return (
    <Layout>
      <Header
        titulo="Planos de Ensino"
        filtros={
          <CamposCabecalho>
            <Button icon={<Plus />} size="large" onClick={() => navegar('/professor/plano-ensino/novo')}>
              Adicionar plano
            </Button>

            <LarguraBusca>
              <BuscaInput value={busca} onChange={setBusca} placeholder="Buscar plano..." />
            </LarguraBusca>
          </CamposCabecalho>
        }
      />

      <DataTable
        descricao="Planos de ensino"
        columns={colunas}
        data={paginacao.itensDaPagina}
        rowKey={(plano) => plano.id}
        loading={loading}
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
          titulo: busca ? 'Nenhum plano encontrado' : 'Nenhum plano de ensino',
          descricao: busca
            ? 'Revise o termo buscado ou limpe o filtro.'
            : 'O plano de ensino define a ementa e os conteúdos que serão trabalhados no período.',
          icon: <ClipboardList />,
          acao: !busca && (
            <Button icon={<Plus />} onClick={() => navegar('/professor/plano-ensino/novo')}>
              Criar plano de ensino
            </Button>
          ),
        }}
        actions={(plano) => (
          <>
            <Button
              variant="subtle"
              size="small"
              icon={<ClipboardList />}
              onClick={() => navegar(`/professor/plano-ensino/${plano.id}`)}
            >
              Detalhar
            </Button>
            <Button
              variant="subtle"
              size="small"
              icon={<ListTree />}
              onClick={() => navegar(`/professor/plano-ensino/${plano.id}/conteudos`)}
            >
              Conteúdo
            </Button>
          </>
        )}
      />
    </Layout>
  )
}
