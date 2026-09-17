import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Archive, CalendarRange, ListTree, Save } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Header } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Tab } from '../../../components/ui/Tab'
import { TextArea } from '../../../components/ui/TextArea'
import { Stack } from '../../../components/ui/Stack'
import { GradeAutoAjuste } from '../../../components/ui/GradeAutoAjuste'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useHidratar } from '../../../hooks/useHidratar'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import {
  cursoDisciplinas as servicoCursoDisciplinas,
  cursos as servicoCursos,
} from '../../../services/curriculo'
import { professores as servicoProfessores } from '../../../services/pessoas'
import {
  conteudosPlano as servicoConteudos,
  planosAula,
  planosEnsino as servicoPlanos,
} from '../../../services/planejamento'
import { formatarData } from '../../../utils/format'
import { OPCOES_STATUS_PLANO } from '../../../utils/labels'
import type { CursoDisciplina } from '../../../types/curriculo'
import type { StatusPlano } from '../../../types/planejamento'
import { useFormularioPlanoEnsino } from '../../../formularios/planejamento'

type Aba = 'identificacao' | 'proposta'

export default function PlanoEnsinoFormulario() {
  const { id } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()
  const { professorId, professor } = useProfessorLogado()

  const edicao = Boolean(id)
  const planoId = id ? Number(id) : null

  const form = useFormularioPlanoEnsino()
  const { cursoId, turmaId, disciplinaId, cargaHoraria, dataInicio, dataFim, ementa, objetivoGeral, metodologia, status } = form.values
  const erros = form.errors as Record<string, string | undefined>
  const [aba, setAba] = useState<Aba>('identificacao')

  const requisicaoPlano = useRequisicao(() => servicoPlanos.buscar(planoId as number), [planoId], {
    ativo: Boolean(planoId),
  })
  // O back gera o plano de aula junto (PlanoAulaService.gerarSeNecessario) quando há turmaDisciplina.
  const requisicaoPlanoAula = useRequisicao(
    () => planosAula.listarPorPlanoEnsino(planoId as number),
    [planoId],
    { ativo: Boolean(planoId) },
  )
  const planoAulaVinculado = requisicaoPlanoAula.data?.[0] ?? null
  const requisicaoCursos = useRequisicao(() => servicoCursos.listar(), [])
  const requisicaoVinculos = useRequisicao(
    () => servicoProfessores.turmasLecionadas(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )
  // Grade do curso: só sugere a carga horária ao criar.
  const requisicaoGradeCurricular = useRequisicao(
    () => servicoCursoDisciplinas.listarPorCurso(cursoId as number),
    [cursoId],
    { ativo: Boolean(cursoId) && !edicao },
  )

  useHidratar(requisicaoPlano.data, (plano) => {
    form.setFieldValue('cursoId', plano.curso?.id ?? null)
    form.setFieldValue('turmaId', plano.turmaDisciplina?.turma?.id ?? null)
    form.setFieldValue('disciplinaId', plano.turmaDisciplina?.disciplina?.id ?? null)
    form.setFieldValue('cargaHoraria', plano.cargaHoraria?.toString() ?? '')
    form.setFieldValue('dataInicio', plano.dataInicio?.slice(0, 10) ?? '')
    form.setFieldValue('dataFim', plano.dataFim?.slice(0, 10) ?? '')
    form.setFieldValue('ementa', plano.ementa ?? '')
    form.setFieldValue('objetivoGeral', plano.objetivoGeral ?? '')
    form.setFieldValue('metodologia', plano.metodologia ?? '')
    form.setFieldValue('status', plano.status ?? 'ATIVO')
  })

  // Curso e turma se filtram mutuamente, para não salvar turma de outro curso.
  const opcoesCursos = useMemo(() => {
    const cursos = requisicaoCursos.data ?? []
    if (!turmaId) return cursos.map((curso) => ({ value: curso.id, label: curso.nome }))

    const cursoDaTurmaId = (requisicaoVinculos.data ?? []).find(
      (vinculo) => vinculo.turma?.id === turmaId,
    )?.turma?.curso?.id

    return cursos
      .filter((curso) => curso.id === cursoDaTurmaId)
      .map((curso) => ({ value: curso.id, label: curso.nome }))
  }, [requisicaoCursos.data, requisicaoVinculos.data, turmaId])

  // Dois selects (Figma): a disciplina é filtrada pela turma escolhida.
  const opcoesTurmas = useMemo(() => {
    const unicas = new Map<number, string>()
    for (const vinculo of requisicaoVinculos.data ?? []) {
      if (!vinculo.turma) continue
      if (cursoId && vinculo.turma.curso?.id !== cursoId) continue
      unicas.set(vinculo.turma.id, vinculo.turma.titulo)
    }
    return [...unicas.entries()].map(([value, label]) => ({ value, label }))
  }, [requisicaoVinculos.data, cursoId])

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

  // Se a turma/disciplina já teve um plano CONCLUIDO, avisa de onde o ciclo
  // anterior parou, sem pré-preencher nada.
  const requisicaoPlanosExistentes = useRequisicao(() => servicoPlanos.listar(), [], {
    ativo: !edicao,
  })
  const requisicaoConteudosExistentes = useRequisicao(() => servicoConteudos.listar(), [], {
    ativo: !edicao,
  })

  const planoAnteriorConcluido = useMemo(() => {
    if (!vinculoSelecionado) return null
    return (
      (requisicaoPlanosExistentes.data ?? [])
        .filter(
          (plano) => plano.turmaDisciplina?.id === vinculoSelecionado.id && plano.status === 'CONCLUIDO',
        )
        .sort((a, b) => (b.dataFim ?? '').localeCompare(a.dataFim ?? ''))[0] ?? null
    )
  }, [requisicaoPlanosExistentes.data, vinculoSelecionado])

  const avisoContinuidade = useMemo(() => {
    if (!planoAnteriorConcluido) return undefined

    const ultimoConteudo = (requisicaoConteudosExistentes.data ?? [])
      .filter((conteudo) => conteudo.planoEnsino?.id === planoAnteriorConcluido.id)
      .sort((a, b) => (b.ordem ?? 0) - (a.ordem ?? 0))[0]

    const fim = formatarData(planoAnteriorConcluido.dataFim)
    return ultimoConteudo
      ? `Ciclo anterior concluído em ${fim} — último conteúdo visto: "${ultimoConteudo.titulo}". Continue a partir daqui.`
      : `Ciclo anterior concluído em ${fim}.`
  }, [planoAnteriorConcluido, requisicaoConteudosExistentes.data])

  /** Sugere a carga horária definida na grade curricular do curso — só preenche se o campo ainda estiver vazio (não sobrescreve o que o professor já digitou). */
  function sugerirCargaHoraria(disciplinaSelecionada: number | null, grade: CursoDisciplina[]) {
    if (cargaHoraria || !cursoId || !disciplinaSelecionada) return

    const encontrado = grade.find(
      (item) => item.disciplina?.id === disciplinaSelecionada && item.status !== 'INATIVO',
    )
    if (encontrado?.cargaHoraria) form.setFieldValue('cargaHoraria', String(encontrado.cargaHoraria))
  }

  const { executar: salvar, executando: salvando } = useAcao(async () => {
    if ((await form.validate()).hasErrors) return

    const curso = (requisicaoCursos.data ?? []).find((item) => item.id === cursoId)
    if (!curso) return

    try {
      const corpo = {
        curso,
        // O responsável é sempre quem cria/edita, sem seleção, para ninguém
        // assinar o plano de outro professor.
        professor: professor ?? undefined,
        turmaDisciplina: vinculoSelecionado ?? undefined,
        cargaHoraria: cargaHoraria ? Number(cargaHoraria) : undefined,
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
        ementa: ementa.trim() || undefined,
        objetivoGeral: objetivoGeral.trim() || undefined,
        metodologia: metodologia.trim() || undefined,
        status,
      }

      if (edicao) {
        await servicoPlanos.atualizar(planoId as number, corpo)
        toast.success('Plano de ensino atualizado')
        navegar(`/professor/plano-ensino/${planoId}/conteudos`)
      } else {
        const criado = await servicoPlanos.criar(corpo)
        toast.success('Plano de ensino criado', 'Agora cadastre os conteúdos do plano.')
        navegar(`/professor/plano-ensino/${criado.id}/conteudos`)
      }
    } catch (erroSalvar) {
      toast.error(
        'Não foi possível salvar',
        erroSalvar instanceof ApiError ? erroSalvar.message : undefined,
      )
    }
  })

  const { executar: excluir, executando: excluindo } = useAcao(async () => {
    if (!planoId) return

    await confirmar({
      titulo: 'Encerrar plano de ensino?',
      descricao: 'O plano será marcado como concluído. Os conteúdos e planos de aula vinculados permanecem.',
      rotuloConfirmar: 'Encerrar',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoPlanos.excluir(planoId)
          toast.success('Plano encerrado')
          navegar('/professor/plano-ensino')
        } catch (erroExclusao) {
          toast.error(
            'Não foi possível encerrar',
            erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
          )
        }
      },
    })
  })

  if (edicao && requisicaoPlano.error) {
    return (
      <Layout>
        <Header titulo="Plano de ensino" voltarPara="/professor/plano-ensino" />
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
        titulo={edicao ? 'Editar plano de ensino' : 'Novo plano de ensino'}
        voltarPara="/professor/plano-ensino"
        rotuloVoltar="Planos de ensino"
        actions={
          <>
            {edicao && (
              <Button
                size="large"
                variant="secondary"
                icon={<ListTree />}
                onClick={() => navegar(`/professor/plano-ensino/${planoId}/conteudos`)}
              >
                Conteúdos
              </Button>
            )}
            {edicao && planoAulaVinculado && (
              <Button
                size="large"
                variant="secondary"
                icon={<CalendarRange />}
                onClick={() => navegar(`/professor/plano-aula/${planoAulaVinculado.id}`)}
              >
                Plano de aula
              </Button>
            )}
            {/* Cancelar só existe enquanto o plano ainda não foi salvo — depois
                de salvo, desfazer é Encerrar (soft-delete), não Cancelar. */}
            {edicao ? (
              <Button
                size="large"
                variant="danger"
                icon={<Archive />}
                loading={excluindo}
                onClick={excluir}
                disabled={salvando}
              >
                Encerrar
              </Button>
            ) : (
              <Button
                size="large"
                variant="danger"
                onClick={() => navegar('/professor/plano-ensino')}
                disabled={salvando}
              >
                Cancelar
              </Button>
            )}
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

      <Tab<Aba>
        rotuloAcessivel="Seções do plano de ensino"
        value={aba}
        onChange={setAba}
        options={[
          { value: 'identificacao', label: 'Identificação' },
          { value: 'proposta', label: 'Proposta pedagógica' },
        ]}
      />

      {edicao && requisicaoPlano.loading ? (
        <SkeletonCartao />
      ) : (
        <>
          {aba === 'identificacao' && (
          <Card titulo="Identificação">
            <Stack gap="md">
              {/* 280px garante no máximo 2 campos por linha, como no restante do formulário. */}
              <GradeAutoAjuste $larguraMinima="280px">
                {/* A identificação do plano é o próprio id; não existe ainda ao criar. */}
                <Input
                  label="Número do plano"
                  value={edicao && requisicaoPlano.data ? `Nº ${requisicaoPlano.data.id}` : 'Gerado automaticamente ao salvar'}
                  disabled
                />

                <Select<number>
                  label="Curso"
                  required
                  options={opcoesCursos}
                  value={cursoId}
                  loading={requisicaoCursos.loading}
                  error={erros.cursoId}
                  searchable
                  clearable
                  placeholder="Selecionar curso..."
                  onChange={(valor) => {
                    form.setFieldValue('cursoId', valor)
                    // A turma escolhida pode não pertencer mais ao curso novo —
                    // limpa em vez de deixar uma combinação inconsistente.
                    if (
                      valor &&
                      turmaId &&
                      (requisicaoVinculos.data ?? []).find((vinculo) => vinculo.turma?.id === turmaId)?.turma?.curso
                        ?.id !== valor
                    ) {
                      form.setFieldValue('turmaId', null)
                      form.setFieldValue('disciplinaId', null)
                    }
                  }}
                />
              </GradeAutoAjuste>

              <Input
                label="Professor responsável"
                value={
                  (edicao ? requisicaoPlano.data?.professor?.pessoa?.nome : professor?.pessoa?.nome) ?? '—'
                }
                disabled
                hint="Sempre quem está logado ao criar o plano."
              />

              <GradeAutoAjuste $larguraMinima="280px">
                <Select<number>
                  label="Turma"
                  required
                  options={opcoesTurmas}
                  value={turmaId}
                  loading={requisicaoVinculos.loading}
                  error={erros.turmaId}
                  searchable
                  clearable
                  placeholder="Selecionar turma..."
                  emptyText="Você ainda não leciona em nenhuma turma"
                  onChange={(valor) => {
                    form.setFieldValue('turmaId', valor)
                    form.setFieldValue('disciplinaId', null)
                    // A turma só pertence a um curso — escolher a turma já
                    // resolve o curso, sem exigir escolher os dois à parte.
                    const cursoDaTurma = valor
                      ? (requisicaoVinculos.data ?? []).find((vinculo) => vinculo.turma?.id === valor)?.turma?.curso
                          ?.id
                      : undefined
                    if (cursoDaTurma) form.setFieldValue('cursoId', cursoDaTurma)
                  }}
                />

                <Select<number>
                  label="Disciplina"
                  required
                  options={opcoesDisciplinas}
                  value={disciplinaId}
                  disabled={!turmaId}
                  error={erros.disciplinaId}
                  searchable
                  clearable
                  placeholder="Selecionar disciplina..."
                  emptyText={turmaId ? 'Sem disciplinas nessa turma' : 'Selecione a turma primeiro'}
                  hint={avisoContinuidade}
                  onChange={(valor) => {
                    form.setFieldValue('disciplinaId', valor)
                    sugerirCargaHoraria(valor, requisicaoGradeCurricular.data ?? [])
                  }}
                />
              </GradeAutoAjuste>

              <GradeAutoAjuste $larguraMinima="280px">
                <Input
                  label="Carga horária"
                  type="number"
                  min={1}
                  placeholder="Ex.: 40"
                  value={cargaHoraria}
                  error={erros.cargaHoraria}
                  disabled={salvando}
                  hint="Em horas."
                  onChange={(evento) => form.setFieldValue('cargaHoraria', evento.target.value)}
                />

                <Select<StatusPlano>
                  label="Situação"
                  options={OPCOES_STATUS_PLANO}
                  value={status}
                  disabled={salvando}
                  onChange={(valor) => form.setFieldValue('status', valor ?? 'ATIVO')}
                />
              </GradeAutoAjuste>

              <GradeAutoAjuste $larguraMinima="280px">
                <DatePicker
                  label="Início"
                  value={dataInicio}
                  disabled={salvando}
                  onChange={(evento) => form.setFieldValue('dataInicio', evento.target.value)}
                />

                <DatePicker
                  label="Término"
                  value={dataFim}
                  error={erros.dataFim}
                  disabled={salvando}
                  onChange={(evento) => form.setFieldValue('dataFim', evento.target.value)}
                />
              </GradeAutoAjuste>
            </Stack>
          </Card>
          )}

          {aba === 'proposta' && (
          <Card titulo="Proposta pedagógica">
            <Stack gap="md">
              <TextArea
                label="Ementa"
                placeholder="Resumo dos temas abordados no período..."
                value={ementa}
                disabled={salvando}
                maxLength={2000}
                rows={4}
                autoAltura
                onChange={(evento) => form.setFieldValue('ementa', evento.target.value)}
              />

              <TextArea
                label="Objetivo geral"
                placeholder="O que o aluno deve ser capaz de fazer ao final..."
                value={objetivoGeral}
                disabled={salvando}
                maxLength={2000}
                rows={3}
                autoAltura
                onChange={(evento) => form.setFieldValue('objetivoGeral', evento.target.value)}
              />

              <TextArea
                label="Metodologia"
                placeholder="Estratégias, recursos e forma de avaliação..."
                value={metodologia}
                disabled={salvando}
                maxLength={2000}
                rows={3}
                autoAltura
                onChange={(evento) => form.setFieldValue('metodologia', evento.target.value)}
              />
            </Stack>
          </Card>
          )}
        </>
      )}
    </Layout>
  )
}
