import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { CalendarClock, Pencil, Plus, Save, Trash2, UserPlus, Users } from 'lucide-react'

import { Layout } from '../../../components/layout'
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
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
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
  horariosTurma,
  matriculas,
  professores as servicoProfessores,
  turmaDisciplinas,
  turmas as servicoTurmas,
} from '../../../services/endpoints'
import { formatarData, formatarHora, formatarIdade, normalizar } from '../../../utils/format'
import {
  OPCOES_ATIVA_INATIVA,
  OPCOES_DIA_SEMANA,
  ROTULO_DIA_SEMANA,
  ROTULO_STATUS_MATRICULA,
  STATUS_MATRICULA_VARIANT,
} from '../../../utils/labels'
import { intervaloDeDatas } from '../../../utils/validacao'
import type {
  AlunoTurma,
  DiaSemana,
  HorarioTurma,
  StatusAtivoInativo,
  TurmaDisciplina,
} from '../../../types'

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

/* Três campos por linha (confirmado pelo usuário) — não auto-fit, senão o
   número de colunas varia com a largura da tela. */
const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`

/* Ações que dividem linha com Select/Input (56px) usam o mesmo size="large"
   pra não ficarem mais baixas que o campo ao lado. Busca sempre por último
   no JSX (extrema direita) — mesmo padrão do Header (actions antes, filtros
   por último), confirmado pelo usuário. */
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
  const toast = useToast()
  const confirmar = useConfirm()
  const { escola, loading: carregandoEscola } = useEscola()

  const edicao = Boolean(id)
  const turmaId = id ? Number(id) : null

  const [aba, setAba] = useState<Aba>('data')

  const [titulo, setTitulo] = useState('')
  const [cursoId, setCursoId] = useState<number | null>(null)
  const [capacidadeMaxima, setCapacidadeMaxima] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [ativa, setAtiva] = useState(true)
  const [erros, setErros] = useState<Record<string, string | undefined>>({})
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
  // Grade curricular do curso da turma (pedido explícito): só faz sentido
  // vincular à turma uma disciplina que já faz parte do currículo do curso,
  // cadastrado em /adm/cursos/:id (ver CursoFormulario).
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
    setTitulo(turma.titulo ?? '')
    setCursoId(turma.curso?.id ?? null)
    setCapacidadeMaxima(turma.capacidadeMaxima?.toString() ?? '')
    setDataInicio(turma.dataInicio?.slice(0, 10) ?? '')
    setDataFim(turma.dataFim?.slice(0, 10) ?? '')
    setAtiva(turma.status !== 'INATIVA')
  })

  const vinculosDaTurma = useMemo(
    () => (requisicaoVinculos.data ?? []).filter((vinculo) => vinculo.turma?.id === turmaId),
    [requisicaoVinculos.data, turmaId],
  )

  const opcoesCursos = useMemo(
    () =>
      (requisicaoCursos.data ?? [])
        .filter((curso) => curso.status !== 'INATIVO')
        .map((curso) => ({ value: curso.id, label: curso.nome })),
    [requisicaoCursos.data],
  )

  const opcoesDisciplinas = useMemo(() => {
    const idsDaGrade = new Set(
      (requisicaoGradeCurricular.data ?? [])
        .filter((item) => item.status !== 'INATIVO')
        .map((item) => item.disciplina?.id),
    )
    return (requisicaoDisciplinas.data ?? [])
      .filter((disciplina) => disciplina.status !== 'INATIVO' && idsDaGrade.has(disciplina.id))
      .map((disciplina) => ({ value: disciplina.id, label: disciplina.titulo ?? '—' }))
  }, [requisicaoDisciplinas.data, requisicaoGradeCurricular.data])

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

  function validar() {
    const encontrados: Record<string, string | undefined> = {}

    if (!titulo.trim()) encontrados.titulo = 'Informe o nome da turma'

    // Turma.curso é @ManyToOne(optional = false).
    if (!cursoId) encontrados.cursoId = 'Selecione o curso'

    if (
      capacidadeMaxima &&
      (!Number.isInteger(Number(capacidadeMaxima)) || Number(capacidadeMaxima) <= 0)
    ) {
      encontrados.capacidadeMaxima = 'Informe um número inteiro maior que zero'
    }

    const erroPeriodo = intervaloDeDatas(dataInicio, dataFim)
    if (erroPeriodo) encontrados.dataFim = erroPeriodo

    setErros(encontrados)
    return Object.keys(encontrados).filter((chave) => encontrados[chave]).length === 0
  }

  async function salvar() {
    if (!validar()) {
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
      titulo: 'Remover disciplina da turma?',
      descricao: 'Planos de aula já criados para esta disciplina continuam existindo.',
      rotuloConfirmar: 'Remover',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await turmaDisciplinas.excluir(vinculo.id)
          toast.success('Disciplina removida da turma')
          await requisicaoVinculos.reload()
        } catch (erroRemover) {
          toast.error(
            'Não foi possível remover',
            erroRemover instanceof ApiError ? erroRemover.message : undefined,
          )
        }
      },
    })
  }

  async function excluirTurma() {
    if (!turmaId) return

    await confirmar({
      titulo: 'Excluir turma?',
      descricao: 'O histórico de matrículas é preservado.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoTurmas.excluir(turmaId)
          toast.success('Turma excluída')
          navegar('/adm/turmas')
        } catch (erroExclusao) {
          toast.error(
            'Não foi possível excluir',
            erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
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
            {edicao ? (
              <Button
                variant="danger"
                size="large"
                icon={<Trash2 />}
                onClick={excluirTurma}
                disabled={salvando}
              >
                Excluir
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
              <Coluna>
                <Grade>
                  <Input
                    label="Nome da turma"
                    required
                    placeholder="Ex.: Geek Júnior — Terça 8h"
                    value={titulo}
                    error={erros.titulo}
                    disabled={salvando}
                    maxLength={120}
                    onChange={(evento) => setTitulo(evento.target.value)}
                  />

                  <Select<number>
                    label="Curso"
                    required
                    options={opcoesCursos}
                    value={cursoId}
                    loading={requisicaoCursos.loading}
                    error={erros.cursoId}
                    searchable
                    placeholder="Selecionar curso..."
                    emptyText="Cadastre um curso primeiro"
                    onChange={setCursoId}
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
                    onChange={(evento) => setCapacidadeMaxima(evento.target.value)}
                  />

                  <DatePicker
                    label="Data de início"
                    value={dataInicio}
                    disabled={salvando}
                    onChange={(evento) => setDataInicio(evento.target.value)}
                  />

                  <DatePicker
                    label="Data de término"
                    value={dataFim}
                    error={erros.dataFim}
                    // Matrícula cíclica: uma turma ativa continua indefinidamente,
                    // sem data de término definida — só ganha uma ao ser encerrada.
                    disabled={salvando || ativa}
                    hint={ativa ? 'Só é definida ao encerrar a turma (Situação: Inativa).' : undefined}
                    onChange={(evento) => setDataFim(evento.target.value)}
                  />

                  <Select<StatusAtivoInativo>
                    label="Situação"
                    options={OPCOES_ATIVA_INATIVA}
                    value={ativa ? 'ATIVO' : 'INATIVO'}
                    hint="Turmas inativas não recebem novas matrículas."
                    disabled={salvando}
                    onChange={(valor) => {
                      const novoAtiva = valor !== 'INATIVO'
                      setAtiva(novoAtiva)
                      if (novoAtiva) setDataFim('')
                    }}
                  />
                </Grade>
              </Coluna>
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
              <Card titulo="Disciplinas e professores">
                <LinhaVinculo>
                  <Select<number>
                    label="Disciplina"
                    options={opcoesDisciplinas}
                    value={novoVinculo.disciplinaId}
                    loading={requisicaoDisciplinas.loading || requisicaoGradeCurricular.loading}
                    searchable
                    placeholder="Selecionar disciplina..."
                    emptyText="O curso desta turma ainda não tem disciplinas na grade curricular"
                    onChange={(value) => setNovoVinculo((atual) => ({ ...atual, disciplinaId: value }))}
                  />

                  <Select<number>
                    label="Professor responsável"
                    options={opcoesProfessores}
                    value={novoVinculo.professorId}
                    loading={requisicaoProfessores.loading}
                    searchable
                    clearable
                    placeholder="Selecionar professor..."
                    onChange={(value) => setNovoVinculo((atual) => ({ ...atual, professorId: value }))}
                  />

                  <Button size="large" icon={<Plus />} onClick={adicionarVinculo}>
                    Vincular
                  </Button>
                </LinhaVinculo>
              </Card>

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
                    label="Remover disciplina"
                    icon={<Trash2 />}
                    variant="danger"
                    onClick={() => removerVinculo(vinculo)}
                  />
                )}
              />
            </>
          )}

          {edicao && aba === 'alunos' && (
            <>
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
