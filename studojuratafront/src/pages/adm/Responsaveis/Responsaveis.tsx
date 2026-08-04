import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Plus, Trash2, UserRound } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { BuscaInput } from '../../../components/ui/BuscaInput'
import { Button } from '../../../components/ui/Button'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { IconButton } from '../../../components/ui/IconButton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useDebounce } from '../../../hooks/useDebounce'
import { usePaginacao } from '../../../hooks/usePaginacao'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { responsaveis as servicoResponsaveis } from '../../../services/endpoints'
import { formatarCpf, formatarTelefone, normalizar } from '../../../utils/format'
import type { Responsavel } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

export default function Responsaveis() {
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)

  const { data, loading, error, reload } = useRequisicao(
    () => servicoResponsaveis.listar(),
    [],
  )

  const filtrados = useMemo(() => {
    const lista = data ?? []
    if (!buscaAtrasada.trim()) return lista

    const termo = normalizar(buscaAtrasada)

    return lista.filter(
      (responsavel) =>
        normalizar(responsavel.pessoa?.nome).includes(termo) ||
        normalizar(responsavel.pessoa?.cpf).includes(termo),
    )
  }, [data, buscaAtrasada])

  const paginacao = usePaginacao(filtrados)

  async function excluir(responsavel: Responsavel) {
    const confirmado = await confirmar({
      titulo: 'Excluir responsável?',
      descricao: `Os vínculos de ${responsavel.pessoa?.nome} com os alunos serão removidos.`,
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
    })

    if (!confirmado) return

    try {
      await servicoResponsaveis.excluir(responsavel.id)
      toast.success('Responsável excluído')
      await reload()
    } catch (erroExclusao) {
      toast.error(
        'Não foi possível excluir',
        erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
      )
    }
  }

  const colunas: Coluna<Responsavel>[] = [
    {
      key: 'nome',
      cabecalho: 'Nome',
      ordenavel: true,
      valorOrdenacao: (responsavel) => responsavel.pessoa?.nome ?? '',
      render: (responsavel) => responsavel.pessoa?.nome ?? '—',
    },
    {
      key: 'cpf',
      cabecalho: 'CPF',
      ocultarEmTelaPequena: true,
      render: (responsavel) => formatarCpf(responsavel.pessoa?.cpf),
    },
    {
      key: 'telefone',
      cabecalho: 'Telefone',
      render: (responsavel) => formatarTelefone(responsavel.pessoa?.telefone),
    },
    {
      key: 'email',
      cabecalho: 'E-mail',
      ocultarEmTelaPequena: true,
      render: (responsavel) => responsavel.pessoa?.email ?? '—',
    },
  ]

  return (
    <Layout>
      <Header
        titulo="Responsáveis"
        subtitulo={!loading && !error ? `${filtrados.length} responsável(is)` : undefined}
        actions={
          <Button icon={<Plus />} onClick={() => navegar('/adm/responsaveis/novo')}>
            Adicionar responsável
          </Button>
        }
        filtros={<BuscaInput value={busca} onChange={setBusca} placeholder="Buscar responsável..." />}
      />

      <DataTable
        descricao="Lista de responsáveis"
        columns={colunas}
        data={paginacao.itensDaPagina}
        rowKey={(responsavel) => responsavel.id}
        loading={loading}
        error={error}
        onReload={reload}
        onRowClick={(responsavel) => navegar(`/adm/responsaveis/${responsavel.id}`)}
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
          titulo: busca ? 'Nenhum responsável encontrado' : 'Nenhum responsável cadastrado',
          descricao: busca
            ? 'Revise o termo buscado ou limpe o filtro.'
            : 'Cadastre os responsáveis antes de vinculá-los aos alunos.',
          icon: <UserRound />,
          acao: !busca && (
            <Button icon={<Plus />} onClick={() => navegar('/adm/responsaveis/novo')}>
              Cadastrar responsável
            </Button>
          ),
        }}
        actions={(responsavel) => (
          <>
            <IconButton
              label={`Editar ${responsavel.pessoa?.nome}`}
              icon={<Pencil />}
              onClick={() => navegar(`/adm/responsaveis/${responsavel.id}`)}
            />
            <IconButton
              label={`Excluir ${responsavel.pessoa?.nome}`}
              icon={<Trash2 />}
              variant="danger"
              onClick={() => excluir(responsavel)}
            />
          </>
        )}
      />
    </Layout>
  )
}
