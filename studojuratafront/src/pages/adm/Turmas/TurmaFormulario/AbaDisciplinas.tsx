import { useMemo, useState } from 'react'
import { Archive, Pencil, Plus } from 'lucide-react'

import { Alerta } from '@/components/ui/Alerta'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import { IconButton } from '@/components/ui/IconButton'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Tag } from '@/components/ui/Tag'
import { useConfirm } from '@/contexts/confirm/confirmContexto'
import { useToast } from '@/contexts/toast/toastContexto'
import { useRequisicao } from '@/hooks/useRequisicao'
import { useFormularioVinculoTurma } from '@/dominios/turmas/formulario'
import { ApiError } from '@/dominios/comum/api'
import { cursoDisciplinas, disciplinas as servicoDisciplinas } from '@/dominios/curriculo/service'
import { professores as servicoProfessores } from '@/dominios/pessoas/service'
import { turmaDisciplinas } from '@/dominios/turmas/service'
import type { Disciplina } from '@/dominios/curriculo/types'
import type { TurmaDisciplina } from '@/dominios/turmas/types'
import { LinhaCampos } from './styles'

import type { AbaDisciplinasProps } from './types'

export function AbaDisciplinas({ turma, cursoId, vinculosDaTurma, requisicaoVinculos }: AbaDisciplinasProps) {
  const toast = useToast()
  const confirmar = useConfirm()
  const form = useFormularioVinculoTurma()
  const { disciplinaId, professorId } = form.values
  const erros = form.errors as Record<string, string | undefined>
  const [salvando, setSalvando] = useState(false)
  const [vinculoEditando, setVinculoEditando] = useState<TurmaDisciplina | null>(null)
  const [professorEditado, setProfessorEditado] = useState<number | null>(null)

  const requisicaoDisciplinas = useRequisicao(() => servicoDisciplinas.listar(), [])
  const requisicaoProfessores = useRequisicao(() => servicoProfessores.listar(), [])
  // Só disciplinas da grade curricular do curso podem ser vinculadas à turma
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

  /** Grade toda vinculada: distinto de "curso sem disciplinas na grade" — ver Select abaixo */
  const gradeTotalmenteVinculada =
    !requisicaoGradeCurricular.loading &&
    !requisicaoDisciplinas.loading &&
    gradeCurricularAtiva.length > 0 &&
    opcoesDisciplinas.length === 0

  /** Disciplinas da grade sem vínculo ou sem professor: só sinaliza, não bloqueia o salvamento */
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
    if ((await form.validate()).hasErrors || !disciplinaId) return

    if (vinculosDaTurma.some((vinculo) => vinculo.disciplina?.id === disciplinaId)) {
      toast.warning('Disciplina já vinculada', 'Edite o vínculo existente para trocar o professor.')
      return
    }

    setSalvando(true)
    try {
      await turmaDisciplinas.criar({
        turma,
        disciplina: (requisicaoDisciplinas.data ?? []).find((item) => item.id === disciplinaId),
        professor: (requisicaoProfessores.data ?? []).find((item) => item.id === professorId),
        status: 'ATIVO',
      })

      toast.success('Disciplina vinculada')
      form.reset()
      await requisicaoVinculos.reload()
    } catch (erroVincular) {
      toast.error('Não foi possível vincular', erroVincular instanceof ApiError ? erroVincular.message : undefined)
    } finally {
      setSalvando(false)
    }
  }

  function abrirTrocaProfessor(vinculo: TurmaDisciplina) {
    setVinculoEditando(vinculo)
    setProfessorEditado(vinculo.professor?.id ?? null)
  }

  // Troca (ou remove) o professor de um vínculo já existente, sem recriar o vínculo
  async function salvarTrocaProfessor() {
    if (!vinculoEditando) return

    setSalvando(true)
    try {
      await turmaDisciplinas.atualizar(vinculoEditando.id, {
        ...vinculoEditando,
        professor: (requisicaoProfessores.data ?? []).find((item) => item.id === professorEditado),
      })

      toast.success('Professor atualizado')
      setVinculoEditando(null)
      await requisicaoVinculos.reload()
    } catch (erroTrocar) {
      toast.error('Não foi possível trocar o professor', erroTrocar instanceof ApiError ? erroTrocar.message : undefined)
    } finally {
      setSalvando(false)
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
        <Alerta
          tom="success"
          titulo="Todas as disciplinas já estão vinculadas"
          descricao="A grade curricular do curso desta turma está totalmente vinculada. Para vincular outra disciplina, adicione-a primeiro à grade curricular do curso."
        />
      )}

      <Card titulo="Disciplinas e professores">
        <LinhaCampos $colunas="1fr 1fr auto">
          <Select<number>
            label="Disciplina"
            required
            options={opcoesDisciplinas}
            value={disciplinaId}
            loading={requisicaoDisciplinas.loading || requisicaoGradeCurricular.loading}
            error={erros.disciplinaId}
            disabled={gradeTotalmenteVinculada || salvando}
            searchable
            placeholder="Selecionar disciplina..."
            emptyText={
              gradeTotalmenteVinculada
                ? 'Todas as disciplinas da grade já foram vinculadas'
                : 'O curso desta turma ainda não tem disciplinas na grade curricular'
            }
            onChange={(valor) => form.setFieldValue('disciplinaId', valor)}
          />

          <Select<number>
            label="Professor responsável"
            options={opcoesProfessores}
            value={professorId}
            loading={requisicaoProfessores.loading}
            disabled={gradeTotalmenteVinculada || salvando}
            searchable
            clearable
            placeholder="Selecionar professor..."
            onChange={(valor) => form.setFieldValue('professorId', valor)}
          />

          <Button
            size="large"
            icon={<Plus />}
            loading={salvando}
            disabled={gradeTotalmenteVinculada}
            onClick={adicionarVinculo}
          >
            Vincular
          </Button>
        </LinhaCampos>
      </Card>

      {disciplinasIncompletas.length > 0 && (
        <Alerta
          tom="warning"
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
          <>
            <IconButton
              label={`Trocar professor de ${vinculo.disciplina?.titulo ?? 'disciplina'}`}
              acao="Trocar professor"
              icon={<Pencil />}
              disabled={salvando}
              onClick={() => abrirTrocaProfessor(vinculo)}
            />
            <IconButton
              label="Inativar vínculo"
              icon={<Archive />}
              variant="danger"
              onClick={() => removerVinculo(vinculo)}
            />
          </>
        )}
      />

      <Modal
        aberto={vinculoEditando !== null}
        onClose={() => setVinculoEditando(null)}
        titulo="Trocar professor"
        descricao={vinculoEditando?.disciplina?.titulo}
        bloqueado={salvando}
        rodape={
          <>
            <Button variant="secondary" disabled={salvando} onClick={() => setVinculoEditando(null)}>
              Cancelar
            </Button>
            <Button variant="success" loading={salvando} onClick={salvarTrocaProfessor}>
              Salvar
            </Button>
          </>
        }
      >
        <Select<number>
          label="Professor responsável"
          options={opcoesProfessores}
          value={professorEditado}
          loading={requisicaoProfessores.loading}
          disabled={salvando}
          searchable
          clearable
          placeholder="Selecionar professor..."
          onChange={(valor) => setProfessorEditado(valor)}
        />
      </Modal>
    </>
  )
}
