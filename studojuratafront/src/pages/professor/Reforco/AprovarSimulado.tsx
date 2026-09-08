import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Check, ClipboardCheck, Pencil, Save, Sparkles, X } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Chip } from '../../../components/ui/Chip'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Header, SubtituloItem } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { QuestaoEditor } from '../../../components/ui/QuestaoEditor'
import { validarQuestao, type ErrosQuestao, type QuestaoEditavel } from '../../../components/ui/QuestaoEditor/types'
import { Select } from '../../../components/ui/Select'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { Tab } from '../../../components/ui/Tab'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useHidratar } from '../../../hooks/useHidratar'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import {
  alternativas as servicoAlternativas,
  alunos as servicoAlunos,
  disciplinas as servicoDisciplinas,
  ia as servicoIa,
  planosEnsino,
  questoes as servicoQuestoes,
  simuladoQuestoes,
  simulados as servicoSimulados,
  turmas as servicoTurmas,
} from '../../../services/endpoints'
import { formatarData, paraInputDataHora } from '../../../utils/format'
import { OPCOES_DESTINACAO, ROTULO_MOTIVO_RECOMENDACAO } from '../../../utils/labels'

const Navegador = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};

  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.base};
`

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

type Aba = 'configuracao' | 'questoes'

/**
 * Aprovação de um simulado gerado pela IA — duas abas:
 * - Configuração: os mesmos campos de um simulado normal (SimuladoFormulario),
 *   pra revisar/completar antes de lançar (confirmado pelo usuário) — em
 *   especial "Disponível a partir de", que registra a data de lançamento e é
 *   sugerida a partir do prazo de revisão (SimuladoGeradoIA.prazoLancamento)
 *   quando o simulado ainda não tem uma definida.
 * - Questões: aprovação em lote das questões pendentes, uma de cada vez —
 *   reaproveita o mesmo QuestaoEditor usado em criar/editar simulado.
 *
 * Aluno-alvo e motivo da geração não são campos editáveis aqui — vêm do
 * vínculo criado na geração (GeracaoSimuladoIAService) e são só informativos.
 */
export default function AprovarSimulado() {
  const { simuladoId } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const idSimulado = Number(simuladoId)

  const [aba, setAba] = useState<Aba>('configuracao')

  const [questoes, setQuestoes] = useState<QuestaoEditavel[]>([])
  const [questaoAtiva, setQuestaoAtiva] = useState(0)
  const [editando, setEditando] = useState(false)
  const [erros, setErros] = useState<ErrosQuestao>({})
  const [processando, setProcessando] = useState(false)
  const [processandoLote, setProcessandoLote] = useState(false)

  // --- Configuração do simulado ---------------------------------------------
  const [titulo, setTitulo] = useState('')
  const [disciplinaId, setDisciplinaId] = useState<number | null>(null)
  const [turmaId, setTurmaId] = useState<number | null>(null)
  const [planoEnsinoId, setPlanoEnsinoId] = useState<number | null>(null)
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [tempoLimite, setTempoLimite] = useState('')
  const [notaMaxima, setNotaMaxima] = useState('10')

  const requisicaoSimulado = useRequisicao(() => servicoSimulados.buscar(idSimulado), [idSimulado])
  const requisicaoVinculos = useRequisicao(() => simuladoQuestoes.listar(), [])
  const requisicaoTodasQuestoes = useRequisicao(() => servicoQuestoes.listar(), [])
  const requisicaoAlternativas = useRequisicao(() => servicoAlternativas.listar(), [])

  const requisicaoDisciplinas = useRequisicao(() => servicoDisciplinas.listar(), [])
  const requisicaoTurmas = useRequisicao(() => servicoTurmas.listar(), [])
  const requisicaoPlanos = useRequisicao(() => planosEnsino.listar(), [])
  const requisicaoVinculosIA = useRequisicao(() => servicoIa.listarSimuladosGerados(), [])
  const requisicaoAlunos = useRequisicao(() => servicoAlunos.listar(), [])

  // Vínculo aluno/conteúdo/motivo/prazo criado na geração automática — só
  // existe pra simulados de reforço via IA (ver SimuladoGeradoIA no back).
  const vinculoIA = useMemo(
    () => (requisicaoVinculosIA.data ?? []).find((item) => item.simuladoId === idSimulado) ?? null,
    [requisicaoVinculosIA.data, idSimulado],
  )

  const alunoAlvo = useMemo(
    () => (vinculoIA ? (requisicaoAlunos.data ?? []).find((aluno) => aluno.id === vinculoIA.alunoId) : null),
    [vinculoIA, requisicaoAlunos.data],
  )

  const prontoParaHidratar =
    requisicaoVinculos.data && requisicaoTodasQuestoes.data && requisicaoAlternativas.data ? idSimulado : null

  useHidratar(prontoParaHidratar, () => {
    const idsDoSimulado = new Set(
      (requisicaoVinculos.data ?? [])
        .filter((vinculo) => vinculo.simuladoId === idSimulado)
        .map((vinculo) => vinculo.questaoId),
    )

    const pendentes = (requisicaoTodasQuestoes.data ?? [])
      .filter((questao) => idsDoSimulado.has(questao.id) && questao.status === 'PENDENTE')
      .sort((a, b) => a.id - b.id)
      .map((questao): QuestaoEditavel => ({
        id: questao.id,
        enunciado: questao.enunciado,
        tipo: questao.tipo,
        disciplinaId: questao.disciplinaId ?? null,
        nivelDificuldade: questao.nivelDificuldade ?? null,
        status: questao.status,
        alternativas: (requisicaoAlternativas.data ?? [])
          .filter((alternativa) => alternativa.questaoId === questao.id)
          .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
          .map((alternativa) => ({
            id: alternativa.id,
            texto: alternativa.texto,
            correta: Boolean(alternativa.correta),
          })),
      }))

    setQuestoes(pendentes)
  })

  useHidratar(requisicaoSimulado.data, (simulado) => {
    setTitulo(simulado.titulo)
    setDisciplinaId(simulado.disciplinaId ?? null)
    setTurmaId(simulado.turmaId ?? null)
    setPlanoEnsinoId(simulado.planoEnsinoId ?? null)
    setDataInicio(paraInputDataHora(simulado.dataInicio))
    setDataFim(paraInputDataHora(simulado.dataFim))
    setTempoLimite(simulado.tempoLimite?.toString() ?? '')
    setNotaMaxima(simulado.notaMaxima?.toString() ?? '10')
  })

  // Sugere a "Disponível a partir de" pelo prazo de revisão (prazoLancamento)
  // quando o simulado ainda não tem uma data própria — só preenche, nunca
  // sobrescreve o que já foi definido (nem o que o professor já digitou).
  useEffect(() => {
    if (!vinculoIA) return
    setDataInicio((atual) => atual || `${vinculoIA.prazoLancamento}T08:00`)
  }, [vinculoIA])

  const questaoAtual = questoes[questaoAtiva] ?? null

  const opcoesDisciplinas = useMemo(
    () =>
      (requisicaoDisciplinas.data ?? []).map((disciplina) => ({
        value: disciplina.id,
        label: disciplina.titulo ?? `Disciplina ${disciplina.id}`,
      })),
    [requisicaoDisciplinas.data],
  )

  const opcoesTurmas = useMemo(
    () =>
      (requisicaoTurmas.data ?? [])
        .filter((turma) => turma.status !== 'INATIVA')
        .map((turma) => ({ value: turma.id, label: turma.titulo ?? `Turma ${turma.id}` })),
    [requisicaoTurmas.data],
  )

  const opcoesPlanos = useMemo(
    () =>
      (requisicaoPlanos.data ?? []).map((plano) => ({
        value: plano.id,
        label: plano.titulo ?? `Plano #${plano.id}`,
        descricao: plano.curso?.nome,
      })),
    [requisicaoPlanos.data],
  )

  async function salvarEdicao() {
    if (!questaoAtual?.id) return

    const encontrados = validarQuestao(questaoAtual)
    setErros(encontrados)

    if (Object.keys(encontrados).length > 0) {
      toast.warning('Revise a questão', 'Há campos obrigatórios pendentes.')
      return
    }

    setProcessando(true)

    try {
      await servicoQuestoes.atualizar(questaoAtual.id, {
        enunciado: questaoAtual.enunciado.trim(),
        tipo: questaoAtual.tipo,
        disciplinaId: questaoAtual.disciplinaId,
        nivelDificuldade: questaoAtual.nivelDificuldade,
        origem: 'PROFESSOR',
      })

      for (const [posicao, alternativa] of questaoAtual.alternativas.entries()) {
        if (!alternativa.texto.trim()) continue

        const corpo = {
          questaoId: questaoAtual.id,
          texto: alternativa.texto.trim(),
          correta: alternativa.correta,
          ordem: posicao + 1,
        }

        if (alternativa.id) {
          await servicoAlternativas.atualizar(alternativa.id, corpo)
        } else {
          await servicoAlternativas.criar(corpo)
        }
      }

      toast.success('Questão atualizada')
      setEditando(false)
      await requisicaoAlternativas.reload()
    } catch (erroSalvar) {
      toast.error('Não foi possível salvar', erroSalvar instanceof ApiError ? erroSalvar.message : undefined)
    } finally {
      setProcessando(false)
    }
  }

  function removerDaLista(questaoId: number) {
    setQuestoes((atuais) => atuais.filter((item) => item.id !== questaoId))
    setQuestaoAtiva((atual) => Math.max(0, Math.min(atual, questoes.length - 2)))
  }

  async function aprovarQuestao() {
    if (!questaoAtual?.id) return
    setProcessando(true)

    try {
      await servicoQuestoes.aprovar(questaoAtual.id)
      toast.success('Questão aprovada')
      removerDaLista(questaoAtual.id)
    } catch (erro) {
      toast.error('Não foi possível aprovar', erro instanceof ApiError ? erro.message : undefined)
    } finally {
      setProcessando(false)
    }
  }

  async function reprovarQuestao() {
    if (!questaoAtual?.id) return

    await confirmar({
      titulo: 'Reprovar questão?',
      descricao: 'A questão fica marcada como rejeitada e não entra em nenhum simulado.',
      rotuloConfirmar: 'Reprovar',
      tone: 'danger',
      aoConfirmar: async () => {
        setProcessando(true)

        try {
          await servicoQuestoes.rejeitar(questaoAtual.id as number)
          toast.success('Questão rejeitada')
          removerDaLista(questaoAtual.id as number)
        } catch (erro) {
          toast.error('Não foi possível reprovar', erro instanceof ApiError ? erro.message : undefined)
        } finally {
          setProcessando(false)
        }
      },
    })
  }

  async function aprovarSimulado() {
    await confirmar({
      titulo: 'Aprovar todas as questões?',
      descricao: `${questoes.length} questão(ões) pendente(s) serão aprovadas de uma vez.`,
      rotuloConfirmar: 'Aprovar tudo',
      aoConfirmar: async () => {
        setProcessandoLote(true)
        try {
          await Promise.all(questoes.map((questao) => servicoQuestoes.aprovar(questao.id as number)))
          toast.success('Simulado aprovado', 'Todas as questões pendentes foram aprovadas.')
          navegar('/professor/reforco/aprovacao')
        } catch (erro) {
          toast.error('Não foi possível aprovar tudo', erro instanceof ApiError ? erro.message : undefined)
        } finally {
          setProcessandoLote(false)
        }
      },
    })
  }

  async function reprovarSimulado() {
    await confirmar({
      titulo: 'Reprovar todas as questões?',
      descricao: `${questoes.length} questão(ões) pendente(s) serão rejeitadas de uma vez.`,
      rotuloConfirmar: 'Reprovar tudo',
      tone: 'danger',
      aoConfirmar: async () => {
        setProcessandoLote(true)
        try {
          await Promise.all(questoes.map((questao) => servicoQuestoes.rejeitar(questao.id as number)))
          toast.success('Questões rejeitadas')
          navegar('/professor/reforco/aprovacao')
        } catch (erro) {
          toast.error('Não foi possível reprovar tudo', erro instanceof ApiError ? erro.message : undefined)
        } finally {
          setProcessandoLote(false)
        }
      },
    })
  }

  if (requisicaoSimulado.error) {
    return (
      <Layout>
        <Header titulo="Simulado" voltarPara="/professor/reforco/aprovacao" />
        <ErroCarregamento mensagem={requisicaoSimulado.error} onRetry={requisicaoSimulado.reload} />
      </Layout>
    )
  }

  const carregando =
    requisicaoSimulado.loading ||
    requisicaoVinculos.loading ||
    requisicaoTodasQuestoes.loading ||
    requisicaoAlternativas.loading

  return (
    <Layout>
      <Header
        titulo={requisicaoSimulado.data?.titulo ?? 'Simulado'}
        subtitulo={
          <>
            <SubtituloItem icon={<ClipboardCheck />}>Questões: {questoes.length} montada(s)</SubtituloItem>
            {vinculoIA && (
              <>
                <SubtituloItem icon={<Sparkles />}>Gerado pela IA</SubtituloItem>
                <SubtituloItem icon={<Sparkles />}>
                  Motivo: {vinculoIA.motivos.map((motivo) => ROTULO_MOTIVO_RECOMENDACAO[motivo]).join(', ') || '—'}
                </SubtituloItem>
                <SubtituloItem icon={<Sparkles />}>
                  Prazo de revisão: {formatarData(vinculoIA.prazoLancamento)}
                </SubtituloItem>
              </>
            )}
          </>
        }
        voltarPara="/professor/reforco/aprovacao"
        rotuloVoltar="Simulados aguardando aprovação"
        actions={
          <>
            <Button
              size="large"
              variant="danger"
              icon={<X />}
              disabled={questoes.length === 0 || processandoLote}
              onClick={reprovarSimulado}
            >
              Reprovar simulado
            </Button>
            <Button
              size="large"
              variant="success"
              icon={<Check />}
              disabled={questoes.length === 0 || processandoLote}
              loading={processandoLote}
              onClick={aprovarSimulado}
            >
              Aprovar simulado
            </Button>
          </>
        }
      />

      <Tab<Aba>
        rotuloAcessivel="Seções do simulado"
        value={aba}
        onChange={setAba}
        options={[
          { value: 'configuracao', label: 'Configuração do simulado' },
          { value: 'questoes', label: 'Questões', contador: questoes.length },
        ]}
      />

      {carregando ? (
        <SkeletonCartao />
      ) : aba === 'configuracao' ? (
        <Card titulo="Configuração do simulado">
          <Coluna>
            <Grade>
              <Input
                label="Título"
                required
                placeholder="Ex.: Reforço de frações"
                value={titulo}
                maxLength={150}
                onChange={(evento) => setTitulo(evento.target.value)}
              />

              <Select<number>
                label="Disciplina"
                options={opcoesDisciplinas}
                value={disciplinaId}
                loading={requisicaoDisciplinas.loading}
                searchable
                clearable
                placeholder="Selecionar disciplina..."
                onChange={setDisciplinaId}
              />

              <Select<number>
                label="Turma"
                options={opcoesTurmas}
                value={turmaId}
                loading={requisicaoTurmas.loading}
                searchable
                clearable
                placeholder="Selecionar turma..."
                onChange={setTurmaId}
              />

              <Select<number>
                label="Plano de ensino"
                options={opcoesPlanos}
                value={planoEnsinoId}
                loading={requisicaoPlanos.loading}
                searchable
                clearable
                placeholder="Selecionar plano..."
                hint="Opcional."
                onChange={setPlanoEnsinoId}
              />

              {/* Destinação e aluno-alvo não são editáveis aqui — um simulado
                  de reforço automático nasce ESPECIFICO pra um único aluno já
                  determinado pela recomendação que o gerou (ver SubtituloItem
                  "Gerado pela IA" no cabeçalho); mudar isso não faz sentido
                  pra esse tipo de simulado. */}
              <Select
                label="Destinação"
                options={OPCOES_DESTINACAO.map((opcao) => ({ value: opcao.value, label: opcao.label }))}
                value={requisicaoSimulado.data?.tipoDestinacao ?? null}
                disabled
                onChange={() => {}}
              />

              <DatePicker
                label="Disponível a partir de"
                modo="dataHora"
                value={dataInicio}
                hint="Sugerida a partir do prazo de revisão — ajuste se necessário."
                onChange={(evento) => setDataInicio(evento.target.value)}
              />

              <DatePicker
                label="Disponível até"
                modo="dataHora"
                value={dataFim}
                onChange={(evento) => setDataFim(evento.target.value)}
              />

              <Input
                label="Tempo limite"
                type="number"
                min={1}
                placeholder="Ex.: 30"
                value={tempoLimite}
                hint="Em minutos. Deixe vazio para sem limite."
                onChange={(evento) => setTempoLimite(evento.target.value)}
              />

              <Input
                label="Nota máxima"
                type="number"
                min={1}
                step="0.5"
                value={notaMaxima}
                hint="Distribuída igualmente entre as questões."
                onChange={(evento) => setNotaMaxima(evento.target.value)}
              />
            </Grade>

            {vinculoIA && (
              <Coluna>
                <Chip variant="neutral" disabled>
                  {alunoAlvo?.pessoa?.nome ?? `Aluno ${vinculoIA.alunoId}`}
                </Chip>
              </Coluna>
            )}
          </Coluna>
        </Card>
      ) : questoes.length === 0 ? (
        <EstadoVazio
          titulo="Nada para aprovar"
          descricao="Todas as questões deste simulado já foram revisadas."
          icon={<ClipboardCheck />}
        />
      ) : (
        questaoAtual && (
          <>
            <QuestaoEditor
              questao={questaoAtual}
              indice={questaoAtiva}
              total={questoes.length}
              somenteLeitura={!editando}
              erros={erros}
              onChange={(atualizada) =>
                setQuestoes((atuais) => atuais.map((item, i) => (i === questaoAtiva ? atualizada : item)))
              }
              actions={
                editando ? (
                  <>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => {
                        setEditando(false)
                        setErros({})
                      }}
                      disabled={processando}
                    >
                      Cancelar edição
                    </Button>
                    <Button
                      variant="success"
                      size="small"
                      icon={<Save />}
                      loading={processando}
                      onClick={salvarEdicao}
                    >
                      Salvar alterações
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      size="small"
                      icon={<Pencil />}
                      onClick={() => setEditando(true)}
                      disabled={processando}
                    >
                      Editar questão
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      icon={<X />}
                      onClick={reprovarQuestao}
                      disabled={processando}
                    >
                      Reprovar questão
                    </Button>
                    <Button
                      variant="success"
                      size="small"
                      icon={<Check />}
                      loading={processando}
                      onClick={aprovarQuestao}
                    >
                      Aprovar questão
                    </Button>
                  </>
                )
              }
            />

            <Navegador role="group" aria-label="Navegação entre questões">
              {questoes.map((_, indice) => (
                <StatusBadge
                  key={indice}
                  shape="square"
                  color={indice === questaoAtiva ? 'purple' : 'gray'}
                  selected={indice === questaoAtiva}
                  ariaLabel={`Ir para a questão ${indice + 1}`}
                  onClick={() => {
                    setQuestaoAtiva(indice)
                    setEditando(false)
                    setErros({})
                  }}
                >
                  {indice + 1}
                </StatusBadge>
              ))}
            </Navegador>
          </>
        )
      )}
    </Layout>
  )
}
