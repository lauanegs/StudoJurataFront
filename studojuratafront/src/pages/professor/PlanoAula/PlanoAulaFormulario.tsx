import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Save, Trash2 } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Header } from '../../../components/ui/Header'
import { Select } from '../../../components/ui/Select'
import { Toggle } from '../../../components/ui/Toggle'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useHidratar } from '../../../hooks/useHidratar'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import {
  planosAula as servicoPlanosAula,
  planosEnsino,
  professores,
} from '../../../services/endpoints'

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

export default function PlanoAulaFormulario() {
  const { id } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()
  const { professorId } = useProfessorLogado()

  const edicao = Boolean(id)
  const planoAulaId = id ? Number(id) : null

  const [turmaDisciplinaId, setTurmaDisciplinaId] = useState<number | null>(null)
  const [planoEnsinoId, setPlanoEnsinoId] = useState<number | null>(null)
  const [ativo, setAtivo] = useState(true)
  const [erros, setErros] = useState<Record<string, string | undefined>>({})
  const [salvando, setSalvando] = useState(false)

  const requisicaoPlano = useRequisicao(
    () => servicoPlanosAula.buscar(planoAulaId as number),
    [planoAulaId],
    { ativo: Boolean(planoAulaId) },
  )
  const requisicaoVinculos = useRequisicao(
    () => professores.turmasLecionadas(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )
  const requisicaoPlanosEnsino = useRequisicao(() => planosEnsino.listar(), [])

  useHidratar(requisicaoPlano.data, (plano) => {
    setTurmaDisciplinaId(plano.turmaDisciplina?.id ?? null)
    setPlanoEnsinoId(plano.planoEnsino?.id ?? null)
    setAtivo(plano.status !== 'INATIVO')
  })

  const opcoesVinculos = useMemo(
    () =>
      (requisicaoVinculos.data ?? []).map((vinculo) => ({
        value: vinculo.id,
        label: `${vinculo.turma?.titulo ?? 'Turma'} · ${vinculo.disciplina?.titulo ?? 'Disciplina'}`,
        descricao: vinculo.turma?.curso?.nome,
      })),
    [requisicaoVinculos.data],
  )

  /**
   * Sugere primeiro os planos de ensino do mesmo curso da turma escolhida —
   * o back não filtra isso, então a ajuda é feita aqui.
   */
  const opcoesPlanosEnsino = useMemo(() => {
    const vinculo = (requisicaoVinculos.data ?? []).find((item) => item.id === turmaDisciplinaId)
    const cursoDaTurma = vinculo?.turma?.curso?.id

    return (requisicaoPlanosEnsino.data ?? [])
      .filter((plano) => plano.status !== 'INATIVO')
      .sort((a, b) => {
        const pesoA = a.curso?.id === cursoDaTurma ? 0 : 1
        const pesoB = b.curso?.id === cursoDaTurma ? 0 : 1
        return pesoA - pesoB
      })
      .map((plano) => ({
        value: plano.id,
        label: plano.titulo ?? `Plano #${plano.id}`,
        descricao: `${plano.curso?.nome ?? 'Sem curso'} · ${plano.periodoLetivo}`,
      }))
  }, [requisicaoPlanosEnsino.data, requisicaoVinculos.data, turmaDisciplinaId])

  function validar() {
    const encontrados: Record<string, string | undefined> = {}

    // Ambos são @ManyToOne(optional = false) em PlanoAula.
    if (!turmaDisciplinaId) encontrados.turmaDisciplinaId = 'Selecione a turma e a disciplina'
    if (!planoEnsinoId) encontrados.planoEnsinoId = 'Selecione o plano de ensino'

    setErros(encontrados)
    return Object.keys(encontrados).filter((chave) => encontrados[chave]).length === 0
  }

  async function salvar() {
    if (!validar()) return

    const turmaDisciplina = (requisicaoVinculos.data ?? []).find(
      (item) => item.id === turmaDisciplinaId,
    )
    const planoEnsino = (requisicaoPlanosEnsino.data ?? []).find(
      (item) => item.id === planoEnsinoId,
    )

    if (!turmaDisciplina || !planoEnsino) return

    setSalvando(true)

    try {
      const corpo = {
        turmaDisciplina,
        planoEnsino,
        status: ativo ? ('ATIVO' as const) : ('INATIVO' as const),
      }

      if (edicao) {
        await servicoPlanosAula.atualizar(planoAulaId as number, corpo)
        toast.success('Plano de aula atualizado')
        navegar(`/professor/plano-aula/${planoAulaId}/aulas`)
      } else {
        const criado = await servicoPlanosAula.criar(corpo)
        toast.success('Plano de aula criado', 'Agora cadastre as aulas do período.')
        navegar(`/professor/plano-aula/${criado.id}/aulas`)
      }
    } catch (erroSalvar) {
      toast.error(
        'Não foi possível salvar',
        erroSalvar instanceof ApiError ? erroSalvar.message : undefined,
      )
    } finally {
      setSalvando(false)
    }
  }

  async function excluir() {
    if (!planoAulaId) return

    const confirmado = await confirmar({
      titulo: 'Excluir plano de aula?',
      descricao: 'As aulas, frequências e conteúdos já registrados permanecem.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
    })

    if (!confirmado) return

    try {
      await servicoPlanosAula.excluir(planoAulaId)
      toast.success('Plano de aula excluído')
      navegar('/professor/plano-aula')
    } catch (erroExclusao) {
      toast.error(
        'Não foi possível excluir',
        erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
      )
    }
  }

  if (edicao && requisicaoPlano.error) {
    return (
      <Layout>
        <Header titulo="Plano de aula" voltarPara="/professor/plano-aula" />
        <ErroCarregamento
          mensagem={requisicaoPlano.error}
          onRetry={requisicaoPlano.reload}
        />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo={edicao ? 'Editar plano de aula' : 'Novo plano de aula'}
        voltarPara="/professor/plano-aula"
        rotuloVoltar="Voltar para planos de aula"
        actions={
          <>
            {edicao && (
              <Button variant="danger" icon={<Trash2 />} onClick={excluir} disabled={salvando}>
                Excluir
              </Button>
            )}
            <Button
              variant="danger"
              onClick={() => navegar('/professor/plano-aula')}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button variant="success" icon={<Save />} loading={salvando} onClick={salvar}>
              Salvar
            </Button>
          </>
        }
      />

      {edicao && requisicaoPlano.loading ? (
        <SkeletonCartao />
      ) : (
        <Card
          titulo="Vínculo do plano"
          actions={
            <span style={{ fontSize: '12px', color: '#737373' }}>
              O plano de aula conecta a turma/disciplina ao plano de ensino do período.
            </span>
          }
        >
          <Coluna>
            <Grade>
              <Select<number>
                label="Turma e disciplina"
                required
                options={opcoesVinculos}
                value={turmaDisciplinaId}
                loading={requisicaoVinculos.loading}
                error={erros.turmaDisciplinaId}
                searchable
                placeholder="Selecionar turma/disciplina..."
                emptyText="Você ainda não leciona em nenhuma turma"
                onChange={setTurmaDisciplinaId}
              />

              <Select<number>
                label="Plano de ensino"
                required
                options={opcoesPlanosEnsino}
                value={planoEnsinoId}
                loading={requisicaoPlanosEnsino.loading}
                error={erros.planoEnsinoId}
                searchable
                placeholder="Selecionar plano de ensino..."
                hint="Os planos do mesmo curso da turma aparecem primeiro."
                emptyText="Cadastre um plano de ensino primeiro"
                onChange={setPlanoEnsinoId}
              />
            </Grade>

            <Toggle
              ligado={ativo}
              onChange={setAtivo}
              label="Situação"
              textoLigado="Ativo"
              textoDesligado="Inativo"
              disabled={salvando}
            />
          </Coluna>
        </Card>
      )}
    </Layout>
  )
}
