import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { ClipboardList, ListTree, Plus } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { BuscaInput } from '../../../components/ui/BuscaInput'
import { Button } from '../../../components/ui/Button'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { Tab } from '../../../components/ui/Tab'
import { Tag } from '../../../components/ui/Tag'
import { useDebounce } from '../../../hooks/useDebounce'
import { usePaginacao } from '../../../hooks/usePaginacao'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { planosEnsino as servicoPlanos } from '../../../services/endpoints'
import { formatarCargaHoraria, formatarPeriodo, normalizar } from '../../../utils/format'
import { ROTULO_STATUS_PLANO, STATUS_PLANO_VARIANT } from '../../../utils/labels'
import type { PlanoEnsino } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

/* Confirmado no Figma: botão "Adicionar plano" (150px) + busca (250px) na
   mesma linha, coladas uma na outra — mesmo padrão já usado em Registrar
   Aula/Notas (o slot de filtros do Header encolhe pro conteúdo real). */
const CamposCabecalho = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`

const LarguraBusca = styled.div`
  width: 250px;
`

type Visao = 'meus' | 'outros'

export default function PlanosEnsino() {
  const navegar = useNavigate()
  const { professorId } = useProfessorLogado()

  const [visao, setVisao] = useState<Visao>('meus')
  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)

  const { data, loading, error, reload } = useRequisicao(() => servicoPlanos.listar(), [])

  // Separado em abas (pedido explícito): "Meus planos" primeiro (o caso
  // comum — o professor cuidando do que é dele), "Outros planos" só pra
  // consulta/referência do que os colegas já montaram pro mesmo curso.
  // Planos antigos sem professor vinculado (dado migrado antes desse campo
  // existir) caem em "Outros", nunca em "Meus" — evita atribuir autoria
  // errada por omissão.
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
    if (!buscaAtrasada.trim()) return listaDaVisao

    const termo = normalizar(buscaAtrasada)

    return listaDaVisao.filter(
      (plano) =>
        normalizar(plano.turmaDisciplina?.turma?.titulo).includes(termo) ||
        normalizar(plano.curso?.nome).includes(termo) ||
        normalizar(plano.turmaDisciplina?.disciplina?.titulo).includes(termo),
    )
  }, [listaDaVisao, buscaAtrasada])

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
          titulo: busca
            ? 'Nenhum plano encontrado'
            : visao === 'meus'
              ? 'Você ainda não tem planos de ensino'
              : 'Nenhum plano de outro professor',
          descricao: busca
            ? 'Revise o termo buscado ou limpe o filtro.'
            : visao === 'meus'
              ? 'O plano de ensino define a ementa e os conteúdos que serão trabalhados no período.'
              : 'Ainda não há planos de ensino cadastrados por outros professores.',
          icon: <ClipboardList />,
          acao: !busca && visao === 'meus' && (
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
