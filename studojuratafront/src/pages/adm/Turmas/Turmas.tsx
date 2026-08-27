import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Plus, Trash2, Users } from 'lucide-react'

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
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { matriculas, turmas as servicoTurmas } from '../../../services/endpoints'
import { formatarData, normalizar } from '../../../utils/format'
import { ROTULO_STATUS_TURMA } from '../../../utils/labels'
import type { Turma } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

export default function Turmas() {
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)

  const { data, loading, error, reload } = useRequisicao(() => servicoTurmas.listar(), [])

  /**
   * A quantidade de alunos ativos é derivada das matrículas (Turma não
   * persiste esse número). Carregamos todas as matrículas uma vez e contamos
   * no cliente — mais barato que um GET /turmas/{id}/alunos-ativos por linha.
   */
  const requisicaoMatriculas = useRequisicao(() => matriculas.listar(), [])

  const ativosPorTurma = useMemo(() => {
    const contagem: Record<number, number> = {}

    ;(requisicaoMatriculas.data ?? []).forEach((matricula) => {
      if (matricula.status !== 'ATIVA' || !matricula.turma?.id) return
      contagem[matricula.turma.id] = (contagem[matricula.turma.id] ?? 0) + 1
    })

    return contagem
  }, [requisicaoMatriculas.data])

  const filtradas = useMemo(() => {
    const lista = data ?? []
    if (!buscaAtrasada.trim()) return lista

    const termo = normalizar(buscaAtrasada)

    return lista.filter(
      (turma) =>
        normalizar(turma.titulo).includes(termo) || normalizar(turma.curso?.nome).includes(termo),
    )
  }, [data, buscaAtrasada])

  const paginacao = usePaginacao(filtradas)

  const { executar: excluir, executando: excluindo } = useAcao(async (turma: Turma) => {
    await confirmar({
      titulo: 'Excluir turma?',
      descricao: `"${turma.titulo}" será desativada. O histórico de matrículas é preservado.`,
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoTurmas.excluir(turma.id)
          toast.success('Turma excluída')
          await reload()
        } catch (erroExclusao) {
          toast.error(
            'Não foi possível excluir',
            erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
          )
        }
      },
    })
  })

  const colunas: Coluna<Turma>[] = [
    {
      key: 'titulo',
      cabecalho: 'Turma',
      ordenavel: true,
      valorOrdenacao: (turma) => turma.titulo ?? '',
      render: (turma) => turma.titulo ?? '—',
    },
    {
      key: 'curso',
      cabecalho: 'Curso',
      ocultarEmTelaPequena: true,
      render: (turma) => turma.curso?.nome ?? '—',
    },
    {
      key: 'alunos',
      cabecalho: 'Alunos ativos',
      alinhamento: 'center',
      ordenavel: true,
      valorOrdenacao: (turma) => ativosPorTurma[turma.id] ?? 0,
      render: (turma) => {
        const ativos = ativosPorTurma[turma.id] ?? 0
        const capacidade = turma.capacidadeMaxima

        return (
          <Tag variant={capacidade && ativos >= capacidade ? 'warning' : 'neutral'}>
            {capacidade ? `${ativos} / ${capacidade}` : ativos}
          </Tag>
        )
      },
    },
    {
      key: 'periodo',
      cabecalho: 'Período',
      ocultarEmTelaPequena: true,
      render: (turma) =>
        turma.dataInicio
          ? `${formatarData(turma.dataInicio)} — ${turma.dataFim ? formatarData(turma.dataFim) : 'em aberto'}`
          : '—',
    },
    {
      key: 'status',
      cabecalho: 'Status',
      render: (turma) =>
        turma.status ? (
          <Tag variant={turma.status === 'ATIVA' ? 'success' : 'neutral'} ponto>
            {ROTULO_STATUS_TURMA[turma.status]}
          </Tag>
        ) : (
          '—'
        ),
    },
  ]

  return (
    <Layout>
      <Header
        titulo="Turmas"
        subtitulo={!loading && !error ? `${filtradas.length} turma(s)` : undefined}
        actions={
          <Button size="large" icon={<Plus />} onClick={() => navegar('/adm/turmas/nova')}>
            Adicionar turma
          </Button>
        }
        filtros={<BuscaInput value={busca} onChange={setBusca} placeholder="Buscar por turma ou curso..." />}
      />

      <DataTable
        descricao="Lista de turmas"
        columns={colunas}
        data={paginacao.itensDaPagina}
        rowKey={(turma) => turma.id}
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
          titulo: busca ? 'Nenhuma turma encontrada' : 'Nenhuma turma cadastrada',
          descricao: busca
            ? 'Revise o termo buscado ou limpe o filtro.'
            : 'Crie a primeira turma para começar a matricular alunos.',
          icon: <Users />,
          acao: !busca && (
            <Button icon={<Plus />} onClick={() => navegar('/adm/turmas/nova')}>
              Criar turma
            </Button>
          ),
        }}
        actions={(turma) => (
          <>
            <IconButton
              label={`Editar ${turma.titulo}`}
              icon={<Pencil />}
              disabled={excluindo}
              onClick={() => navegar(`/adm/turmas/${turma.id}`)}
            />
            <IconButton
              label={`Excluir ${turma.titulo}`}
              icon={<Trash2 />}
              variant="danger"
              disabled={excluindo}
              onClick={() => excluir(turma)}
            />
          </>
        )}
      />
    </Layout>
  )
}
