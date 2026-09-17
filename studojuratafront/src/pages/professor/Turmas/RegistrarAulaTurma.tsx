import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import { CheckCheck, Save, UserX, Users } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { CheckBox } from '../../../components/ui/CheckBox'
import { DataTable } from '../../../components/ui/DataTable'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Header } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Tab } from '../../../components/ui/Tab'
import { TextArea } from '../../../components/ui/TextArea'
import { TimePicker } from '../../../components/ui/TimePicker'
import { VinculoConteudoAula } from '../../../components/ui/VinculoConteudo'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { useToast } from '../../../contexts/toastContexto'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import {
  aulas as servicoAulas,
  cursoDisciplinas,
  frequencias as servicoFrequencias,
  horariosTurma,
  matriculas,
  planosAula,
  professores as servicoProfessores,
  turmas as servicoTurmas,
} from '../../../services/endpoints'
import { formatarCargaHoraria, formatarHora, horaParaMinutos, horasParaHHmm } from '../../../utils/format'
import { ROTULO_DIA_SEMANA_CURTO } from '../../../utils/labels'
import type { AlunoTurma } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'
import { Stack } from '../../../components/ui/Stack'
import { GradeAutoAjuste } from '../../../components/ui/GradeAutoAjuste'

type Aba = 'chamada' | 'conteudo'

/* Disciplina + aula do plano de aula + Salvar ficam juntos dentro do próprio
   cartão do Header. flex-wrap (não overflow-x: auto): quando o espaço aperta
   os campos quebram pra uma segunda linha, sempre abaixo do título — nunca
   viram uma faixa com scroll horizontal escondendo conteúdo. */
const CamposCabecalho = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`

/* Largura concreta: o <Field> ocupa 100% do pai, e só max-width deixava o pai encolher demais. */
const CampoLargura = styled.div<{ $largura: string }>`
  width: ${({ $largura }) => $largura};
  max-width: 100%;
`

/* Botões "flutuantes" acima da tabela — soltos no fundo cinza da página,
   fora do cartão branco da tabela, não dentro do header dela. */
const BotoesFlutuantes = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.xs};
`

/* O Salvar não pode encolher junto com o resto da linha (Disciplina + Aula)
   quando o espaço aperta — senão o texto do botão corta. */
const BotaoSalvar = styled.div`
  flex-shrink: 0;
`

/* Só aparece quando a grade define a carga horária total da disciplina. */
const ColunaCargaHoraria = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  min-width: 130px;
`

const TrilhaCargaHoraria = styled.div`
  height: 6px;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`

const PreenchimentoCargaHoraria = styled.div<{ $percentual: number }>`
  height: 100%;
  width: ${({ $percentual }) => Math.min(100, $percentual)}%;
  background: ${({ theme }) => theme.colors.purple};
  border-radius: inherit;
`

interface LinhaChamada {
  alunoId: number
  nome: string
  presente: boolean
  cargaHorariaAtingida: number
}

/**
 * O professor escolhe a disciplina e a aula do plano; sem escolha, a próxima
 * aula pendente vem pré-selecionada. Vindo de PlanoAula/Aulas.tsx, a aula
 * clicada chega por ?aulaId=&vinculoId=.
 */
export default function RegistrarAulaTurma() {
  const { turmaId } = useParams()
  const toast = useToast()
  const { professorId } = useProfessorLogado()

  const idTurma = Number(turmaId)

  const [searchParams] = useSearchParams()
  const aulaIdDaUrl = Number(searchParams.get('aulaId')) || null
  const vinculoIdDaUrl = Number(searchParams.get('vinculoId')) || null

  const [aba, setAba] = useState<Aba>('conteudo')
  const [turmaDisciplinaId, setTurmaDisciplinaId] = useState<number | null>(vinculoIdDaUrl)
  const [aulaSelecionadaManualId, setAulaSelecionadaManualId] = useState<number | null>(aulaIdDaUrl)
  // Como em AulaFormulario: cargaHorariaManual só quando a turma não tem horário cadastrado.
  const [horarioTurmaId, setHorarioTurmaId] = useState<number | null>(null)
  const [cargaHorariaManual, setCargaHorariaManual] = useState('')
  const [dataPrevista, setDataPrevista] = useState('')
  const [dataPublicacao, setDataPublicacao] = useState(() => new Date().toISOString().slice(0, 10))
  const [observacoes, setObservacoes] = useState('')
  const [edicoesChamada, setEdicoesChamada] = useState<Record<number, boolean>>({})
  const [titulo, setTitulo] = useState('')
  // Conteúdos escolhidos antes de a aula existir, vinculados em salvar().
  const [conteudoPlanoIdsPendentes, setConteudoPlanoIdsPendentes] = useState<number[]>([])

  const requisicaoTurma = useRequisicao(() => servicoTurmas.buscar(idTurma), [idTurma])

  const requisicaoVinculos = useRequisicao(
    () => servicoProfessores.turmasLecionadas(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )

  const disciplinasDaTurma = useMemo(
    () =>
      (requisicaoVinculos.data ?? [])
        .filter((vinculo) => vinculo.turma?.id === idTurma && vinculo.status !== 'INATIVO')
        .map((vinculo) => ({ value: vinculo.id, label: vinculo.disciplina?.titulo ?? '—' })),
    [requisicaoVinculos.data, idTurma],
  )

  // Só a primeira disciplina lecionada nessa turma vem pré-selecionada — nunca decidir por conta própria quando há mais de uma.
  const disciplinaAtiva = turmaDisciplinaId ?? disciplinasDaTurma[0]?.value ?? null

  const requisicaoPlanos = useRequisicao(
    () => planosAula.listarPorTurmaDisciplina(disciplinaAtiva as number),
    [disciplinaAtiva],
    { ativo: Boolean(disciplinaAtiva) },
  )

  // listarPorTurmaDisciplina traz também planos concluídos; só vale o ATIVO.
  const planoAtual = (requisicaoPlanos.data ?? []).find((plano) => plano.status === 'ATIVO') ?? null

  // Carga horária total da disciplina na grade, para a barra de progresso.
  const cursoId = requisicaoTurma.data?.curso?.id ?? null
  const requisicaoGradeCurricular = useRequisicao(
    () => cursoDisciplinas.listarPorCurso(cursoId as number),
    [cursoId],
    { ativo: Boolean(cursoId) },
  )
  const disciplinaIdAtiva = (requisicaoVinculos.data ?? []).find((vinculo) => vinculo.id === disciplinaAtiva)
    ?.disciplina?.id
  const cargaHorariaTotalDisciplina = (requisicaoGradeCurricular.data ?? []).find(
    (item) => item.disciplina?.id === disciplinaIdAtiva && item.status !== 'INATIVO',
  )?.cargaHoraria

  const requisicaoAulasPlano = useRequisicao(
    () => servicoAulas.listarPorPlanoAula(planoAtual?.id as number),
    [planoAtual?.id],
    { ativo: Boolean(planoAtual) },
  )

  const aulasDoPlano = useMemo(() => requisicaoAulasPlano.data ?? [], [requisicaoAulasPlano.data])

  // Sem escolha manual: a próxima aula pendente (sem dataPublicacao) do
  // plano, por ordem — o caso comum de "a próxima aula a dar".
  const aulaSugerida = useMemo(
    () =>
      [...aulasDoPlano]
        .filter((aula) => !aula.dataPublicacao && aula.status !== 'INATIVO')
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))[0] ?? null,
    [aulasDoPlano],
  )

  const aulaAlvo = aulaSelecionadaManualId
    ? (aulasDoPlano.find((aula) => aula.id === aulaSelecionadaManualId) ?? null)
    : aulaSugerida

  // Trocar de disciplina invalida a escolha manual. Compara valor em vez de
  // usar flag porque o StrictMode roda o efeito duas vezes na montagem e
  // descartaria a pré-seleção de ?aulaId=.
  const disciplinaAnterior = useRef(disciplinaAtiva)
  useEffect(() => {
    if (disciplinaAnterior.current === disciplinaAtiva) return

    disciplinaAnterior.current = disciplinaAtiva
    setAulaSelecionadaManualId(null)
  }, [disciplinaAtiva])

  const requisicaoHorarios = useRequisicao(() => horariosTurma.listarPorTurma(idTurma), [idTurma])

  const opcoesHorarios = useMemo(
    () =>
      (requisicaoHorarios.data ?? []).map((horario) => {
        const minutos = horaParaMinutos(horario.horaFim) - horaParaMinutos(horario.horaInicio)
        return {
          value: horario.id,
          label: `${ROTULO_DIA_SEMANA_CURTO[horario.diaSemana]} — ${formatarHora(horario.horaInicio)} às ${formatarHora(horario.horaFim)} (${formatarCargaHoraria(minutos / 60)})`,
        }
      }),
    [requisicaoHorarios.data],
  )

  const horarioSelecionado = (requisicaoHorarios.data ?? []).find((horario) => horario.id === horarioTurmaId)
  const cargaHorariaCalculada = horarioSelecionado
    ? (horaParaMinutos(horarioSelecionado.horaFim) - horaParaMinutos(horarioSelecionado.horaInicio)) / 60
    : null

  // Turma sem NENHUM horário cadastrado: não há o que selecionar, a carga
  // horária é digitada (TimePicker, HH:mm) em vez do Select.
  const semHorarioCadastrado = !requisicaoHorarios.loading && opcoesHorarios.length === 0

  // A chamada depende dos horários da aula (cada aluno é avaliado contra a
  // carga horária prevista) — só libera com um horário (ou carga horária
  // digitada, na ausência de horário cadastrado) escolhido na aba de conteúdo.
  const chamadaLiberada = semHorarioCadastrado
    ? horaParaMinutos(cargaHorariaManual || '00:00') > 0
    : Boolean(horarioTurmaId)

  useEffect(() => {
    if (!chamadaLiberada && aba === 'chamada') setAba('conteudo')
  }, [chamadaLiberada, aba])

  // Os campos de "criar/ajustar aula" seguem a aula-alvo atual (selecionada
  // ou sugerida) — trocando de aula, os campos atualizam junto. Sem aula
  // já publicada, a data de publicação sugerida é hoje.
  useEffect(() => {
    if (aulaAlvo?.horarioTurma?.id) {
      setHorarioTurmaId(aulaAlvo.horarioTurma.id)
      setCargaHorariaManual('')
    } else if (aulaAlvo?.cargaHoraria) {
      setHorarioTurmaId(null)
      setCargaHorariaManual(horasParaHHmm(aulaAlvo.cargaHoraria))
    } else {
      setHorarioTurmaId(null)
      setCargaHorariaManual('')
    }
    setDataPrevista(aulaAlvo?.dataPrevista?.slice(0, 10) ?? '')
    setDataPublicacao(aulaAlvo?.dataPublicacao?.slice(0, 10) ?? new Date().toISOString().slice(0, 10))
    setObservacoes(aulaAlvo?.observacoes ?? '')
    setTitulo(aulaAlvo?.titulo ?? '')
    setConteudoPlanoIdsPendentes([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aulaAlvo?.id])

  const opcoesAulasPlano = useMemo(
    () =>
      [...aulasDoPlano]
        .filter((aula) => aula.status !== 'INATIVO')
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
        .map((aula) => ({
          value: aula.id,
          label: `${aula.ordem ? `Aula ${aula.ordem} — ` : ''}${aula.titulo ?? 'Sem título'}`,
          description: aula.dataPublicacao ? 'Já ministrada' : 'Planejada',
        })),
    [aulasDoPlano],
  )

  const requisicaoMatriculas = useRequisicao(() => matriculas.ativosPorTurma(idTurma), [idTurma])

  // Carga horária acumulada de cada aluno nesta disciplina — soma das aulas
  // ministradas (com data de publicação) em que ele foi marcado presente.
  const requisicaoCargaHoraria = useRequisicao(
    async () => {
      const alunos = requisicaoMatriculas.data ?? []
      if (!planoAtual) return new Map<number, number>()

      const listas = await Promise.all(
        alunos.map((matricula) => servicoFrequencias.listarPorAluno(matricula.aluno.id)),
      )

      return new Map(
        alunos.map((matricula, indice) => {
          const total = listas[indice]
            .filter((frequencia) => frequencia.presente && frequencia.aula?.planoAula?.id === planoAtual.id)
            .reduce((soma, frequencia) => soma + (frequencia.aula?.cargaHoraria ?? 0), 0)

          return [matricula.aluno.id, total]
        }),
      )
    },
    [requisicaoMatriculas.data, planoAtual?.id],
    { ativo: Boolean(planoAtual) && !requisicaoMatriculas.loading },
  )

  const linhasChamada = useMemo<LinhaChamada[]>(() => {
    const alunos = requisicaoMatriculas.data ?? []
    const cargaHoraria = requisicaoCargaHoraria.data ?? new Map<number, number>()

    return alunos.map((matricula: AlunoTurma) => ({
      alunoId: matricula.aluno.id,
      nome: matricula.aluno?.pessoa?.nome ?? `Aluno ${matricula.aluno.id}`,
      presente: edicoesChamada[matricula.aluno.id] ?? true,
      cargaHorariaAtingida: cargaHoraria.get(matricula.aluno.id) ?? 0,
    }))
  }, [requisicaoMatriculas.data, requisicaoCargaHoraria.data, edicoesChamada])

  /**
   * Um único Salvar: sem aula, cria no plano (o back barra se estourar a carga
   * horária) e registra chamada e conteúdos; com aula, atualiza e registra.
   */
  const { executar: salvar, executando: salvando } = useAcao(async () => {
    if (!planoAtual) {
      toast.warning('Sem plano de aula', 'Esta disciplina ainda não tem um plano de aula nesta turma.')
      return
    }

    if (semHorarioCadastrado ? horaParaMinutos(cargaHorariaManual || '00:00') <= 0 : !horarioTurmaId) {
      toast.warning(
        semHorarioCadastrado ? 'Informe a carga horária' : 'Selecione o horário',
        semHorarioCadastrado ? 'Digite a duração da aula.' : 'Escolha o horário da turma pra esta aula.',
      )
      return
    }

    try {
      const idAula = aulaAlvo
        ? aulaAlvo.id
        : (
            await servicoAulas.criar({
              planoAula: planoAtual,
              titulo: titulo.trim() || undefined,
              dataPrevista: dataPrevista || undefined,
              dataPublicacao,
              horarioTurma: semHorarioCadastrado ? undefined : (horarioSelecionado ?? undefined),
              cargaHoraria: semHorarioCadastrado ? horaParaMinutos(cargaHorariaManual) / 60 : undefined,
              observacoes: observacoes.trim() || undefined,
              status: 'ATIVO',
            })
          ).id

      if (aulaAlvo) {
        // AulaService.atualizar faz save() completo, não merge — reenviar só
        // os campos desta tela apagaria ordem/planoAula/status. Parte do
        // aulaAlvo já carregado (listarPorPlanoAula), não de um objeto vazio.
        await servicoAulas.atualizar(idAula, {
          ...aulaAlvo,
          titulo: titulo.trim() || aulaAlvo.titulo,
          dataPublicacao,
          dataPrevista: dataPrevista || undefined,
          horarioTurma: semHorarioCadastrado ? null : (horarioSelecionado ?? null),
          cargaHoraria: semHorarioCadastrado
            ? horaParaMinutos(cargaHorariaManual) / 60
            : (cargaHorariaCalculada ?? undefined),
          observacoes: observacoes.trim() || undefined,
        })
      } else if (conteudoPlanoIdsPendentes.length > 0) {
        // Conteúdos escolhidos antes de a aula existir — comitados agora que ela finalmente tem id.
        await Promise.all(
          conteudoPlanoIdsPendentes.map((conteudoPlanoId) => servicoAulas.vincularConteudo(idAula, conteudoPlanoId)),
        )
      }

      await servicoAulas.registrarChamada(idAula, {
        alunos: linhasChamada.map((linha) => ({ alunoId: linha.alunoId, presente: linha.presente })),
      })

      toast.success('Aula registrada', 'Chamada e dados da aula salvos.')
      await requisicaoAulasPlano.reload()
    } catch (erroSalvar) {
      toast.error('Não foi possível salvar', erroSalvar instanceof ApiError ? erroSalvar.message : undefined)
    }
  })

  const colunasChamada: Coluna<LinhaChamada>[] = [
    {
      key: 'presente',
      cabecalho: 'Presente',
      largura: '27%',
      render: (linha) => (
        <CheckBox
          checked={linha.presente}
          aria-label={`Presença de ${linha.nome}`}
          onChange={(evento) =>
            setEdicoesChamada((atuais) => ({ ...atuais, [linha.alunoId]: evento.target.checked }))
          }
        />
      ),
    },
    { key: 'nome', cabecalho: 'Nome', render: (linha) => linha.nome },
    {
      key: 'cargaHoraria',
      cabecalho: 'Carga horária atingida (disciplina)',
      render: (linha) =>
        cargaHorariaTotalDisciplina ? (
          <ColunaCargaHoraria>
            <span>
              {formatarCargaHoraria(linha.cargaHorariaAtingida)} de {formatarCargaHoraria(cargaHorariaTotalDisciplina)}
            </span>
            <TrilhaCargaHoraria>
              <PreenchimentoCargaHoraria
                $percentual={(linha.cargaHorariaAtingida / cargaHorariaTotalDisciplina) * 100}
              />
            </TrilhaCargaHoraria>
          </ColunaCargaHoraria>
        ) : (
          formatarCargaHoraria(linha.cargaHorariaAtingida)
        ),
    },
  ]

  if (requisicaoTurma.error) {
    return (
      <Layout>
        <Header titulo="Registrar aula" voltarPara={`/professor/turmas/${idTurma}`} />
        <ErroCarregamento mensagem={requisicaoTurma.error} onRetry={requisicaoTurma.reload} />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo={requisicaoTurma.data?.titulo ?? 'Turma'}
        voltarPara={`/professor/turmas/${idTurma}`}
        rotuloVoltar="Turma"
        filtros={
          <CamposCabecalho>
            <CampoLargura $largura="320px">
              <Select
                label="Disciplina"
                options={disciplinasDaTurma}
                value={disciplinaAtiva}
                loading={requisicaoVinculos.loading}
                emptyText="Você não leciona disciplinas nesta turma"
                onChange={setTurmaDisciplinaId}
              />
            </CampoLargura>

            <CampoLargura $largura="360px">
              <Select
                label="Aula do plano de aula"
                options={opcoesAulasPlano}
                value={aulaAlvo?.id ?? null}
                clearable
                loading={requisicaoAulasPlano.loading}
                disabled={!disciplinaAtiva}
                emptyText="Este plano de aula ainda não tem aulas cadastradas"
                onChange={setAulaSelecionadaManualId}
              />
            </CampoLargura>

            <BotaoSalvar>
              <Button
                size="large"
                variant="success"
                icon={<Save />}
                loading={salvando}
                disabled={!planoAtual}
                onClick={salvar}
              >
                Salvar
              </Button>
            </BotaoSalvar>
          </CamposCabecalho>
        }
      />

      <Tab<Aba>
        rotuloAcessivel="Seções do registro de aula"
        value={aba}
        onChange={setAba}
        options={[
          { value: 'conteudo', label: 'Registrar conteúdo' },
          {
            value: 'chamada',
            label: 'Realizar chamada',
            disabled: !chamadaLiberada,
          },
        ]}
      />

      {aba === 'chamada' && (
        <Stack gap="md">
          <BotoesFlutuantes>
            <Button
              variant="subtle"
              size="small"
              icon={<CheckCheck />}
              onClick={() =>
                setEdicoesChamada(Object.fromEntries(linhasChamada.map((linha) => [linha.alunoId, true])))
              }
            >
              Marcar todos presentes
            </Button>
            <Button
              variant="subtle"
              size="small"
              icon={<UserX />}
              onClick={() =>
                setEdicoesChamada(Object.fromEntries(linhasChamada.map((linha) => [linha.alunoId, false])))
              }
            >
              Marcar todos ausentes
            </Button>
          </BotoesFlutuantes>

          <DataTable
            descricao="Chamada da aula"
            columns={colunasChamada}
            data={linhasChamada}
            rowKey={(linha) => linha.alunoId}
            loading={requisicaoMatriculas.loading}
            error={requisicaoMatriculas.error}
            onReload={requisicaoMatriculas.reload}
            empty={{
              titulo: 'Nenhum aluno com matrícula ativa',
              descricao: 'A secretaria precisa matricular alunos nesta turma antes da chamada.',
              icon: <Users />,
            }}
          />
        </Stack>
      )}

      {aba === 'conteudo' && (
        <Card titulo="Conteúdos trabalhados nesta aula">
          <Stack gap="md">
            <Input
              label="Título da aula"
              placeholder="Ex.: Aula 5 — Introdução a laços de repetição"
              value={titulo}
              disabled={!planoAtual}
              maxLength={150}
              onChange={(evento) => setTitulo(evento.target.value)}
            />

            <GradeAutoAjuste $larguraMinima="180px">
              {semHorarioCadastrado ? (
                <TimePicker
                  label="Carga horária"
                  value={cargaHorariaManual}
                  disabled={!planoAtual}
                  hint="Esta turma ainda não tem horário cadastrado (Turmas, aba Horários) — digite a duração desta aula."
                  onChange={(evento) => setCargaHorariaManual(evento.target.value)}
                />
              ) : (
                <Select<number>
                  label="Horário"
                  options={opcoesHorarios}
                  value={horarioTurmaId}
                  loading={requisicaoHorarios.loading}
                  disabled={!planoAtual}
                  hint="A carga horária vem do horário escolhido."
                  placeholder="Selecionar horário..."
                  onChange={setHorarioTurmaId}
                />
              )}
              <DatePicker
                label="Data prevista"
                value={dataPrevista}
                disabled={!planoAtual}
                onChange={(evento) => setDataPrevista(evento.target.value)}
              />
              <DatePicker
                label="Data publicação"
                value={dataPublicacao}
                disabled={!aulaAlvo}
                hint="Data em que a aula foi (ou será) realizada."
                onChange={(evento) => setDataPublicacao(evento.target.value)}
              />
            </GradeAutoAjuste>

            <VinculoConteudoAula
              aulaId={aulaAlvo?.id}
              planoEnsinoId={planoAtual?.planoEnsino?.id}
              conteudoPlanoIdsPendentes={conteudoPlanoIdsPendentes}
              onChangePendentes={setConteudoPlanoIdsPendentes}
            />

            <TextArea
              label="Observações"
              placeholder="Materiais necessários, combinados com a turma, adaptações..."
              value={observacoes}
              disabled={!planoAtual}
              maxLength={2000}
              rows={4}
              autoAltura
              onChange={(evento) => setObservacoes(evento.target.value)}
            />
          </Stack>
        </Card>
      )}
    </Layout>
  )
}
