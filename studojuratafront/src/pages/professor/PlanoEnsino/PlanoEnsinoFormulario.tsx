import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { ListTree, Save, Trash2 } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Header } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Tab } from '../../../components/ui/Tab'
import { TextArea } from '../../../components/ui/TextArea'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useHidratar } from '../../../hooks/useHidratar'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import {
  conteudosPlano as servicoConteudos,
  cursoDisciplinas as servicoCursoDisciplinas,
  cursos as servicoCursos,
  planosEnsino as servicoPlanos,
  professores as servicoProfessores,
} from '../../../services/endpoints'
import { formatarData } from '../../../utils/format'
import { OPCOES_STATUS_PLANO } from '../../../utils/labels'
import { intervaloDeDatas } from '../../../utils/validacao'
import type { CursoDisciplina, StatusPlano } from '../../../types'

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

/* 2 campos por linha (pedido explícito) — auto-fit com minmax largo o
   suficiente pra nunca refluir 3 numa linha só. */
const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

type Aba = 'identificacao' | 'proposta'

export default function PlanoEnsinoFormulario() {
  const { id } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()
  const { professorId, professor } = useProfessorLogado()

  const edicao = Boolean(id)
  const planoId = id ? Number(id) : null

  const [titulo, setTitulo] = useState('')
  const [cursoId, setCursoId] = useState<number | null>(null)
  const [turmaId, setTurmaId] = useState<number | null>(null)
  const [disciplinaId, setDisciplinaId] = useState<number | null>(null)
  const [cargaHoraria, setCargaHoraria] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [ementa, setEmenta] = useState('')
  const [objetivoGeral, setObjetivoGeral] = useState('')
  const [metodologia, setMetodologia] = useState('')
  const [status, setStatus] = useState<StatusPlano>('ATIVO')
  const [erros, setErros] = useState<Record<string, string | undefined>>({})
  const [aba, setAba] = useState<Aba>('identificacao')

  const requisicaoPlano = useRequisicao(() => servicoPlanos.buscar(planoId as number), [planoId], {
    ativo: Boolean(planoId),
  })
  const requisicaoCursos = useRequisicao(() => servicoCursos.listar(), [])
  const requisicaoVinculos = useRequisicao(
    () => servicoProfessores.turmasLecionadas(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )
  // Grade curricular do curso escolhido (pedido explícito): só usada pra
  // sugerir a carga horária ao criar — não sobrescreve edição existente.
  const requisicaoGradeCurricular = useRequisicao(
    () => servicoCursoDisciplinas.listarPorCurso(cursoId as number),
    [cursoId],
    { ativo: Boolean(cursoId) && !edicao },
  )

  useHidratar(requisicaoPlano.data, (plano) => {
    setTitulo(plano.titulo ?? '')
    setCursoId(plano.curso?.id ?? null)
    setTurmaId(plano.turmaDisciplina?.turma?.id ?? null)
    setDisciplinaId(plano.turmaDisciplina?.disciplina?.id ?? null)
    setCargaHoraria(plano.cargaHoraria?.toString() ?? '')
    setDataInicio(plano.dataInicio?.slice(0, 10) ?? '')
    setDataFim(plano.dataFim?.slice(0, 10) ?? '')
    setEmenta(plano.ementa ?? '')
    setObjetivoGeral(plano.objetivoGeral ?? '')
    setMetodologia(plano.metodologia ?? '')
    setStatus(plano.status ?? 'ATIVO')
  })

  const opcoesCursos = useMemo(
    () => (requisicaoCursos.data ?? []).map((curso) => ({ value: curso.id, label: curso.nome })),
    [requisicaoCursos.data],
  )

  // Turma e disciplina — dois selects (Figma), não um combinado: escolhe a
  // turma primeiro, a disciplina é filtrada pelas que o professor leciona
  // nela (mesmo padrão já usado em Notas).
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

  // Continuidade pedagógica (pedido explícito): cursos costumam durar mais
  // que um ciclo de plano de ensino — quando a turma/disciplina escolhida já
  // teve um plano CONCLUIDO antes, avisa o professor de onde parou, só como
  // informação (não pré-preenche nada, ele decide os conteúdos do novo ciclo).
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
    if (encontrado?.cargaHoraria) setCargaHoraria(String(encontrado.cargaHoraria))
  }

  function validar() {
    const encontrados: Record<string, string | undefined> = {}

    // PlanoEnsino.curso é @ManyToOne(optional = false).
    if (!cursoId) encontrados.cursoId = 'Selecione o curso'

    if (cargaHoraria && (!Number.isFinite(Number(cargaHoraria)) || Number(cargaHoraria) <= 0)) {
      encontrados.cargaHoraria = 'Informe um número de horas maior que zero'
    }

    const erroDatas = intervaloDeDatas(dataInicio, dataFim)
    if (erroDatas) encontrados.dataFim = erroDatas

    setErros(encontrados)
    return Object.keys(encontrados).filter((chave) => encontrados[chave]).length === 0
  }

  const { executar: salvar, executando: salvando } = useAcao(async () => {
    if (!validar()) return

    const curso = (requisicaoCursos.data ?? []).find((item) => item.id === cursoId)
    if (!curso) return

    try {
      const corpo = {
        curso,
        // Vínculo pedido explicitamente: quem cria/edita o plano é sempre o
        // professor responsável por ele — sem select à parte, pra não abrir
        // brecha de um professor "assinar" um plano de outro sem querer.
        professor: professor ?? undefined,
        turmaDisciplina: vinculoSelecionado ?? undefined,
        titulo: titulo.trim() || undefined,
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
      titulo: 'Excluir plano de ensino?',
      descricao: 'Os conteúdos e planos de aula vinculados permanecem.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoPlanos.excluir(planoId)
          toast.success('Plano excluído')
          navegar('/professor/plano-ensino')
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
            {/* Cancelar só existe enquanto o plano ainda não foi salvo — depois
                de salvo, desfazer é Excluir (soft-delete), não Cancelar. */}
            {edicao ? (
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

      {edicao && (
        <Tab<Aba>
          rotuloAcessivel="Seções do plano de ensino"
          value={aba}
          onChange={setAba}
          options={[
            { value: 'identificacao', label: 'Identificação' },
            { value: 'proposta', label: 'Proposta pedagógica' },
          ]}
        />
      )}

      {edicao && requisicaoPlano.loading ? (
        <SkeletonCartao />
      ) : (
        <>
          {(!edicao || aba === 'identificacao') && (
          <Card titulo="Identificação">
            <Coluna>
              <Grade>
                <Input
                  label="Título do plano"
                  placeholder="Ex.: Robótica — 1º semestre"
                  value={titulo}
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
                  onChange={setCursoId}
                />
              </Grade>

              <Input
                label="Professor responsável"
                value={
                  (edicao ? requisicaoPlano.data?.professor?.pessoa?.nome : professor?.pessoa?.nome) ?? '—'
                }
                disabled
                hint="Sempre quem está logado ao criar o plano."
              />

              <Grade>
                <Select<number>
                  label="Turma"
                  options={opcoesTurmas}
                  value={turmaId}
                  loading={requisicaoVinculos.loading}
                  searchable
                  clearable
                  placeholder="Selecionar turma..."
                  hint="Opcional: vincule para que o plano apareça na turma."
                  emptyText="Você ainda não leciona em nenhuma turma"
                  onChange={(valor) => {
                    setTurmaId(valor)
                    setDisciplinaId(null)
                  }}
                />

                <Select<number>
                  label="Disciplina"
                  options={opcoesDisciplinas}
                  value={disciplinaId}
                  disabled={!turmaId}
                  searchable
                  clearable
                  placeholder="Selecionar disciplina..."
                  emptyText={turmaId ? 'Sem disciplinas nessa turma' : 'Selecione a turma primeiro'}
                  hint={avisoContinuidade}
                  onChange={(valor) => {
                    setDisciplinaId(valor)
                    sugerirCargaHoraria(valor, requisicaoGradeCurricular.data ?? [])
                  }}
                />
              </Grade>

              <Grade>
                <Input
                  label="Carga horária"
                  type="number"
                  min={1}
                  placeholder="Ex.: 40"
                  value={cargaHoraria}
                  error={erros.cargaHoraria}
                  disabled={salvando}
                  hint="Em horas."
                  onChange={(evento) => setCargaHoraria(evento.target.value)}
                />

                <Select<StatusPlano>
                  label="Situação"
                  options={OPCOES_STATUS_PLANO}
                  value={status}
                  disabled={salvando}
                  onChange={(valor) => setStatus(valor ?? 'ATIVO')}
                />
              </Grade>

              <Grade>
                <DatePicker
                  label="Início"
                  value={dataInicio}
                  disabled={salvando}
                  onChange={(evento) => setDataInicio(evento.target.value)}
                />

                <DatePicker
                  label="Término"
                  value={dataFim}
                  error={erros.dataFim}
                  disabled={salvando}
                  onChange={(evento) => setDataFim(evento.target.value)}
                />
              </Grade>
            </Coluna>
          </Card>
          )}

          {(!edicao || aba === 'proposta') && (
          <Card titulo="Proposta pedagógica">
            <Coluna>
              <TextArea
                label="Ementa"
                placeholder="Resumo dos temas abordados no período..."
                value={ementa}
                disabled={salvando}
                maxLength={2000}
                rows={4}
                autoAltura
                onChange={(evento) => setEmenta(evento.target.value)}
              />

              <TextArea
                label="Objetivo geral"
                placeholder="O que o aluno deve ser capaz de fazer ao final..."
                value={objetivoGeral}
                disabled={salvando}
                maxLength={2000}
                rows={3}
                autoAltura
                onChange={(evento) => setObjetivoGeral(evento.target.value)}
              />

              <TextArea
                label="Metodologia"
                placeholder="Estratégias, recursos e forma de avaliação..."
                value={metodologia}
                disabled={salvando}
                maxLength={2000}
                rows={3}
                autoAltura
                onChange={(evento) => setMetodologia(evento.target.value)}
              />
            </Coluna>
          </Card>
          )}
        </>
      )}
    </Layout>
  )
}
