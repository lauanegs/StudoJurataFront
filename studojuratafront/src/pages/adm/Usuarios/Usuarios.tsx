import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, Pencil, Plus, Trash2 } from 'lucide-react'

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
import { usuarios as servicoUsuarios } from '../../../services/endpoints'
import { normalizar } from '../../../utils/format'
import { ROTULO_ATIVO_INATIVO, ATIVO_INATIVO_VARIANT, ROTULO_TIPO_USUARIO } from '../../../utils/labels'
import type { Usuario } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

export default function Usuarios() {
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)

  const { data, loading, error, reload } = useRequisicao(() => servicoUsuarios.listar(), [])

  const filtrados = useMemo(() => {
    const lista = data ?? []
    if (!buscaAtrasada.trim()) return lista

    const termo = normalizar(buscaAtrasada)

    return lista.filter(
      (usuario) =>
        normalizar(usuario.username).includes(termo) ||
        normalizar(usuario.pessoa?.nome).includes(termo),
    )
  }, [data, buscaAtrasada])

  const paginacao = usePaginacao(filtrados)

  const { executar: excluir, executando: excluindo } = useAcao(async (usuario: Usuario) => {
    await confirmar({
      titulo: 'Excluir usuário?',
      descricao: `O login de "${usuario.pessoa?.nome}" (${usuario.username}) será desativado.`,
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoUsuarios.excluir(usuario.id)
          toast.success('Usuário excluído')
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

  const colunas: Coluna<Usuario>[] = [
    {
      key: 'username',
      cabecalho: 'Usuário',
      ordenavel: true,
      valorOrdenacao: (usuario) => usuario.username ?? '',
      render: (usuario) => usuario.username ?? '—',
    },
    {
      key: 'pessoa',
      cabecalho: 'Pessoa',
      ordenavel: true,
      valorOrdenacao: (usuario) => usuario.pessoa?.nome ?? '',
      render: (usuario) => usuario.pessoa?.nome ?? '—',
    },
    {
      key: 'tipo',
      cabecalho: 'Tipo',
      render: (usuario) => (
        <Tag variant="neutral">{ROTULO_TIPO_USUARIO[usuario.tipoUsuario]}</Tag>
      ),
    },
    {
      key: 'status',
      cabecalho: 'Status',
      render: (usuario) =>
        usuario.status ? (
          <Tag variant={ATIVO_INATIVO_VARIANT[usuario.status]}>
            {ROTULO_ATIVO_INATIVO[usuario.status]}
          </Tag>
        ) : (
          '—'
        ),
    },
  ]

  return (
    <Layout>
      <Header
        titulo="Usuários"
        actions={
          <Button size="large" icon={<Plus />} onClick={() => navegar('/adm/usuarios/novo')}>
            Adicionar usuário
          </Button>
        }
        filtros={<BuscaInput value={busca} onChange={setBusca} placeholder="Buscar usuário..." />}
      />

      <DataTable
        descricao="Lista de usuários"
        columns={colunas}
        data={paginacao.itensDaPagina}
        rowKey={(usuario) => usuario.id}
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
          titulo: busca ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado',
          descricao: busca
            ? 'Revise o termo buscado ou limpe o filtro.'
            : 'Crie um login vinculado a uma pessoa já cadastrada (aluno, professor ou responsável).',
          icon: <KeyRound />,
          acao: !busca && (
            <Button icon={<Plus />} onClick={() => navegar('/adm/usuarios/novo')}>
              Cadastrar usuário
            </Button>
          ),
        }}
        actions={(usuario) => (
          <>
            <IconButton
              label={`Editar ${usuario.username}`}
              icon={<Pencil />}
              disabled={excluindo}
              onClick={() => navegar(`/adm/usuarios/${usuario.id}`)}
            />
            <IconButton
              label={`Excluir ${usuario.username}`}
              icon={<Trash2 />}
              variant="danger"
              disabled={excluindo}
              onClick={() => excluir(usuario)}
            />
          </>
        )}
      />
    </Layout>
  )
}
