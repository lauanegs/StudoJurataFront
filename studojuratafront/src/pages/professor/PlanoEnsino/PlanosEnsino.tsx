import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { BuscaInput } from '../../../components/ui/BuscaInput'
import { Button } from '../../../components/ui/Button'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { IconButton } from '../../../components/ui/IconButton'
import { Tag } from '../../../components/ui/Tag'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useDebounce } from '../../../hooks/useDebounce'
import { usePaginacao } from '../../../hooks/usePaginacao'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { planosEnsino as servicoPlanos } from '../../../services/endpoints'
import { formatarCargaHoraria, normalizar } from '../../../utils/format'
import { ROTULO_ATIVO_INATIVO, ATIVO_INATIVO_VARIANT } from '../../../utils/labels'
import type { PlanoEnsino } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

export default function PlanosEnsino() {
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)

  const { data, loading, error, reload } = useRequisicao(() => servicoPlanos.listar(), [])

  const filtrados = useMemo(() => {
    const lista = data ?? []
    if (!buscaAtrasada.trim()) return lista

    const termo = normalizar(buscaAtrasada)

    return lista.filter(
      (plano) =>
        normalizar(plano.titulo).includes(termo) ||
        normalizar(plano.curso?.nome).includes(termo) ||
        normalizar(plano.periodoLetivo).includes(termo) ||
        normalizar(plano.turmaDisciplina?.disciplina?.titulo).includes(termo),
    )
  }, [data, buscaAtrasada])

  const paginacao = usePaginacao(filtrados)

  async function excluir(plano: PlanoEnsino) {
    const confirmado = await confirmar({
      titulo: 'Excluir plano de ensino?',
      descricao: 'O plano será desativado. Os conteúdos e planos de aula vinculados permanecem.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
    })

    if (!confirmado) return

    try {
      await servicoPlanos.excluir(plano.id)
      toast.success('Plano de ensino excluído')
      await reload()
    } catch (erroExclusao) {
      toast.error(
        'Não foi possível excluir',
        erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
      )
    }
  }

  const colunas: Coluna<PlanoEnsino>[] = [
    {
      key: 'titulo',
      cabecalho: 'Plano',
      ordenavel: true,
      valorOrdenacao: (plano) => plano.titulo ?? '',
      render: (plano) => plano.titulo ?? `Plano #${plano.id}`,
    },
    {
      key: 'curso',
      cabecalho: 'Curso',
      render: (plano) => plano.curso?.nome ?? '—',
    },
    {
      key: 'disciplina',
      cabecalho: 'Turma / Disciplina',
      ocultarEmTelaPequena: true,
      render: (plano) =>
        plano.turmaDisciplina ? (
          <Tag variant="purple">
            {plano.turmaDisciplina.turma?.titulo} · {plano.turmaDisciplina.disciplina?.titulo}
          </Tag>
        ) : (
          <Tag variant="neutral">Não vinculado</Tag>
        ),
    },
    {
      key: 'periodo',
      cabecalho: 'Período letivo',
      ordenavel: true,
      valorOrdenacao: (plano) => plano.periodoLetivo,
      render: (plano) => plano.periodoLetivo,
    },
    {
      key: 'carga',
      cabecalho: 'Carga',
      ocultarEmTelaPequena: true,
      render: (plano) => formatarCargaHoraria(plano.cargaHoraria),
    },
    {
      key: 'status',
      cabecalho: 'Status',
      render: (plano) =>
        plano.status ? (
          <Tag variant={ATIVO_INATIVO_VARIANT[plano.status]} ponto>
            {ROTULO_ATIVO_INATIVO[plano.status]}
          </Tag>
        ) : (
          '—'
        ),
    },
  ]

  return (
    <Layout>
      <Header
        titulo="Planos de ensino"
        subtitulo={!loading && !error ? `${filtrados.length} plano(s)` : undefined}
        actions={
          <Button icon={<Plus />} onClick={() => navegar('/professor/plano-ensino/novo')}>
            Novo plano
          </Button>
        }
        filtros={
          <BuscaInput value={busca} onChange={setBusca} placeholder="Buscar por plano, curso ou período..." />
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
        onRowClick={(plano) => navegar(`/professor/plano-ensino/${plano.id}/conteudos`)}
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
            <IconButton
              label="Editar plano"
              icon={<Pencil />}
              onClick={() => navegar(`/professor/plano-ensino/${plano.id}`)}
            />
            <IconButton
              label="Excluir plano"
              icon={<Trash2 />}
              variant="danger"
              onClick={() => excluir(plano)}
            />
          </>
        )}
      />
    </Layout>
  )
}
