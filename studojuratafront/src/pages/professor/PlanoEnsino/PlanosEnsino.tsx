import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, ListTree, Plus } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { DataTable } from '../../../components/ui/DataTable'
import { Header, CamposFiltro, CampoFiltro } from '../../../components/ui/Header'
import { Select } from '../../../components/ui/Select'
import { Tab } from '../../../components/ui/Tab'
import { Tag } from '../../../components/ui/Tag'
import { usePaginacao } from '../../../hooks/usePaginacao'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { planosEnsino as servicoPlanos } from '../../../services/planejamento'
import { formatarCargaHoraria, formatarPeriodo } from '../../../utils/format'
import { ROTULO_STATUS_PLANO, STATUS_PLANO_VARIANT } from '../../../utils/labels'
import type { PlanoEnsino } from '../../../types/planejamento'
import type { Coluna } from '../../../components/ui/DataTable/types'

type Visao = 'meus' | 'outros'

export default function PlanosEnsino() {
  const navegar = useNavigate()
  const { professorId } = useProfessorLogado()

  const [visao, setVisao] = useState<Visao>('meus')
  const [turmaId, setTurmaId] = useState<number | null>(null)

  const { data, loading, error, reload } = useRequisicao(() => servicoPlanos.listar(), [])

  // Sem requisição própria pra turmas — reaproveita as que já aparecem nos
  // planos carregados (evita mais uma chamada só pra montar o filtro).
  const opcoesTurmas = useMemo(() => {
    const unicas = new Map<number, string>()
    for (const plano of data ?? []) {
      const turma = plano.turmaDisciplina?.turma
      if (turma) unicas.set(turma.id, turma.titulo)
    }
    return [...unicas.entries()].map(([value, label]) => ({ value, label }))
  }, [data])

  // Planos sem professor vinculado caem em "Outros", para não atribuir autoria errada.
  const meus = useMemo(
    () => (data ?? []).filter((plano) => plano.professor?.id === professorId),
    [data, professorId],
  )
  const outros = useMemo(
    () => (data ?? []).filter((plano) => plano.professor?.id !== professorId),
    [data, professorId],
  )
  const listaDaVisao = visao === 'meus' ? meus : outros

  const filtrados = useMemo(() => {
    if (!turmaId) return listaDaVisao
    return listaDaVisao.filter((plano) => plano.turmaDisciplina?.turma?.id === turmaId)
  }, [listaDaVisao, turmaId])

  const paginacao = usePaginacao(filtrados)

  const colunas: Coluna<PlanoEnsino>[] = [
    {
      key: 'numero',
      cabecalho: 'Nº',
      largura: '64px',
      ordenavel: true,
      valorOrdenacao: (plano) => plano.id,
      render: (plano) => plano.id,
    },
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
    // Só faz sentido mostrar de quem é o plano na aba "Outros" — na aba
    // "Meus" seria sempre a mesma pessoa (redundante).
    ...(visao === 'outros'
      ? [
          {
            key: 'professor',
            cabecalho: 'Professor',
            render: (plano: PlanoEnsino) => plano.professor?.pessoa?.nome ?? '—',
          } satisfies Coluna<PlanoEnsino>,
        ]
      : []),
    {
      key: 'disciplina',
      cabecalho: 'Disciplina',
      ocultarEmTelaPequena: true,
      render: (plano) => plano.turmaDisciplina?.disciplina?.titulo ?? '—',
    },
    {
      key: 'carga',
      cabecalho: 'Carga horária',
      ocultarEmTelaPequena: true,
      render: (plano) => formatarCargaHoraria(plano.cargaHoraria),
    },
    {
      key: 'periodo',
      cabecalho: 'Período',
      ocultarEmTelaPequena: true,
      render: (plano) => formatarPeriodo(plano.dataInicio, plano.dataFim),
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
        titulo="Planos de Ensino"
        filtros={
          <CamposFiltro>
            <Button icon={<Plus />} size="large" onClick={() => navegar('/professor/plano-ensino/novo')}>
              Adicionar plano
            </Button>

            <CampoFiltro $largura="220px">
              <Select<number>
                placeholder="Filtrar por turma"
                options={opcoesTurmas}
                value={turmaId}
                clearable
                searchable
                onChange={setTurmaId}
              />
            </CampoFiltro>
          </CamposFiltro>
        }
      />

      <Tab<Visao>
        rotuloAcessivel="Meus planos ou de outros professores"
        value={visao}
        onChange={setVisao}
        options={[
          { value: 'meus', label: 'Meus planos', contador: meus.length },
          { value: 'outros', label: 'Outros planos', contador: outros.length },
        ]}
      />

      <DataTable
        descricao="Planos de ensino"
        columns={colunas}
        data={paginacao.itensDaPagina}
        rowKey={(plano) => plano.id}
        loading={loading}
        error={error}
        onReload={reload}
        // Muitas colunas: sem quebra, as ações empurram a tabela para o scroll horizontal.
        quebrarAcoes
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
          titulo: turmaId
            ? 'Nenhum plano encontrado'
            : visao === 'meus'
              ? 'Você ainda não tem planos de ensino'
              : 'Nenhum plano de outro professor',
          descricao: turmaId
            ? 'Nenhum plano de ensino para a turma selecionada.'
            : visao === 'meus'
              ? 'O plano de ensino define a ementa e os conteúdos que serão trabalhados no período.'
              : 'Ainda não há planos de ensino cadastrados por outros professores.',
          icon: <ClipboardList />,
          acao: !turmaId && visao === 'meus' && (
            <Button icon={<Plus />} onClick={() => navegar('/professor/plano-ensino/novo')}>
              Cadastrar plano de ensino
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
