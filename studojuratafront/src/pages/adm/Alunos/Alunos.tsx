import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react'

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
import { alunos as servicoAlunos } from '../../../services/endpoints'
import { formatarCpf, formatarIdade, normalizar } from '../../../utils/format'
import type { Aluno } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

export default function Alunos() {
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)

  const { data, loading, error, reload } = useRequisicao(() => servicoAlunos.listar(), [])

  const filtrados = useMemo(() => {
    const lista = data ?? []
    if (!buscaAtrasada.trim()) return lista

    const termo = normalizar(buscaAtrasada)

    return lista.filter(
      (aluno) =>
        normalizar(aluno.pessoa?.nome).includes(termo) ||
        normalizar(aluno.pessoa?.cpf).includes(termo) ||
        normalizar(aluno.matricula).includes(termo),
    )
  }, [data, buscaAtrasada])

  const paginacao = usePaginacao(filtrados)

  const { executar: excluir, executando: excluindo } = useAcao(async (aluno: Aluno) => {
    await confirmar({
      titulo: 'Excluir aluno?',
      descricao: `${aluno.pessoa?.nome} será desativado. As matrículas e o histórico de simulados continuam preservados.`,
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoAlunos.excluir(aluno.id)
          toast.success('Aluno excluído', `${aluno.pessoa?.nome} foi removido da listagem.`)
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

  const colunas: Coluna<Aluno>[] = [
    {
      key: 'matricula',
      cabecalho: 'Matrícula',
      ocultarEmTelaPequena: true,
      render: (aluno) =>
        aluno.matricula ? <Tag variant="neutral">{aluno.matricula}</Tag> : '—',
    },
    {
      key: 'nome',
      cabecalho: 'Nome',
      ordenavel: true,
      valorOrdenacao: (aluno) => aluno.pessoa?.nome ?? '',
      render: (aluno) => aluno.pessoa?.nome ?? '—',
    },
    {
      key: 'cpf',
      cabecalho: 'CPF',
      ocultarEmTelaPequena: true,
      render: (aluno) => formatarCpf(aluno.pessoa?.cpf),
    },
    {
      key: 'idade',
      cabecalho: 'Idade',
      ordenavel: true,
      valorOrdenacao: (aluno) => aluno.pessoa?.dataNascimento ?? '',
      render: (aluno) => formatarIdade(aluno.pessoa?.dataNascimento),
    },
  ]

  return (
    <Layout>
      <Header
        titulo="Alunos"
        actions={
          <Button size="large" icon={<Plus />} onClick={() => navegar('/adm/alunos/novo')}>
            Adicionar aluno
          </Button>
        }
        filtros={
          <BuscaInput value={busca} onChange={setBusca} placeholder="Buscar por nome, CPF ou matrícula..." />
        }
      />

      <DataTable
        descricao="Lista de alunos"
        columns={colunas}
        data={paginacao.itensDaPagina}
        rowKey={(aluno) => aluno.id}
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
          titulo: busca ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado',
          descricao: busca
            ? 'Revise o termo buscado ou limpe o filtro.'
            : 'Cadastre o primeiro aluno para começar a montar as turmas.',
          icon: <GraduationCap />,
          acao: !busca && (
            <Button icon={<Plus />} onClick={() => navegar('/adm/alunos/novo')}>
              Cadastrar aluno
            </Button>
          ),
        }}
        actions={(aluno) => (
          <>
            <IconButton
              label={`Editar ${aluno.pessoa?.nome}`}
              icon={<Pencil />}
              disabled={excluindo}
              onClick={() => navegar(`/adm/alunos/${aluno.id}`)}
            />
            <IconButton
              label={`Excluir ${aluno.pessoa?.nome}`}
              icon={<Trash2 />}
              variant="danger"
              disabled={excluindo}
              onClick={() => excluir(aluno)}
            />
          </>
        )}
      />
    </Layout>
  )
}
