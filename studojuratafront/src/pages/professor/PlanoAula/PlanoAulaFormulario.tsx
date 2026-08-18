import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Save, Trash2 } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Input } from '../../../components/ui/Input'
import { Header } from '../../../components/ui/Header'
import { Select } from '../../../components/ui/Select'
import { Toggle } from '../../../components/ui/Toggle'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useHidratar } from '../../../hooks/useHidratar'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import {
  planosAula as servicoPlanosAula,
  planosEnsino,
  professores,
} from '../../../services/endpoints'
import { formatarCargaHoraria } from '../../../utils/format'

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

/* Confirmado no Figma: 1ª linha com Turma/Curso/Carga horária, 2ª com
   Disciplina/Período letivo — Curso, Carga horária e Período letivo não são
   campos do plano de aula (não existem no back), são informação do plano de
   ensino vinculado, mostrada em modo leitura pra confirmar que é o plano certo. */
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

  const [turmaId, setTurmaId] = useState<number | null>(null)
  const [disciplinaId, setDisciplinaId] = useState<number | null>(null)
  const [planoEnsinoId, setPlanoEnsinoId] = useState<number | null>(null)
  const [ativo, setAtivo] = useState(true)
  const [erros, setErros] = useState<Record<string, string | undefined>>({})

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
    setTurmaId(plano.turmaDisciplina?.turma?.id ?? null)
    setDisciplinaId(plano.turmaDisciplina?.disciplina?.id ?? null)
    setPlanoEnsinoId(plano.planoEnsino?.id ?? null)
    setAtivo(plano.status !== 'INATIVO')
  })

  const opcoesTurmas = useMemo(() => {
    const unicas = new Map<number, string>()
    for (const vinculo of requisicaoVinculos.data ?? []) {
      if (vinculo.turma) unicas.set(vinculo.turma.id, vinculo.turma.titulo)
    }
    return [...unicas.entries()].map(([value, label]) => ({ value, label }))
  }, [requisicaoVinculos.data])

  const opcoesDisciplinas = useMemo(
    () =>
      (requisicaoVinculos.data ?? [])
        .filter((vinculo) => vinculo.turma?.id === turmaId && vinculo.disciplina)
        .map((vinculo) => ({ value: vinculo.disciplina!.id, label: vinculo.disciplina?.titulo ?? '—' })),
    [requisicaoVinculos.data, turmaId],
  )

  const vinculoSelecionado = useMemo(
    () =>
      (requisicaoVinculos.data ?? []).find(
        (item) => item.turma?.id === turmaId && item.disciplina?.id === disciplinaId,
      ) ?? null,
    [requisicaoVinculos.data, turmaId, disciplinaId],
  )

  /**
   * Sugere primeiro os planos de ensino do mesmo curso da turma escolhida —
   * o back não filtra isso, então a ajuda é feita aqui.
   */
  const opcoesPlanosEnsino = useMemo(() => {
    const cursoDaTurma = vinculoSelecionado?.turma?.curso?.id

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
  }, [requisicaoPlanosEnsino.data, vinculoSelecionado])

  const planoEnsinoSelecionado = useMemo(
    () => (requisicaoPlanosEnsino.data ?? []).find((item) => item.id === planoEnsinoId) ?? null,
    [requisicaoPlanosEnsino.data, planoEnsinoId],
  )

  function validar() {
    const encontrados: Record<string, string | undefined> = {}

    // Ambos são @ManyToOne(optional = false) em PlanoAula.
    if (!vinculoSelecionado) encontrados.turmaDisciplinaId = 'Selecione a turma e a disciplina'
    if (!planoEnsinoId) encontrados.planoEnsinoId = 'Selecione o plano de ensino'

    setErros(encontrados)
    return Object.keys(encontrados).filter((chave) => encontrados[chave]).length === 0
  }

  const { executar: salvar, executando: salvando } = useAcao(async () => {
    if (!validar()) return

    if (!vinculoSelecionado || !planoEnsinoSelecionado) return

    try {
      const corpo = {
        turmaDisciplina: vinculoSelecionado,
        planoEnsino: planoEnsinoSelecionado,
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
    }
  })

  const { executar: excluir, executando: excluindo } = useAcao(async () => {
    if (!planoAulaId) return

    await confirmar({
      titulo: 'Excluir plano de aula?',
      descricao: 'As aulas, frequências e conteúdos já registrados permanecem.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
      aoConfirmar: async () => {
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
      },
    })
  })

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
              <Button
                size="large"
                variant="danger"
                icon={<Trash2 />}
                loading={excluindo}
                onClick={excluir}
                disabled={salvando}
              >
                Excluir
              </Button>
            )}
            <Button
              size="large"
              variant="danger"
              onClick={() => navegar('/professor/plano-aula')}
              disabled={salvando || excluindo}
            >
              Cancelar
            </Button>
            <Button
              size="large"
              variant="success"
              icon={<Save />}
              loading={salvando}
              disabled={excluindo}
              onClick={salvar}
            >
              Salvar
            </Button>
          </>
        }
      />

      {edicao && requisicaoPlano.loading ? (
        <SkeletonCartao />
      ) : (
        <Card titulo="Vínculo do plano">
          <Coluna>
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

            <Grade>
              <Select<number>
                label="Turma"
                required
                options={opcoesTurmas}
                value={turmaId}
                loading={requisicaoVinculos.loading}
                error={erros.turmaDisciplinaId}
                searchable
                placeholder="Selecionar turma..."
                emptyText="Você ainda não leciona em nenhuma turma"
                onChange={(valor) => {
                  setTurmaId(valor)
                  setDisciplinaId(null)
                }}
              />

              <Input label="Curso" value={planoEnsinoSelecionado?.curso?.nome ?? '—'} disabled />

              <Input
                label="Carga horária total"
                value={formatarCargaHoraria(planoEnsinoSelecionado?.cargaHoraria)}
                disabled
              />
            </Grade>

            <Grade>
              <Select<number>
                label="Disciplina"
                required
                options={opcoesDisciplinas}
                value={disciplinaId}
                disabled={!turmaId}
                searchable
                placeholder="Selecionar disciplina..."
                emptyText={turmaId ? 'Sem disciplinas nessa turma' : 'Selecione a turma primeiro'}
                onChange={setDisciplinaId}
              />

              <Input label="Período letivo" value={planoEnsinoSelecionado?.periodoLetivo ?? '—'} disabled />
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
