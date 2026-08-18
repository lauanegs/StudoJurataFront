import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Plus, Trash2, UserCog } from 'lucide-react'

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
import { professores as servicoProfessores } from '../../../services/endpoints'
import { formatarCpf, formatarTelefone, normalizar } from '../../../utils/format'
import { ROTULO_ATIVO_INATIVO, ATIVO_INATIVO_VARIANT } from '../../../utils/labels'
import type { Professor } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

export default function Professores() {
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)

  const { data, loading, error, reload } = useRequisicao(() => servicoProfessores.listar(), [])

  const filtrados = useMemo(() => {
    const lista = data ?? []
    if (!buscaAtrasada.trim()) return lista

    const termo = normalizar(buscaAtrasada)

    return lista.filter(
      (professor) =>
        normalizar(professor.pessoa?.nome).includes(termo) ||
        normalizar(professor.pessoa?.cpf).includes(termo),
    )
  }, [data, buscaAtrasada])

  const paginacao = usePaginacao(filtrados)

  const { executar: excluir, executando: excluindo } = useAcao(async (professor: Professor) => {
    await confirmar({
      titulo: 'Excluir professor?',
      descricao: `${professor.pessoa?.nome} será desativado. As turmas em que ele leciona precisarão de um novo responsável.`,
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoProfessores.excluir(professor.id)
          toast.success('Professor excluído')
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

  const colunas: Coluna<Professor>[] = [
    {
      key: 'nome',
      cabecalho: 'Nome',
      ordenavel: true,
      valorOrdenacao: (professor) => professor.pessoa?.nome ?? '',
      render: (professor) => professor.pessoa?.nome ?? '—',
    },
    {
      key: 'cpf',
      cabecalho: 'CPF',
      ocultarEmTelaPequena: true,
      render: (professor) => formatarCpf(professor.pessoa?.cpf),
    },
    {
      key: 'contato',
      cabecalho: 'Contato',
      ocultarEmTelaPequena: true,
      render: (professor) =>
        professor.pessoa?.telefone
          ? formatarTelefone(professor.pessoa.telefone)
          : (professor.pessoa?.email ?? '—'),
    },
    {
      key: 'status',
      cabecalho: 'Status',
      render: (professor) =>
        professor.status ? (
          <Tag variant={ATIVO_INATIVO_VARIANT[professor.status]} ponto>
            {ROTULO_ATIVO_INATIVO[professor.status]}
          </Tag>
        ) : (
          '—'
        ),
    },
  ]

  return (
    <Layout>
      <Header
        titulo="Professores"
        subtitulo={!loading && !error ? `${filtrados.length} professor(es)` : undefined}
        actions={
          <Button icon={<Plus />} onClick={() => navegar('/adm/professores/novo')}>
            Adicionar professor
          </Button>
        }
        filtros={<BuscaInput value={busca} onChange={setBusca} placeholder="Buscar professor..." />}
      />

      <DataTable
        descricao="Lista de professores"
        columns={colunas}
        data={paginacao.itensDaPagina}
        rowKey={(professor) => professor.id}
        loading={loading}
        error={error}
        onReload={reload}
        onRowClick={(professor) => navegar(`/adm/professores/${professor.id}`)}
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
          titulo: busca ? 'Nenhum professor encontrado' : 'Nenhum professor cadastrado',
          descricao: busca
            ? 'Revise o termo buscado ou limpe o filtro.'
            : 'Cadastre os professores antes de vinculá-los às turmas.',
          icon: <UserCog />,
          acao: !busca && (
            <Button icon={<Plus />} onClick={() => navegar('/adm/professores/novo')}>
              Cadastrar professor
            </Button>
          ),
        }}
        actions={(professor) => (
          <>
            <IconButton
              label={`Editar ${professor.pessoa?.nome}`}
              icon={<Pencil />}
              disabled={excluindo}
              onClick={() => navegar(`/adm/professores/${professor.id}`)}
            />
            <IconButton
              label={`Excluir ${professor.pessoa?.nome}`}
              icon={<Trash2 />}
              variant="danger"
              disabled={excluindo}
              onClick={() => excluir(professor)}
            />
          </>
        )}
      />
    </Layout>
  )
}
