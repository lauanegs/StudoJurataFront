import { useMemo, useState } from 'react'
import { Archive, Plus } from 'lucide-react'

import { AlertaDesempenhoCard } from '../../../../components/desempenho/AlertaDesempenhoCard'
import { Button } from '../../../../components/ui/Button'
import { Card } from '../../../../components/ui/Card'
import { DataTable } from '../../../../components/ui/DataTable'
import { IconButton } from '../../../../components/ui/IconButton'
import { Select } from '../../../../components/ui/Select'
import { Tag } from '../../../../components/ui/Tag'
import { useConfirm } from '../../../../contexts/confirmContexto'
import { useToast } from '../../../../contexts/toastContexto'
import { useRequisicao, type RequestResult } from '../../../../hooks/useRequisicao'
import { ApiError } from '../../../../services/api'
import { cursoDisciplinas, disciplinas as servicoDisciplinas } from '../../../../services/curriculo'
import { professores as servicoProfessores } from '../../../../services/pessoas'
import { turmaDisciplinas } from '../../../../services/turmas'
import type { Disciplina } from '../../../../types/curriculo'
import type { Turma, TurmaDisciplina } from '../../../../types/turmas'
import { LinhaCampos } from './styles'

const VINCULO_VAZIO = { disciplinaId: null as number | null, professorId: null as number | null }

interface AbaDisciplinasProps {
  turma: Turma
  cursoId: number | null
  vinculosDaTurma: TurmaDisciplina[]
  requisicaoVinculos: RequestResult<TurmaDisciplina[]>
}

export function AbaDisciplinas({ turma, cursoId, vinculosDaTurma, requisicaoVinculos }: AbaDisciplinasProps) {
  const toast = useToast()
  const confirmar = useConfirm()
  const [novoVinculo, setNovoVinculo] = useState(VINCULO_VAZIO)

  const requisicaoDisciplinas = useRequisicao(() => servicoDisciplinas.listar(), [])
  const requisicaoProfessores = useRequisicao(() => servicoProfessores.listar(), [])
  // Só disciplinas da grade curricular do curso podem ser vinculadas à turma.
  const requisicaoGradeCurricular = useRequisicao(
    () => cursoDisciplinas.listarPorCurso(cursoId as number),
    [cursoId],
    { ativo: Boolean(cursoId) },
  )

  const gradeCurricularAtiva = useMemo(
    () => (requisicaoGradeCurricular.data ?? []).filter((item) => item.status !== 'INATIVO'),
    [requisicaoGradeCurricular.data],
  )

  const opcoesDisciplinas = useMemo(() => {
    const idsDaGrade = new Set(gradeCurricularAtiva.map((item) => item.disciplina?.id))
    const idsJaVinculados = new Set(vinculosDaTurma.map((vinculo) => vinculo.disciplina?.id))
    return (requisicaoDisciplinas.data ?? [])
      .filter(
        (disciplina) =>
          disciplina.status !== 'INATIVO' && idsDaGrade.has(disciplina.id) && !idsJaVinculados.has(disciplina.id),
      )
      .map((disciplina) => ({ value: disciplina.id, label: disciplina.titulo ?? '—' }))
  }, [requisicaoDisciplinas.data, gradeCurricularAtiva, vinculosDaTurma])

  /** Grade toda vinculada: distinto de "curso sem disciplinas na grade" — ver Select abaixo. */
  const gradeTotalmenteVinculada =
    !requisicaoGradeCurricular.loading &&
    !requisicaoDisciplinas.loading &&
    gradeCurricularAtiva.length > 0 &&
    opcoesDisciplinas.length === 0

  /** Disciplinas da grade sem vínculo ou sem professor: só sinaliza, não bloqueia o salvamento. */
  const disciplinasIncompletas = useMemo(
    () =>
      gradeCurricularAtiva
        .map((item) => {
          const disciplina = item.disciplina
          if (!disciplina) return null
          const vinculo = vinculosDaTurma.find((v) => v.disciplina?.id === disciplina.id)
          if (!vinculo) return { disciplina, motivo: 'nao-vinculada' as const }
          if (!vinculo.professor) return { disciplina, motivo: 'sem-professor' as const }
          return null
        })
        .filter((item): item is { disciplina: Disciplina; motivo: 'nao-vinculada' | 'sem-professor' } => item !== null),
    [gradeCurricularAtiva, vinculosDaTurma],
  )

  const opcoesProfessores = useMemo(
    () =>
      (requisicaoProfessores.data ?? [])
        .filter((professor) => professor.status !== 'INATIVO')
        .map((professor) => ({ value: professor.id, label: professor.pessoa?.nome ?? `Professor ${professor.id}` })),
    [requisicaoProfessores.data],
  )

  async function adicionarVinculo() {
    if (!novoVinculo.disciplinaId) {
      toast.warning('Selecione a disciplina')
      return
    }

    if (vinculosDaTurma.some((vinculo) => vinculo.disciplina?.id === novoVinculo.disciplinaId)) {
      toast.warning('Disciplina já vinculada', 'Edite o vínculo existente para trocar o professor.')
      return
    }

    try {
      await turmaDisciplinas.criar({
        turma,
        disciplina: (requisicaoDisciplinas.data ?? []).find((item) => item.id === novoVinculo.disciplinaId),
        professor: (requisicaoProfessores.data ?? []).find((item) => item.id === novoVinculo.professorId),
        status: 'ATIVO',
      })

      toast.success('Disciplina vinculada')
      setNovoVinculo(VINCULO_VAZIO)
      await requisicaoVinculos.reload()
    } catch (erroVincular) {
      toast.error('Não foi possível vincular', erroVincular instanceof ApiError ? erroVincular.message : undefined)
    }
  }

  async function removerVinculo(vinculo: TurmaDisciplina) {
    await confirmar({
      titulo: 'Inativar vínculo com a turma?',
      descricao:
        'O vínculo com esta disciplina será inativado (não é possível se houver plano de ensino ou plano de aula ativo — conclua-os primeiro).',
      rotuloConfirmar: 'Inativar',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await turmaDisciplinas.excluir(vinculo.id)
          toast.success('Disciplina desvinculada da turma')
          await requisicaoVinculos.reload()
        } catch (erroRemover) {
          toast.error('Não foi possível desvincular', erroRemover instanceof ApiError ? erroRemover.message : undefined)
        }
      },
    })
  }

  return (
    <>
      {gradeTotalmenteVinculada && (
        <AlertaDesempenhoCard
          tom="success"
          titulo="Todas as disciplinas já estão vinculadas"
          descricao="A grade curricular do curso desta turma está totalmente vinculada. Para vincular outra disciplina, adicione-a primeiro à grade curricular do curso."
        />
      )}

      <Card titulo="Disciplinas e professores">
        <LinhaCampos $colunas="1fr 1fr auto">
          <Select<number>
            label="Disciplina"
            options={opcoesDisciplinas}
            value={novoVinculo.disciplinaId}
            loading={requisicaoDisciplinas.loading || requisicaoGradeCurricular.loading}
            disabled={gradeTotalmenteVinculada}
            searchable
            placeholder="Selecionar disciplina..."
            emptyText={
              gradeTotalmenteVinculada
                ? 'Todas as disciplinas da grade já foram vinculadas'
                : 'O curso desta turma ainda não tem disciplinas na grade curricular'
            }
            onChange={(valor) => setNovoVinculo((atual) => ({ ...atual, disciplinaId: valor }))}
          />

          <Select<number>
            label="Professor responsável"
            options={opcoesProfessores}
            value={novoVinculo.professorId}
            loading={requisicaoProfessores.loading}
            disabled={gradeTotalmenteVinculada}
            searchable
            clearable
            placeholder="Selecionar professor..."
            onChange={(valor) => setNovoVinculo((atual) => ({ ...atual, professorId: valor }))}
          />

          <Button size="large" icon={<Plus />} disabled={gradeTotalmenteVinculada} onClick={adicionarVinculo}>
            Vincular
          </Button>
        </LinhaCampos>
      </Card>

      {disciplinasIncompletas.length > 0 && (
        <AlertaDesempenhoCard
          titulo="Disciplinas pendentes de organização"
          descricao={`${disciplinasIncompletas.length} disciplina(s) da grade curricular ${
            disciplinasIncompletas.length === 1 ? 'está' : 'estão'
          } sem professor: ${disciplinasIncompletas
            .map((item) => `${item.disciplina.titulo}${item.motivo === 'nao-vinculada' ? ' (não vinculada)' : ''}`)
            .join(', ')}. A turma pode ser salva assim mesmo — organize quando definir os professores.`}
        />
      )}

      <DataTable<TurmaDisciplina>
        descricao="Disciplinas da turma"
        columns={[
          { key: 'disciplina', cabecalho: 'Disciplina', render: (vinculo) => vinculo.disciplina?.titulo ?? '—' },
          {
            key: 'professor',
            cabecalho: 'Professor',
            render: (vinculo) => vinculo.professor?.pessoa?.nome ?? <Tag variant="warning">Sem professor</Tag>,
          },
        ]}
        data={vinculosDaTurma}
        rowKey={(vinculo) => vinculo.id}
        loading={requisicaoVinculos.loading}
        error={requisicaoVinculos.error}
        onReload={requisicaoVinculos.reload}
        densidade="compacta"
        empty={{
          titulo: 'Nenhuma disciplina vinculada',
          descricao: 'Vincule as disciplinas para que os professores possam criar planos de aula.',
        }}
        actions={(vinculo) => (
          <IconButton
            label="Inativar vínculo"
            icon={<Archive />}
            variant="danger"
            onClick={() => removerVinculo(vinculo)}
          />
        )}
      />
    </>
  )
}
