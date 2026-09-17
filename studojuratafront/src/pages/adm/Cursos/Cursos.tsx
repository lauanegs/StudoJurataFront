import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Archive, ArchiveRestore, Library, Pencil, Plus } from 'lucide-react'

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
import { cursos as servicoCursos } from '../../../services/curriculo'
import { formatarCargaHoraria, normalizar } from '../../../utils/format'
import { ROTULO_ATIVO_INATIVO, ATIVO_INATIVO_VARIANT } from '../../../utils/labels'
import type { Curso } from '../../../types/curriculo'
import type { Coluna } from '../../../components/ui/DataTable/types'

export default function Cursos() {
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)

  const { data, loading, error, reload } = useRequisicao(() => servicoCursos.listar(), [])

  const filtrados = useMemo(() => {
    const lista = data ?? []
    if (!buscaAtrasada.trim()) return lista

    const termo = normalizar(buscaAtrasada)
    return lista.filter((curso) => normalizar(curso.nome).includes(termo))
  }, [data, buscaAtrasada])

  const paginacao = usePaginacao(filtrados)

  const { executar: excluir, executando: excluindo } = useAcao(async (curso: Curso) => {
    await confirmar({
      titulo: 'Inativar curso?',
      descricao: `"${curso.nome}" será inativado. Turmas e planos de ensino já vinculados são preservados.`,
      rotuloConfirmar: 'Inativar',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoCursos.excluir(curso.id)
          toast.success('Curso inativado')
          await reload()
        } catch (erroExclusao) {
          toast.error(
            'Não foi possível inativar',
            erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
          )
        }
      },
    })
  })

  const { executar: ativar, executando: ativando } = useAcao(async (curso: Curso) => {
    await confirmar({
      titulo: 'Ativar curso?',
      descricao: `"${curso.nome}" voltará a ficar ativo.`,
      rotuloConfirmar: 'Ativar',
      aoConfirmar: async () => {
        try {
          await servicoCursos.ativar(curso.id)
          toast.success('Curso ativado')
          await reload()
        } catch (erroAtivacao) {
          toast.error(
            'Não foi possível ativar',
            erroAtivacao instanceof ApiError ? erroAtivacao.message : undefined,
          )
        }
      },
    })
  })

  const colunas: Coluna<Curso>[] = [
    {
      key: 'nome',
      cabecalho: 'Nome',
      ordenavel: true,
      valorOrdenacao: (curso) => curso.nome,
      render: (curso) => curso.nome,
    },
    {
      key: 'carga',
      cabecalho: 'Carga horária',
      ordenavel: true,
      valorOrdenacao: (curso) => curso.cargaHorariaTotal ?? 0,
      render: (curso) => formatarCargaHoraria(curso.cargaHorariaTotal),
    },
    {
      key: 'descricao',
      cabecalho: 'Descrição',
      ocultarEmTelaPequena: true,
      render: (curso) => curso.descricao ?? '—',
    },
    {
      key: 'status',
      cabecalho: 'Status',
      render: (curso) =>
        curso.status ? (
          <Tag variant={ATIVO_INATIVO_VARIANT[curso.status]}>
            {ROTULO_ATIVO_INATIVO[curso.status]}
          </Tag>
        ) : (
          '—'
        ),
    },
  ]

  return (
    <Layout>
      <Header
        titulo="Cursos"
        actions={
          <Button size="large" icon={<Plus />} onClick={() => navegar('/adm/cursos/novo')}>
            Adicionar curso
          </Button>
        }
        filtros={<BuscaInput value={busca} onChange={setBusca} placeholder="Buscar curso..." />}
      />

      <DataTable
        descricao="Lista de cursos"
        columns={colunas}
        data={paginacao.itensDaPagina}
        rowKey={(curso) => curso.id}
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
          titulo: busca ? 'Nenhum curso encontrado' : 'Nenhum curso cadastrado',
          descricao: busca
            ? 'Revise o termo buscado ou limpe o filtro.'
            : 'O curso é o ponto de partida: turmas e planos de ensino dependem dele.',
          icon: <Library />,
          acao: !busca && (
            <Button icon={<Plus />} onClick={() => navegar('/adm/cursos/novo')}>
              Cadastrar curso
            </Button>
          ),
        }}
        actions={(curso) => (
          <>
            <IconButton
              label={`Editar ${curso.nome}`}
              icon={<Pencil />}
              disabled={excluindo || ativando}
              onClick={() => navegar(`/adm/cursos/${curso.id}`)}
            />
            {curso.status === 'INATIVO' ? (
              <IconButton
                label={`Ativar ${curso.nome}`}
                icon={<ArchiveRestore />}
                variant="success"
                disabled={excluindo || ativando}
                onClick={() => ativar(curso)}
              />
            ) : (
              <IconButton
                label={`Inativar ${curso.nome}`}
                icon={<Archive />}
                variant="danger"
                disabled={excluindo || ativando}
                onClick={() => excluir(curso)}
              />
            )}
          </>
        )}
      />
    </Layout>
  )
}
