import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers, Pencil, Plus, Trash2 } from 'lucide-react'

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
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { planosAula as servicoPlanos, professores } from '../../../services/endpoints'
import { normalizar } from '../../../utils/format'
import { ROTULO_ATIVO_INATIVO, ATIVO_INATIVO_VARIANT } from '../../../utils/labels'
import type { PlanoAula } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

export default function PlanosAula() {
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()
  const { professorId } = useProfessorLogado()

  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)

  const requisicaoVinculos = useRequisicao(
    () => professores.turmasLecionadas(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )

  const { data, loading, error, reload } = useRequisicao(() => servicoPlanos.listar(), [])

  const meusPlanos = useMemo(() => {
    const meusVinculos = new Set((requisicaoVinculos.data ?? []).map((vinculo) => vinculo.id))

    return (data ?? []).filter((plano) => meusVinculos.has(plano.turmaDisciplina?.id ?? -1))
  }, [data, requisicaoVinculos.data])

  const filtrados = useMemo(() => {
    if (!buscaAtrasada.trim()) return meusPlanos

    const termo = normalizar(buscaAtrasada)

    return meusPlanos.filter(
      (plano) =>
        normalizar(plano.turmaDisciplina?.turma?.titulo).includes(termo) ||
        normalizar(plano.turmaDisciplina?.disciplina?.titulo).includes(termo) ||
        normalizar(plano.planoEnsino?.titulo).includes(termo),
    )
  }, [meusPlanos, buscaAtrasada])

  async function excluir(plano: PlanoAula) {
    const confirmado = await confirmar({
      titulo: 'Excluir plano de aula?',
      descricao: 'O plano será desativado. As aulas, frequências e conteúdos já registrados permanecem.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
    })

    if (!confirmado) return

    try {
      await servicoPlanos.excluir(plano.id)
      toast.success('Plano de aula excluído')
      await reload()
    } catch (erroExclusao) {
      toast.error(
        'Não foi possível excluir',
        erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
      )
    }
  }

  const colunas: Coluna<PlanoAula>[] = [
    {
      key: 'turma',
      cabecalho: 'Turma',
      ordenavel: true,
      valorOrdenacao: (plano) => plano.turmaDisciplina?.turma?.titulo ?? '',
      render: (plano) => plano.turmaDisciplina?.turma?.titulo ?? '—',
    },
    {
      key: 'disciplina',
      cabecalho: 'Disciplina',
      render: (plano) => <Tag variant="purple">{plano.turmaDisciplina?.disciplina?.titulo ?? '—'}</Tag>,
    },
    {
      key: 'planoEnsino',
      cabecalho: 'Plano de ensino',
      ocultarEmTelaPequena: true,
      render: (plano) => plano.planoEnsino?.titulo ?? `Plano #${plano.planoEnsino?.id ?? '—'}`,
    },
    {
      key: 'periodo',
      cabecalho: 'Período',
      ocultarEmTelaPequena: true,
      render: (plano) => plano.planoEnsino?.periodoLetivo ?? '—',
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
        titulo="Planos de aula"
        subtitulo={!loading && !error ? `${filtrados.length} plano(s)` : undefined}
        actions={
          <Button icon={<Plus />} onClick={() => navegar('/professor/plano-aula/novo')}>
            Novo plano de aula
          </Button>
        }
        filtros={<BuscaInput value={busca} onChange={setBusca} placeholder="Buscar por turma ou disciplina..." />}
      />

      <DataTable
        descricao="Planos de aula"
        columns={colunas}
        data={filtrados}
        rowKey={(plano) => plano.id}
        loading={loading || requisicaoVinculos.loading}
        error={error}
        onReload={reload}
        onRowClick={(plano) => navegar(`/professor/plano-aula/${plano.id}/aulas`)}
        empty={{
          titulo: busca ? 'Nenhum plano encontrado' : 'Nenhum plano de aula',
          descricao: busca
            ? 'Revise o termo buscado ou limpe o filtro.'
            : 'O plano de aula liga uma turma/disciplina a um plano de ensino e organiza as aulas do período.',
          icon: <Layers />,
          acao: !busca && (
            <Button icon={<Plus />} onClick={() => navegar('/professor/plano-aula/novo')}>
              Criar plano de aula
            </Button>
          ),
        }}
        actions={(plano) => (
          <>
            <IconButton
              label="Editar plano de aula"
              icon={<Pencil />}
              onClick={() => navegar(`/professor/plano-aula/${plano.id}`)}
            />
            <IconButton
              label="Excluir plano de aula"
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
