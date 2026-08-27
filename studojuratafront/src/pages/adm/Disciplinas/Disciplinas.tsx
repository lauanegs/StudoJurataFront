import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react'

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
import { disciplinas as servicoDisciplinas } from '../../../services/endpoints'
import { normalizar } from '../../../utils/format'
import { ROTULO_ATIVO_INATIVO, ATIVO_INATIVO_VARIANT } from '../../../utils/labels'
import type { Disciplina } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

export default function Disciplinas() {
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)

  const { data, loading, error, reload } = useRequisicao(
    () => servicoDisciplinas.listar(),
    [],
  )

  const filtradas = useMemo(() => {
    const lista = data ?? []
    if (!buscaAtrasada.trim()) return lista

    const termo = normalizar(buscaAtrasada)
    return lista.filter((disciplina) => normalizar(disciplina.titulo).includes(termo))
  }, [data, buscaAtrasada])

  const paginacao = usePaginacao(filtradas)

  const { executar: excluir, executando: excluindo } = useAcao(async (disciplina: Disciplina) => {
    await confirmar({
      titulo: 'Excluir disciplina?',
      descricao: `"${disciplina.titulo}" será desativada. Notas e simulados já lançados são preservados.`,
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoDisciplinas.excluir(disciplina.id)
          toast.success('Disciplina excluída')
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

  const colunas: Coluna<Disciplina>[] = [
    {
      key: 'titulo',
      cabecalho: 'Disciplina',
      ordenavel: true,
      valorOrdenacao: (disciplina) => disciplina.titulo ?? '',
      render: (disciplina) => disciplina.titulo ?? '—',
    },
    {
      key: 'status',
      cabecalho: 'Status',
      render: (disciplina) =>
        disciplina.status ? (
          <Tag variant={ATIVO_INATIVO_VARIANT[disciplina.status]} ponto>
            {ROTULO_ATIVO_INATIVO[disciplina.status]}
          </Tag>
        ) : (
          '—'
        ),
    },
  ]

  return (
    <Layout>
      <Header
        titulo="Disciplinas"
        subtitulo={!loading && !error ? `${filtradas.length} disciplina(s)` : undefined}
        actions={
          <Button size="large" icon={<Plus />} onClick={() => navegar('/adm/disciplinas/nova')}>
            Adicionar disciplina
          </Button>
        }
        filtros={<BuscaInput value={busca} onChange={setBusca} placeholder="Buscar disciplina..." />}
      />

      <DataTable
        descricao="Lista de disciplinas"
        columns={colunas}
        data={paginacao.itensDaPagina}
        rowKey={(disciplina) => disciplina.id}
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
          titulo: busca ? 'Nenhuma disciplina encontrada' : 'Nenhuma disciplina cadastrada',
          descricao: busca
            ? 'Revise o termo buscado ou limpe o filtro.'
            : 'As disciplinas organizam planos de ensino, simulados e notas.',
          icon: <BookOpen />,
          acao: !busca && (
            <Button icon={<Plus />} onClick={() => navegar('/adm/disciplinas/nova')}>
              Cadastrar disciplina
            </Button>
          ),
        }}
        actions={(disciplina) => (
          <>
            <IconButton
              label={`Editar ${disciplina.titulo}`}
              icon={<Pencil />}
              disabled={excluindo}
              onClick={() => navegar(`/adm/disciplinas/${disciplina.id}`)}
            />
            <IconButton
              label={`Excluir ${disciplina.titulo}`}
              icon={<Trash2 />}
              variant="danger"
              disabled={excluindo}
              onClick={() => excluir(disciplina)}
            />
          </>
        )}
      />
    </Layout>
  )
}
