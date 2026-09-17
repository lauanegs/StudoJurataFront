import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Archive, ArchiveRestore, CalendarClock, Pencil, Plus, Save, Trash2, UserPlus, Users } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { AlertaDesempenhoCard } from '../../../components/desempenho/AlertaDesempenhoCard'
import { BuscaInput } from '../../../components/ui/BuscaInput'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DataTable } from '../../../components/ui/DataTable'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Header } from '../../../components/ui/Header'
import { IconButton } from '../../../components/ui/IconButton'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Tab } from '../../../components/ui/Tab'
import { Tag } from '../../../components/ui/Tag'
import { TimePicker } from '../../../components/ui/TimePicker'
import { Stack } from '../../../components/ui/Stack'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useAvisosDispensados } from '../../../hooks/useAvisosDispensados'
import { useDebounce } from '../../../hooks/useDebounce'
import { useEscola } from '../../../hooks/useEscola'
import { useHidratar } from '../../../hooks/useHidratar'
import { usePaginacao } from '../../../hooks/usePaginacao'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import {
  cursoDisciplinas as servicoCursoDisciplinas,
  cursos as servicoCursos,
  disciplinas as servicoDisciplinas,
} from '../../../services/curriculo'
import { professores as servicoProfessores } from '../../../services/pessoas'
import {
  horariosTurma,
  matriculas,
  turmaDisciplinas,
  turmas as servicoTurmas,
} from '../../../services/turmas'
import { formatarCargaHoraria, formatarData, formatarHora, formatarIdade, normalizar } from '../../../utils/format'
import {
  OPCOES_ATIVA_INATIVA,
  OPCOES_DIA_SEMANA,
  ROTULO_DIA_SEMANA,
  ROTULO_STATUS_MATRICULA,
  STATUS_MATRICULA_VARIANT,
} from '../../../utils/labels'
import type { StatusAtivoInativo } from '../../../types/comum'
import type { Disciplina } from '../../../types/curriculo'
import type { AlunoTurma, DiaSemana, HorarioTurma, TurmaDisciplina } from '../../../types/turmas'
import { useFormularioTurma } from '../../../formularios/turmas'

/* Três campos por linha fixos: com auto-fit o número de colunas variaria com a tela. */
const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`

/* Ações ao lado de campos usam size="large" para ter a mesma altura. A busca
   vem por último (extrema direita), como no Header. */
const LinhaAcaoFlutuante = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`

const LinhaHorario = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  align-items: end;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`

const LinhaVinculo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  align-items: end;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`

type Aba = 'data' | 'horarios' | 'disciplinas' | 'alunos' | 'historico'

export default function TurmaFormulario() {
  const { id } = useParams()
  const navegar = useNavigate()
  const localizacao = useLocation()
  const toast = useToast()
  const confirmar = useConfirm()
  const { escola, loading: carregandoEscola } = useEscola()

  const edicao = Boolean(id)
  const turmaId = id ? Number(id) : null

  const abaInicial = (localizacao.state as { aba?: Aba } | null)?.aba
  const [aba, setAba] = useState<Aba>(abaInicial ?? 'data')

  const form = useFormularioTurma()
  const { titulo, cursoId, capacidadeMaxima, dataInicio, dataFim, ativa } = form.values
  const erros = form.errors as Record<string, string | undefined>
  const [salvando, setSalvando] = useState(false)

  const [novoHorario, setNovoHorario] = useState<{
    diaSemana: DiaSemana | null
    horaInicio: string
    horaFim: string
  }>({ diaSemana: null, horaInicio: '', horaFim: '' })

  const [novoVinculo, setNovoVinculo] = useState<{
    disciplinaId: number | null
    professorId: number | null
  }>({ disciplinaId: null, professorId: null })

  const requisicaoTurma = useRequisicao(() => servicoTurmas.buscar(turmaId as number), [turmaId], {
    ativo: Boolean(turmaId),
  })
  const requisicaoCursos = useRequisicao(() => servicoCursos.listar(), [])
  const requisicaoDisciplinas = useRequisicao(() => servicoDisciplinas.listar(), [])
  const requisicaoProfessores = useRequisicao(() => servicoProfessores.listar(), [])
  // Só disciplinas da grade curricular do curso podem ser vinculadas à turma.
  const requisicaoGradeCurricular = useRequisicao(
    () => servicoCursoDisciplinas.listarPorCurso(cursoId as number),
    [cursoId],
    { ativo: Boolean(cursoId) },
  )

  const requisicaoHorarios = useRequisicao(
    () => horariosTurma.listarPorTurma(turmaId as number),
    [turmaId],
    { ativo: Boolean(turmaId) },
  )
  const requisicaoVinculos = useRequisicao(() => turmaDisciplinas.listar(), [], {
    ativo: Boolean(turmaId),
  })
  const requisicaoAtivos = useRequisicao(
    () => matriculas.ativosPorTurma(turmaId as number),
    [turmaId],
    { ativo: Boolean(turmaId) },
  )
  const requisicaoHistorico = useRequisicao(
    () => matriculas.historicoPorTurma(turmaId as number),
    [turmaId],
    { ativo: Boolean(turmaId) },
  )

  const [buscaAtivos, setBuscaAtivos] = useState('')
  const buscaAtivosAtrasada = useDebounce(buscaAtivos)
  const [buscaHistorico, setBuscaHistorico] = useState('')
  const buscaHistoricoAtrasada = useDebounce(buscaHistorico)

  const ativos = requisicaoAtivos.data ?? []
  const historico = requisicaoHistorico.data ?? []

  const { dispensados: avisosDispensados, dispensar: dispensarAviso } = useAvisosDispensados()
  /** Aviso informativo de matrícula concluída automaticamente por carga horária (FrequenciaService). */
  const avisosCargaHoraria = useMemo(
    () =>
      (requisicaoHistorico.data ?? []).filter(
        (matricula) => matricula.status === 'CONCLUIDA' && !avisosDispensados.includes(matricula.id),
      ),
    [requisicaoHistorico.data, avisosDispensados],
  )

  const ativosFiltrados = useMemo(() => {
    const lista = requisicaoAtivos.data ?? []
    if (!buscaAtivosAtrasada.trim()) return lista
    const termo = normalizar(buscaAtivosAtrasada)
    return lista.filter((matricula) => normalizar(matricula.aluno?.pessoa?.nome).includes(termo))
  }, [requisicaoAtivos.data, buscaAtivosAtrasada])

  const historicoFiltrado = useMemo(() => {
    const lista = requisicaoHistorico.data ?? []
    if (!buscaHistoricoAtrasada.trim()) return lista
    const termo = normalizar(buscaHistoricoAtrasada)
    return lista.filter((matricula) => normalizar(matricula.aluno?.pessoa?.nome).includes(termo))
  }, [requisicaoHistorico.data, buscaHistoricoAtrasada])

  const paginacaoAtivos = usePaginacao(ativosFiltrados)
  const paginacaoHistorico = usePaginacao(historicoFiltrado)

  useHidratar(requisicaoTurma.data, (turma) => {
    form.setFieldValue('titulo', turma.titulo ?? '')
    form.setFieldValue('cursoId', turma.curso?.id ?? null)
    form.setFieldValue('capacidadeMaxima', turma.capacidadeMaxima?.toString() ?? '')
    form.setFieldValue('dataInicio', turma.dataInicio?.slice(0, 10) ?? '')
    form.setFieldValue('dataFim', turma.dataFim?.slice(0, 10) ?? '')
    form.setFieldValue('ativa', turma.status !== 'INATIVA')
  })

  /** turmaDisciplinas.excluir() é soft-delete, então o vínculo inativo precisa ser filtrado. */
  const vinculosDaTurma = useMemo(
    () =>
      (requisicaoVinculos.data ?? []).filter(
        (vinculo) => vinculo.turma?.id === turmaId && vinculo.status !== 'INATIVO',
      ),
    [requisicaoVinculos.data, turmaId],
  )

  // Recalcula quando matrículas ou disciplinas da turma mudam, já que as duas alteram a carga horária.
  const requisicaoFrequencia = useRequisicao(
    () => servicoTurmas.frequenciaAlunos(turmaId as number),
    [turmaId, requisicaoAtivos.data, requisicaoVinculos.data],
    { ativo: aba === 'alunos' && Boolean(turmaId) },
  )
  const cargaHorariaPorAluno = useMemo(
    () => new Map((requisicaoFrequencia.data ?? []).map((resumo) => [resumo.alunoId, resumo.cargaHoraria])),
    [requisicaoFrequencia.data],
  )

  const opcoesCursos = useMemo(
    () =>
      (requisicaoCursos.data ?? [])
        .filter((curso) => curso.status !== 'INATIVO')
        .map((curso) => ({ value: curso.id, label: curso.nome })),
    [requisicaoCursos.data],
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
          disciplina.status !== 'INATIVO' &&
          idsDaGrade.has(disciplina.id) &&
          !idsJaVinculados.has(disciplina.id),
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
  const disciplinasIncompletas = useMemo(() => {
    const grade = (requisicaoGradeCurricular.data ?? []).filter((item) => item.status !== 'INATIVO')
    return grade
      .map((item) => {
        const disciplina = item.disciplina
        if (!disciplina) return null
        const vinculo = vinculosDaTurma.find((v) => v.disciplina?.id === disciplina.id)
        if (!vinculo) return { disciplina, motivo: 'nao-vinculada' as const }
        if (!vinculo.professor) return { disciplina, motivo: 'sem-professor' as const }
        return null
      })
      .filter((item): item is { disciplina: Disciplina; motivo: 'nao-vinculada' | 'sem-professor' } => item !== null)
  }, [requisicaoGradeCurricular.data, vinculosDaTurma])

  const opcoesProfessores = useMemo(
    () =>
      (requisicaoProfessores.data ?? [])
        .filter((professor) => professor.status !== 'INATIVO')
        .map((professor) => ({
          value: professor.id,
          label: professor.pessoa?.nome ?? `Professor ${professor.id}`,
        })),
    [requisicaoProfessores.data],
  )

  async function salvar() {
    if ((await form.validate()).hasErrors) {
      setAba('data')
      return
    }

    if (!escola) {
      toast.error('Escola não encontrada', 'Cadastre uma escola antes de criar turmas.')
      return
    }

    const curso = (requisicaoCursos.data ?? []).find((item) => item.id === cursoId)
    if (!curso) return

    setSalvando(true)

    try {
      const corpo = {
        escola,
        curso,
        titulo: titulo.trim(),
        capacidadeMaxima: capacidadeMaxima ? Number(capacidadeMaxima) : undefined,
        dataInicio: dataInicio || undefined,
        // Turma ativa nunca tem data de término (ver DatePicker desabilitado acima).
        dataFim: ativa ? undefined : dataFim || undefined,
        status: ativa ? ('ATIVA' as const) : ('INATIVA' as const),
      }

      if (edicao) {
        await servicoTurmas.atualizar(turmaId as number, corpo)
        toast.success('Turma atualizada', corpo.titulo)
        await requisicaoTurma.reload()
      } else {
        const criada = await servicoTurmas.criar(corpo)
        toast.success('Turma criada', 'Agora defina os horários e vincule as disciplinas.')
        navegar(`/adm/turmas/${criada.id}`, { replace: true })
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

  async function adicionarHorario() {
    if (!turmaId) return

    if (!novoHorario.diaSemana || !novoHorario.horaInicio || !novoHorario.horaFim) {
      toast.warning('Horário incompleto', 'Informe o dia, a hora de início e a de término.')
      return
    }

    if (novoHorario.horaFim <= novoHorario.horaInicio) {
      toast.warning('Horário inválido', 'A hora de término deve ser maior que a de início.')
      return
    }

    try {
      await horariosTurma.adicionar(turmaId, {
        diaSemana: novoHorario.diaSemana,
        horaInicio: `${novoHorario.horaInicio}:00`,
        horaFim: `${novoHorario.horaFim}:00`,
      })

      toast.success('Horário adicionado')
      setNovoHorario({ diaSemana: null, horaInicio: '', horaFim: '' })
      await requisicaoHorarios.reload()
    } catch (erroAdicionar) {
      toast.error(
        'Não foi possível adicionar',
        erroAdicionar instanceof ApiError ? erroAdicionar.message : undefined,
      )
    }
  }

  async function removerHorario(horarioId: number) {
    await confirmar({
      titulo: 'Remover horário?',
      rotuloConfirmar: 'Remover',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await horariosTurma.remover(horarioId)
          toast.success('Horário removido')
          await requisicaoHorarios.reload()
        } catch (erroRemover) {
          toast.error(
            'Não foi possível remover',
            erroRemover instanceof ApiError ? erroRemover.message : undefined,
          )
        }
      },
    })
  }

  async function adicionarVinculo() {
    if (!turmaId || !requisicaoTurma.data) return

    if (!novoVinculo.disciplinaId) {
      toast.warning('Selecione a disciplina')
      return
    }

    const jaExiste = vinculosDaTurma.some(
      (vinculo) => vinculo.disciplina?.id === novoVinculo.disciplinaId,
    )

    if (jaExiste) {
      toast.warning('Disciplina já vinculada', 'Edite o vínculo existente para trocar o professor.')
      return
    }

    try {
      await turmaDisciplinas.criar({
        turma: requisicaoTurma.data,
        disciplina: (requisicaoDisciplinas.data ?? []).find(
          (item) => item.id === novoVinculo.disciplinaId,
        ),
        professor: (requisicaoProfessores.data ?? []).find(
          (item) => item.id === novoVinculo.professorId,
        ),
        status: 'ATIVO',
      })

      toast.success('Disciplina vinculada')
      setNovoVinculo({ disciplinaId: null, professorId: null })
      await requisicaoVinculos.reload()
    } catch (erroVincular) {
      toast.error(
        'Não foi possível vincular',
        erroVincular instanceof ApiError ? erroVincular.message : undefined,
      )
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
          toast.error(
            'Não foi possível desvincular',
            erroRemover instanceof ApiError ? erroRemover.message : undefined,
          )
        }
      },
    })
  }

  async function excluirTurma() {
    if (!turmaId) return

    await confirmar({
      titulo: 'Inativar turma?',
      descricao:
        'A turma será inativada. Só funciona se ela nunca teve aluno matriculado — se já teve, altere a Situação em "Dados da turma" para inativar preservando o histórico.',
      rotuloConfirmar: 'Inativar',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoTurmas.excluir(turmaId)
          toast.success('Turma inativada')
          navegar('/adm/turmas')
        } catch (erroExclusao) {
          toast.error(
            'Não foi possível inativar',
            erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
          )
        }
      },
    })
  }

  async function ativarTurma() {
    if (!turmaId) return

    await confirmar({
      titulo: 'Ativar turma?',
      descricao: 'A turma voltará a ficar ativa.',
      rotuloConfirmar: 'Ativar',
      aoConfirmar: async () => {
        try {
          await servicoTurmas.ativar(turmaId)
          toast.success('Turma ativada')
          await requisicaoTurma.reload()
        } catch (erroAtivacao) {
          toast.error(
            'Não foi possível ativar',
            erroAtivacao instanceof ApiError ? erroAtivacao.message : undefined,
          )
        }
      },
    })
  }

  if (edicao && requisicaoTurma.error) {
    return (
      <Layout>
        <Header titulo="Turma" voltarPara="/adm/turmas" />
        <ErroCarregamento
          mensagem={requisicaoTurma.error}
          onRetry={requisicaoTurma.reload}
        />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo={edicao ? (titulo || 'Editar turma') : 'Nova turma'}
        voltarPara="/adm/turmas"
        rotuloVoltar="Turmas"
        actions={
          <>
            {edicao && requisicaoTurma.data?.status === 'INATIVA' ? (
              <Button
                variant="success"
                size="large"
                icon={<ArchiveRestore />}
                onClick={ativarTurma}
                disabled={salvando}
              >
                Ativar
              </Button>
            ) : edicao ? (
              <Button
                variant="danger"
                size="large"
                icon={<Archive />}
                onClick={excluirTurma}
                disabled={salvando}
              >
                Inativar
              </Button>
            ) : (
              <Button
                variant="danger"
                size="large"
                onClick={() => navegar('/adm/turmas')}
                disabled={salvando}
              >
                Cancelar
              </Button>
            )}
            <Button
              variant="success"
              size="large"
              icon={<Save />}
              loading={salvando}
              disabled={carregandoEscola}
              onClick={salvar}
            >
              Salvar
            </Button>
          </>
        }
      />

      {edicao && (
        <Tab<Aba>
          rotuloAcessivel="Seções da turma"
          value={aba}
          onChange={setAba}
          options={[
            { value: 'data', label: 'Dados da turma' },
            { value: 'horarios', label: 'Horários', contador: requisicaoHorarios.data?.length },
            { value: 'disciplinas', label: 'Disciplinas', contador: vinculosDaTurma.length },
            { value: 'alunos', label: 'Alunos ativos', contador: ativos.length },
            { value: 'historico', label: 'Histórico', contador: historico.length },
          ]}
        />
      )}

      {edicao && requisicaoTurma.loading ? (
        <SkeletonCartao />
      ) : (
        <>
          {(!edicao || aba === 'data') && (
            <Card titulo="Dados da turma">
              <Stack gap="md">
                <Grade>
                  <Input
                    label="Nome da turma"
                    required
                    placeholder="Ex.: Geek Júnior — Terça 8h"
                    value={titulo}
                    error={erros.titulo}
                    disabled={salvando}
                    maxLength={120}
                    onChange={(evento) => form.setFieldValue('titulo', evento.target.value)}
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
                    emptyText="Cadastre um curso primeiro"
                    onChange={(valor) => form.setFieldValue('cursoId', valor)}
                  />

                  <Input
                    label="Capacidade máxima"
                    type="number"
                    min={1}
                    placeholder="Ex.: 20"
                    value={capacidadeMaxima}
                    error={erros.capacidadeMaxima}
                    disabled={salvando}
                    hint="Usada para alertar quando a turma lota."
                    onChange={(evento) => form.setFieldValue('capacidadeMaxima', evento.target.value)}
                  />

                  <DatePicker
                    label="Data de início"
                    value={dataInicio}
                    disabled={salvando}
                    onChange={(evento) => form.setFieldValue('dataInicio', evento.target.value)}
                  />

                  <DatePicker
                    label="Data de término"
                    value={dataFim}
                    error={erros.dataFim}
                    // Turma ativa não tem data de término; só ganha uma ao ser encerrada.
                    disabled={salvando || ativa}
                    hint={ativa ? 'Só é definida ao encerrar a turma (Situação: Inativa).' : undefined}
                    onChange={(evento) => form.setFieldValue('dataFim', evento.target.value)}
                  />

                  <Select<StatusAtivoInativo>
                    label="Situação"
                    options={OPCOES_ATIVA_INATIVA}
                    value={ativa ? 'ATIVO' : 'INATIVO'}
                    hint="Turmas inativas não recebem novas matrículas."
                    disabled={salvando}
                    onChange={(valor) => {
                      const novoAtiva = valor !== 'INATIVO'
                      form.setFieldValue('ativa', novoAtiva)
                      if (novoAtiva) form.setFieldValue('dataFim', '')
                    }}
                  />
                </Grade>
              </Stack>
            </Card>
          )}

          {edicao && aba === 'horarios' && (
            <>
              <Card titulo="Horários semanais">
                <LinhaHorario>
                  <Select<DiaSemana>
                    label="Dia da semana"
                    options={OPCOES_DIA_SEMANA.map((opcao) => ({
                      value: opcao.value,
                      label: opcao.label,
                    }))}
                    value={novoHorario.diaSemana}
                    placeholder="Selecionar dia..."
                    onChange={(value) => setNovoHorario((atual) => ({ ...atual, diaSemana: value }))}
                  />

                  <TimePicker
                    label="Início"
                    value={novoHorario.horaInicio}
                    onChange={(evento) =>
                      setNovoHorario((atual) => ({ ...atual, horaInicio: evento.target.value }))
                    }
                  />

                  <TimePicker
                    label="Término"
                    value={novoHorario.horaFim}
                    onChange={(evento) =>
                      setNovoHorario((atual) => ({ ...atual, horaFim: evento.target.value }))
                    }
                  />

                  <Button size="large" icon={<Plus />} onClick={adicionarHorario}>
                    Adicionar
                  </Button>
                </LinhaHorario>
              </Card>

              <DataTable<HorarioTurma>
                descricao="Horários semanais da turma"
                columns={[
                  {
                    key: 'dia',
                    cabecalho: 'Dia da semana',
                    render: (horario) => ROTULO_DIA_SEMANA[horario.diaSemana],
                  },
                  {
                    key: 'inicio',
                    cabecalho: 'Início',
                    render: (horario) => formatarHora(horario.horaInicio),
                  },
                  {
                    key: 'fim',
                    cabecalho: 'Término',
                    render: (horario) => formatarHora(horario.horaFim),
                  },
                ]}
                data={requisicaoHorarios.data ?? []}
                rowKey={(horario) => horario.id}
                loading={requisicaoHorarios.loading}
                error={requisicaoHorarios.error}
                onReload={requisicaoHorarios.reload}
                densidade="compacta"
                empty={{
                  titulo: 'Nenhum horário definido',
                  descricao: 'Os horários semanais orientam o planejamento das aulas.',
                  icon: <CalendarClock />,
                }}
                actions={(horario) => (
                  <IconButton
                    label="Remover horário"
                    icon={<Trash2 />}
                    variant="danger"
                    onClick={() => removerHorario(horario.id)}
                  />
                )}
              />
            </>
          )}

          {edicao && aba === 'disciplinas' && (
            <>
              {gradeTotalmenteVinculada && (
                <AlertaDesempenhoCard
                  tom="success"
                  titulo="Todas as disciplinas já estão vinculadas"
                  descricao="A grade curricular do curso desta turma está totalmente vinculada. Para vincular outra disciplina, adicione-a primeiro à grade curricular do curso."
                />
              )}

              <Card titulo="Disciplinas e professores">
                <LinhaVinculo>
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
                    onChange={(value) => setNovoVinculo((atual) => ({ ...atual, disciplinaId: value }))}
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
                    onChange={(value) => setNovoVinculo((atual) => ({ ...atual, professorId: value }))}
                  />

                  <Button
                    size="large"
                    icon={<Plus />}
                    disabled={gradeTotalmenteVinculada}
                    onClick={adicionarVinculo}
                  >
                    Vincular
                  </Button>
                </LinhaVinculo>
              </Card>

              {disciplinasIncompletas.length > 0 && (
                <AlertaDesempenhoCard
                  titulo="Disciplinas pendentes de organização"
                  descricao={`${disciplinasIncompletas.length} disciplina(s) da grade curricular ${
                    disciplinasIncompletas.length === 1 ? 'está' : 'estão'
                  } sem professor: ${disciplinasIncompletas
                    .map(
                      (item) =>
                        `${item.disciplina.titulo}${item.motivo === 'nao-vinculada' ? ' (não vinculada)' : ''}`,
                    )
                    .join(', ')}. A turma pode ser salva assim mesmo — organize quando definir os professores.`}
                />
              )}

              <DataTable<TurmaDisciplina>
                descricao="Disciplinas da turma"
                columns={[
                  {
                    key: 'disciplina',
                    cabecalho: 'Disciplina',
                    render: (vinculo) => vinculo.disciplina?.titulo ?? '—',
                  },
                  {
                    key: 'professor',
                    cabecalho: 'Professor',
                    render: (vinculo) =>
                      vinculo.professor?.pessoa?.nome ?? (
                        <Tag variant="warning">Sem professor</Tag>
                      ),
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
          )}

          {edicao && aba === 'alunos' && (
            <>
              {avisosCargaHoraria.map((matricula) => (
                <AlertaDesempenhoCard
                  key={matricula.id}
                  tom="success"
                  titulo={`${matricula.aluno?.pessoa?.nome ?? 'Aluno'} concluiu a carga horária`}
                  descricao={`Matrícula concluída automaticamente em ${formatarData(matricula.dataFim)}. Se for necessário reativar, entre em contato com a administração.`}
                  acao={
                    <Button variant="secondary" size="small" onClick={() => dispensarAviso(matricula.id)}>
                      Ciente
                    </Button>
                  }
                />
              ))}

              <LinhaAcaoFlutuante>
                <Button
                  size="large"
                  icon={<UserPlus />}
                  onClick={() => navegar(`/adm/turmas/${turmaId}/matricular`)}
                >
                  Matricular aluno
                </Button>

                <BuscaInput
                  value={buscaAtivos}
                  onChange={setBuscaAtivos}
                  placeholder="Buscar aluno por nome..."
                />
              </LinhaAcaoFlutuante>

              <DataTable<AlunoTurma>
                descricao="Alunos com matrícula ativa"
                columns={[
                  {
                    key: 'aluno',
                    cabecalho: 'Aluno',
                    ordenavel: true,
                    valorOrdenacao: (matricula) => matricula.aluno?.pessoa?.nome ?? '',
                    render: (matricula) => matricula.aluno?.pessoa?.nome ?? '—',
                  },
                  {
                    key: 'idade',
                    cabecalho: 'Idade',
                    render: (matricula) => formatarIdade(matricula.aluno?.pessoa?.dataNascimento),
                  },
                  {
                    key: 'cargaHoraria',
                    cabecalho: 'Carga horária',
                    ocultarEmTelaPequena: true,
                    render: (matricula) => formatarCargaHoraria(cargaHorariaPorAluno.get(matricula.aluno.id) ?? 0),
                  },
                  {
                    key: 'inicio',
                    cabecalho: 'Data da matrícula',
                    render: (matricula) => formatarData(matricula.dataInicio),
                  },
                  {
                    key: 'status',
                    cabecalho: 'Situação',
                    render: (matricula) =>
                      matricula.status ? (
                        <Tag variant={STATUS_MATRICULA_VARIANT[matricula.status]}>
                          {ROTULO_STATUS_MATRICULA[matricula.status]}
                        </Tag>
                      ) : (
                        '—'
                      ),
                  },
                ]}
                data={paginacaoAtivos.itensDaPagina}
                rowKey={(matricula) => matricula.id}
                loading={requisicaoAtivos.loading}
                error={requisicaoAtivos.error}
                onReload={requisicaoAtivos.reload}
                paginacao={{
                  pagina: paginacaoAtivos.pagina,
                  totalPaginas: paginacaoAtivos.totalPaginas,
                  label: paginacaoAtivos.label,
                  temAnterior: paginacaoAtivos.temAnterior,
                  temProxima: paginacaoAtivos.temProxima,
                  onPrevious: paginacaoAtivos.anterior,
                  onNext: paginacaoAtivos.proxima,
                }}
                empty={{
                  titulo: buscaAtivos ? 'Nenhum aluno encontrado' : 'Nenhum aluno matriculado',
                  descricao: buscaAtivos
                    ? 'Revise o termo buscado ou limpe o filtro.'
                    : 'Matricule alunos para começar a registrar aulas e frequências.',
                  icon: <Users />,
                  acao: !buscaAtivos && (
                    <Button
                      icon={<UserPlus />}
                      onClick={() => navegar(`/adm/turmas/${turmaId}/matricular`)}
                    >
                      Matricular aluno
                    </Button>
                  ),
                }}
                actions={(matricula) => (
                  <IconButton
                    label="Editar matrícula"
                    icon={<Pencil />}
                    onClick={() => navegar(`/adm/turmas/${turmaId}/matricular/${matricula.id}`)}
                  />
                )}
                rotuloColunaAcoes="Matrícula"
              />
            </>
          )}

          {edicao && aba === 'historico' && (
            <>
              <LinhaAcaoFlutuante>
                <BuscaInput
                  value={buscaHistorico}
                  onChange={setBuscaHistorico}
                  placeholder="Buscar aluno por nome..."
                />
              </LinhaAcaoFlutuante>

              <DataTable<AlunoTurma>
                descricao="Histórico completo de matrículas da turma"
                columns={[
                  {
                    key: 'aluno',
                    cabecalho: 'Aluno',
                    render: (matricula) => matricula.aluno?.pessoa?.nome ?? '—',
                  },
                  {
                    key: 'status',
                    cabecalho: 'Situação',
                    render: (matricula) =>
                      matricula.status ? (
                        <Tag variant={STATUS_MATRICULA_VARIANT[matricula.status]}>
                          {ROTULO_STATUS_MATRICULA[matricula.status]}
                        </Tag>
                      ) : (
                        '—'
                      ),
                  },
                  {
                    key: 'inicio',
                    cabecalho: 'Início',
                    render: (matricula) => formatarData(matricula.dataInicio),
                  },
                  {
                    key: 'fim',
                    cabecalho: 'Término',
                    render: (matricula) =>
                      matricula.dataFim ? formatarData(matricula.dataFim) : 'em aberto',
                  },
                ]}
                data={paginacaoHistorico.itensDaPagina}
                rowKey={(matricula) => matricula.id}
                loading={requisicaoHistorico.loading}
                error={requisicaoHistorico.error}
                onReload={requisicaoHistorico.reload}
                densidade="compacta"
                paginacao={{
                  pagina: paginacaoHistorico.pagina,
                  totalPaginas: paginacaoHistorico.totalPaginas,
                  label: paginacaoHistorico.label,
                  temAnterior: paginacaoHistorico.temAnterior,
                  temProxima: paginacaoHistorico.temProxima,
                  onPrevious: paginacaoHistorico.anterior,
                  onNext: paginacaoHistorico.proxima,
                }}
                empty={{
                  titulo: buscaHistorico ? 'Nenhum aluno encontrado' : 'Sem histórico',
                  descricao: buscaHistorico
                    ? 'Revise o termo buscado ou limpe o filtro.'
                    : 'Nenhuma matrícula foi registrada nesta turma.',
                }}
                actions={(matricula) => (
                  <IconButton
                    label="Editar matrícula"
                    icon={<Pencil />}
                    onClick={() => navegar(`/adm/turmas/${turmaId}/matricular/${matricula.id}`)}
                  />
                )}
                rotuloColunaAcoes="Matrícula"
              />
            </>
          )}
        </>
      )}
    </Layout>
  )
}
