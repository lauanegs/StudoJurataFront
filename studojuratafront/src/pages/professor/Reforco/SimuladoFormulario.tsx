import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { ClipboardCheck, FolderInput, Lock, Plus, Rocket, Save, Sparkles, Users } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { CheckBox } from '../../../components/ui/CheckBox'
import { Chip } from '../../../components/ui/Chip'
import { DataTable } from '../../../components/ui/DataTable'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Header, SubtituloItem } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { QuestaoEditor } from '../../../components/simulados/QuestaoEditor'
import { VinculoConteudoQuestao } from '../../../components/planejamento/VinculoConteudo'
import * as SVinculo from '../../../components/planejamento/VinculoConteudo/styles'
import {
  questaoVazia,
  validarQuestao,
  type ErrosQuestao,
  type QuestaoEditavel,
} from '../../../components/simulados/QuestaoEditor/types'
import { Select } from '../../../components/ui/Select'
import { StatusBadge } from '../../../components/simulados/StatusBadge'
import { Tab } from '../../../components/ui/Tab'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useHidratar } from '../../../hooks/useHidratar'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { disciplinas as servicoDisciplinas } from '../../../services/curriculo'
import { planosEnsino } from '../../../services/planejamento'
import {
  alternativas as servicoAlternativas,
  questoes as servicoQuestoes,
  simuladoQuestoes,
  simulados as servicoSimulados,
} from '../../../services/simulados'
import { matriculas, turmas as servicoTurmas } from '../../../services/turmas'
import { deInputDataHora, paraInputDataHora } from '../../../utils/format'
import { OPCOES_DESTINACAO, ROTULO_TIPO_QUESTAO } from '../../../utils/labels'
import type { QuestaoResponse, SimuladoResponse, TipoDestinacaoSimulado } from '../../../types/simulados'
import type { Coluna } from '../../../components/ui/DataTable/types'
import { Stack } from '../../../components/ui/Stack'
import { GradeAutoAjuste } from '../../../components/ui/GradeAutoAjuste'
import { dataFimSimuladoValida, MENSAGEM_DATA_FIM_SIMULADO, useFormularioSimulado } from '../../../formularios/simulados'

/** Regra de negócio: um simulado nunca pode ter mais que 10 questões (ver SimuladoQuestaoService no back). */
const MAXIMO_QUESTOES = 10

const ListaAlunos = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  max-height: 320px;
  overflow-y: auto;
  padding-bottom: ${({ theme }) => theme.spacing.xs};
`


/**
 * Criação e edição de simulado.
 *
 * O back modela isso em três entidades: Simulado, Questao (+ Alternativa) e
 * SimuladoQuestao. A tela junta tudo em um fluxo só e, ao salvar, executa a
 * sequência: cria/atualiza o Simulado → cria cada Questao com suas
 * Alternativas → liga tudo via SimuladoQuestao.
 *
 * Edição só é permitida enquanto o simulado está em RASCUNHO — depois de
 * lançado existem tentativas de alunos apontando para as questões.
 */
type Aba = 'configuracao' | 'questoes'

export default function SimuladoFormulario() {
  const { id } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const [aba, setAba] = useState<Aba>('configuracao')

  const edicao = Boolean(id)
  const simuladoId = id ? Number(id) : null

  const form = useFormularioSimulado()
  const { titulo, disciplinaId, turmaId, planoEnsinoId, tipoDestinacao, dataInicio, dataFim, tempoLimite, notaMaxima } = form.values
  const erros = form.errors as Record<string, string | undefined>

  const [questoes, setQuestoes] = useState<QuestaoEditavel[]>([questaoVazia()])
  const [questaoAtiva, setQuestaoAtiva] = useState(0)
  const [errosQuestoes, setErrosQuestoes] = useState<Record<number, ErrosQuestao>>({})

  const [modalAlunos, setModalAlunos] = useState(false)
  const [alunosSelecionados, setAlunosSelecionados] = useState<number[]>([])

  // Cada questão marcada vira uma questão nova, sem substituir a ativa.
  const [modalImportar, setModalImportar] = useState(false)
  const [disciplinaBancoId, setDisciplinaBancoId] = useState<number | null>(null)
  // Filtro aplicado: só muda ao clicar "Buscar".
  const [disciplinaBancoIdAplicada, setDisciplinaBancoIdAplicada] = useState<number | null>(null)
  const [filtroBancoAplicado, setFiltroBancoAplicado] = useState(false)
  const [questoesBancoSelecionadas, setQuestoesBancoSelecionadas] = useState<Set<number>>(new Set())

  const [modalImportarSimulado, setModalImportarSimulado] = useState(false)
  const [turmaImportarId, setTurmaImportarId] = useState<number | null>(null)
  const [disciplinaImportarId, setDisciplinaImportarId] = useState<number | null>(null)
  // Filtros aplicados: só mudam ao clicar "Buscar".
  const [turmaImportarIdAplicada, setTurmaImportarIdAplicada] = useState<number | null>(null)
  const [disciplinaImportarIdAplicada, setDisciplinaImportarIdAplicada] = useState<number | null>(null)
  const [filtroImportarAplicado, setFiltroImportarAplicado] = useState(false)
  const [simuladoOrigemId, setSimuladoOrigemId] = useState<number | null>(null)
  const [importandoSimulado, setImportandoSimulado] = useState(false)

  const [salvando, setSalvando] = useState(false)
  const [lancando, setLancando] = useState(false)

  const requisicaoSimulado = useRequisicao(
    () => servicoSimulados.buscar(simuladoId as number),
    [simuladoId],
    { ativo: Boolean(simuladoId) },
  )
  const requisicaoDisciplinas = useRequisicao(() => servicoDisciplinas.listar(), [])
  const requisicaoTurmas = useRequisicao(() => servicoTurmas.listar(), [])
  const requisicaoPlanos = useRequisicao(() => planosEnsino.listar(), [])
  const requisicaoAlunos = useRequisicao(
    () => matriculas.ativosPorTurma(turmaId as number),
    [turmaId],
    { ativo: Boolean(turmaId) },
  )

  // Na edição, o banco de questões resolve o conteúdo das questões já vinculadas.
  const requisicaoBancoQuestoes = useRequisicao(() => servicoQuestoes.listar(), [], {
    ativo: modalImportar || modalImportarSimulado || edicao,
  })
  const requisicaoBancoAlternativas = useRequisicao(() => servicoAlternativas.listar(), [], {
    ativo: modalImportar || modalImportarSimulado || edicao,
  })
  const requisicaoSimuladosOrigem = useRequisicao(() => servicoSimulados.listar(), [], {
    ativo: modalImportarSimulado,
  })
  const requisicaoSimuladoQuestoesOrigem = useRequisicao(() => simuladoQuestoes.listar(), [], {
    ativo: modalImportarSimulado,
  })

  const requisicaoVinculosSimulado = useRequisicao(() => simuladoQuestoes.listar(), [], { ativo: edicao })

  // Com questão ATIVA ainda PENDENTE, o simulado só pode ser mexido na tela de
  // aprovação; cobre também o acesso direto pela URL.
  const carregandoTravaAprovacao =
    edicao && (requisicaoVinculosSimulado.loading || requisicaoBancoQuestoes.loading)

  const temQuestaoPendente = useMemo(() => {
    if (!edicao || !requisicaoVinculosSimulado.data || !requisicaoBancoQuestoes.data) return false

    const bancoQuestoesPorId = new Map(requisicaoBancoQuestoes.data.map((questao) => [questao.id, questao]))

    return requisicaoVinculosSimulado.data
      .filter((vinculo) => vinculo.simuladoId === simuladoId && vinculo.status !== 'REMOVIDA')
      .some((vinculo) => bancoQuestoesPorId.get(vinculo.questaoId)?.status === 'PENDENTE')
  }, [edicao, requisicaoVinculosSimulado.data, requisicaoBancoQuestoes.data, simuladoId])

  useEffect(() => {
    if (temQuestaoPendente) {
      navegar(`/professor/reforco/aprovacao/${simuladoId}`, { replace: true })
    }
  }, [temQuestaoPendente, simuladoId, navegar])

  const opcoesTurmasImportar = useMemo(
    () =>
      (requisicaoTurmas.data ?? [])
        .filter((turma) => turma.status !== 'INATIVA')
        .map((turma) => ({ value: turma.id, label: turma.titulo ?? `Turma ${turma.id}` })),
    [requisicaoTurmas.data],
  )

  const simuladosParaImportar = useMemo(() => {
    if (!filtroImportarAplicado) return []

    return (requisicaoSimuladosOrigem.data ?? []).filter(
      (item) =>
        item.id !== simuladoId &&
        (!turmaImportarIdAplicada || item.turmaId === turmaImportarIdAplicada) &&
        (!disciplinaImportarIdAplicada || item.disciplinaId === disciplinaImportarIdAplicada),
    )
  }, [
    requisicaoSimuladosOrigem.data,
    filtroImportarAplicado,
    turmaImportarIdAplicada,
    disciplinaImportarIdAplicada,
    simuladoId,
  ])

  async function importarSimulado() {
    if (!simuladoOrigemId) return

    setImportandoSimulado(true)

    try {
      const vinculos = (requisicaoSimuladoQuestoesOrigem.data ?? []).filter(
        (vinculo) => vinculo.simuladoId === simuladoOrigemId,
      )
      const bancoQuestoes = requisicaoBancoQuestoes.data ?? []
      const bancoAlternativas = requisicaoBancoAlternativas.data ?? []

      const importadas: QuestaoEditavel[] = vinculos
        .map((vinculo) => bancoQuestoes.find((item) => item.id === vinculo.questaoId))
        .filter((item): item is QuestaoResponse => Boolean(item))
        .map((original) => {
          const alternativasDaQuestao = bancoAlternativas
            .filter((alternativa) => alternativa.questaoId === original.id)
            .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
            .map((alternativa) => ({ texto: alternativa.texto, correta: Boolean(alternativa.correta) }))

          return {
            enunciado: original.enunciado,
            tipo: original.tipo,
            disciplinaId: original.disciplinaId ?? disciplinaId,
            nivelDificuldade: original.nivelDificuldade ?? 'MEDIA',
            alternativas: alternativasDaQuestao.length >= 2 ? alternativasDaQuestao : questaoVazia().alternativas,
          }
        })

      if (importadas.length === 0) {
        toast.warning('Nenhuma questão encontrada', 'Esse simulado não tem questões para importar.')
        return
      }

      // Simulados antigos podem ter mais questões que o limite atual.
      const cortadas = Math.max(0, importadas.length - MAXIMO_QUESTOES)
      const importadasFinal = importadas.slice(0, MAXIMO_QUESTOES)

      setQuestoes(importadasFinal)
      setQuestaoAtiva(0)
      setErrosQuestoes({})
      setModalImportarSimulado(false)
      setSimuladoOrigemId(null)
      toast.success(
        'Simulado importado',
        cortadas > 0
          ? `${importadasFinal.length} questão(ões) copiada(s) — ${cortadas} não coube(ram) (limite de ${MAXIMO_QUESTOES}). Revise antes de salvar.`
          : `${importadasFinal.length} questão(ões) copiada(s). Revise antes de salvar.`,
      )
    } finally {
      setImportandoSimulado(false)
    }
  }

  const idsJaNoSimulado = useMemo(
    () => new Set(questoes.map((item) => item.id).filter((id): id is number => Boolean(id))),
    [questoes],
  )

  const opcoesBancoQuestoes = useMemo(() => {
    if (!filtroBancoAplicado) return []

    return (requisicaoBancoQuestoes.data ?? []).filter(
      (item) =>
        item.status !== 'REJEITADA' &&
        !idsJaNoSimulado.has(item.id) &&
        (!disciplinaBancoIdAplicada || item.disciplinaId === disciplinaBancoIdAplicada),
    )
  }, [requisicaoBancoQuestoes.data, idsJaNoSimulado, filtroBancoAplicado, disciplinaBancoIdAplicada])

  const colunasBancoQuestoes: Coluna<QuestaoResponse>[] = [
    {
      key: 'selecionar',
      cabecalho: 'Selecionar',
      largura: '96px',
      render: (item) => (
        <CheckBox
          checked={questoesBancoSelecionadas.has(item.id)}
          onChange={() => alternarQuestaoBancoSelecionada(item.id)}
          aria-label={`Selecionar questão: ${item.enunciado}`}
        />
      ),
    },
    { key: 'enunciado', cabecalho: 'Enunciado', render: (item) => item.enunciado },
    { key: 'tipo', cabecalho: 'Tipo', render: (item) => ROTULO_TIPO_QUESTAO[item.tipo] },
  ]

  const colunasSimuladosImportar: Coluna<SimuladoResponse>[] = [
    {
      key: 'selecionar',
      cabecalho: 'Selecionar',
      largura: '96px',
      render: (item) => (
        <CheckBox
          checked={simuladoOrigemId === item.id}
          onChange={() => setSimuladoOrigemId((atual) => (atual === item.id ? null : item.id))}
          aria-label={`Selecionar simulado: ${item.titulo}`}
        />
      ),
    },
    { key: 'titulo', cabecalho: 'Título', render: (item) => item.titulo },
    {
      key: 'disciplina',
      cabecalho: 'Disciplina',
      render: (item) =>
        (requisicaoDisciplinas.data ?? []).find((d) => d.id === item.disciplinaId)?.titulo ?? 'Sem disciplina',
    },
  ]

  useHidratar(requisicaoSimulado.data, (simulado) => {
    form.setFieldValue('titulo', simulado.titulo)
    form.setFieldValue('disciplinaId', simulado.disciplinaId ?? null)
    form.setFieldValue('turmaId', simulado.turmaId ?? null)
    form.setFieldValue('planoEnsinoId', simulado.planoEnsinoId ?? null)
    form.setFieldValue('tipoDestinacao', simulado.tipoDestinacao)
    form.setFieldValue('dataInicio', paraInputDataHora(simulado.dataInicio))
    form.setFieldValue('dataFim', paraInputDataHora(simulado.dataFim))
    form.setFieldValue('tempoLimite', simulado.tempoLimite?.toString() ?? '')
    form.setFieldValue('notaMaxima', simulado.notaMaxima?.toString() ?? '10')
  })

  // Questões já salvas do simulado. As 3 requisições viram uma referência
  // estável porque useHidratar aplica por referência e precisa das 3 prontas.
  const dadosParaHidratarQuestoes = useMemo(() => {
    if (!edicao) return null
    if (!requisicaoVinculosSimulado.data || !requisicaoBancoQuestoes.data || !requisicaoBancoAlternativas.data) {
      return null
    }
    return {
      vinculos: requisicaoVinculosSimulado.data,
      bancoQuestoes: requisicaoBancoQuestoes.data,
      bancoAlternativas: requisicaoBancoAlternativas.data,
    }
  }, [edicao, requisicaoVinculosSimulado.data, requisicaoBancoQuestoes.data, requisicaoBancoAlternativas.data])

  useHidratar(dadosParaHidratarQuestoes, ({ vinculos, bancoQuestoes, bancoAlternativas }) => {
    const vinculosDesteSimulado = vinculos
      .filter((vinculo) => vinculo.simuladoId === simuladoId && vinculo.status !== 'REMOVIDA')
      .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))

    // Rascunho recém-criado, ainda sem questão salva: mantém o
    // questaoVazia() inicial em vez de esvaziar a lista.
    if (vinculosDesteSimulado.length === 0) return

    const carregadas: QuestaoEditavel[] = vinculosDesteSimulado
      .map((vinculo) => bancoQuestoes.find((item) => item.id === vinculo.questaoId))
      .filter((item): item is QuestaoResponse => Boolean(item))
      .map((original) => ({
        id: original.id,
        enunciado: original.enunciado,
        tipo: original.tipo,
        disciplinaId: original.disciplinaId ?? null,
        nivelDificuldade: original.nivelDificuldade ?? null,
        status: original.status,
        alternativas: bancoAlternativas
          .filter((alternativa) => alternativa.questaoId === original.id)
          .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
          .map((alternativa) => ({
            id: alternativa.id,
            texto: alternativa.texto,
            correta: Boolean(alternativa.correta),
          })),
      }))

    if (carregadas.length > 0) {
      setQuestoes(carregadas)
      setQuestaoAtiva(0)
    }
  })

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
        label: `Plano nº ${plano.id}`,
        descricao: plano.curso?.nome,
      })),
    [requisicaoPlanos.data],
  )

  const somenteLeitura = edicao && requisicaoSimulado.data?.status !== 'RASCUNHO'
  // Mesmo em somenteLeitura, um simulado PUBLICADO pode ter a disponibilidade estendida.
  const podeEstenderDisponibilidade = requisicaoSimulado.data?.status === 'PUBLICADO'

  function validarQuestoes() {
    const encontrados: Record<number, ErrosQuestao> = {}

    questoes.forEach((questao, indice) => {
      const errosDaQuestao = validarQuestao(questao)
      if (Object.keys(errosDaQuestao).length > 0) encontrados[indice] = errosDaQuestao
    })

    setErrosQuestoes(encontrados)

    const primeiroInvalido = Object.keys(encontrados)[0]
    if (primeiroInvalido !== undefined) setQuestaoAtiva(Number(primeiroInvalido))

    return Object.keys(encontrados).length === 0
  }

  async function salvar() {
    const cabecalhoOk = !(await form.validate()).hasErrors
    const questoesOk = validarQuestoes()

    if (!cabecalhoOk || !questoesOk) {
      // Troca pra aba onde está o problema — sem isso, o erro fica escondido
      // numa aba que o professor nem está vendo.
      setAba(!cabecalhoOk ? 'configuracao' : 'questoes')
      toast.warning('Revise o simulado', 'Há campos obrigatórios pendentes.')
      return
    }

    setSalvando(true)

    try {
      const corpo = {
        titulo: titulo.trim(),
        disciplinaId,
        planoEnsinoId,
        turmaId,
        tipoDestinacao,
        dataInicio: deInputDataHora(dataInicio),
        dataFim: deInputDataHora(dataFim),
        tempoLimite: tempoLimite ? Number(tempoLimite) : null,
        notaMaxima: notaMaxima ? Number(notaMaxima) : null,
        quantidadeQuestoes: questoes.length,
      }

      const simulado = edicao
        ? await servicoSimulados.atualizar(simuladoId as number, corpo)
        : await servicoSimulados.criar(corpo)

      const pontuacaoPorQuestao = corpo.notaMaxima
        ? Number((corpo.notaMaxima / questoes.length).toFixed(2))
        : undefined

      for (const [indice, questao] of questoes.entries()) {
        const questaoSalva = questao.id
          ? await servicoQuestoes.atualizar(questao.id, {
              enunciado: questao.enunciado.trim(),
              tipo: questao.tipo,
              disciplinaId: questao.disciplinaId ?? disciplinaId,
              nivelDificuldade: questao.nivelDificuldade,
              origem: 'PROFESSOR',
            })
          : await servicoQuestoes.criar({
              enunciado: questao.enunciado.trim(),
              tipo: questao.tipo,
              disciplinaId: questao.disciplinaId ?? disciplinaId,
              nivelDificuldade: questao.nivelDificuldade,
              origem: 'PROFESSOR',
            })

        for (const [posicao, alternativa] of questao.alternativas.entries()) {
          if (!alternativa.texto.trim()) continue

          const corpoAlternativa = {
            questaoId: questaoSalva.id,
            texto: alternativa.texto.trim(),
            correta: alternativa.correta,
            ordem: posicao + 1,
          }

          if (alternativa.id) {
            await servicoAlternativas.atualizar(alternativa.id, corpoAlternativa)
          } else {
            await servicoAlternativas.criar(corpoAlternativa)
          }
        }

        // Vincula a questão ao simulado só na primeira vez.
        if (!questao.id) {
          await simuladoQuestoes.criar({
            simuladoId: simulado.id,
            questaoId: questaoSalva.id,
            ordem: indice + 1,
            pontuacao: pontuacaoPorQuestao,
          })

          // Conteúdos escolhidos antes de a questão existir (VinculoConteudoQuestao
          // em modo local) — comitados agora que ela finalmente tem id.
          if (questao.conteudoPlanoIdsPendentes && questao.conteudoPlanoIdsPendentes.length > 0) {
            await Promise.all(
              questao.conteudoPlanoIdsPendentes.map((conteudoPlanoId) =>
                servicoQuestoes.vincularConteudo(questaoSalva.id, conteudoPlanoId),
              ),
            )
          }
        }
      }

      toast.success(
        edicao ? 'Simulado atualizado' : 'Simulado criado',
        'Ele fica em rascunho até você lançá-lo para os alunos.',
      )

      navegar('/professor/reforco')
    } catch (erroSalvar) {
      toast.error(
        'Não foi possível salvar',
        erroSalvar instanceof ApiError ? erroSalvar.message : undefined,
      )
    } finally {
      setSalvando(false)
    }
  }

  /** Endpoint dedicado: o `salvar()` geral é rejeitado pelo back fora do RASCUNHO. */
  async function salvarDisponibilidade() {
    if (!simuladoId) return

    if (!dataFimSimuladoValida(dataInicio, dataFim)) {
      form.setFieldError('dataFim', MENSAGEM_DATA_FIM_SIMULADO)
      return
    }

    setSalvando(true)

    try {
      await servicoSimulados.estenderDisponibilidade(simuladoId, deInputDataHora(dataFim))
      toast.success('Disponibilidade atualizada')
      await requisicaoSimulado.reload()
    } catch (erroSalvar) {
      toast.error(
        'Não foi possível atualizar',
        erroSalvar instanceof ApiError ? erroSalvar.message : undefined,
      )
    } finally {
      setSalvando(false)
    }
  }

  async function lancar() {
    if (!simuladoId) {
      toast.warning('Salve o simulado primeiro', 'Só é possível lançar um simulado já criado.')
      return
    }

    // Mesmo com destinação "Todos", os elegíveis são "os ativos da turma" —
    // sem turma definida não há como o back saber quem recebe o simulado.
    if (!turmaId) {
      toast.warning('Selecione a turma', 'É preciso informar a turma para saber quem vai receber o simulado.')
      return
    }

    if (tipoDestinacao === 'ESPECIFICO' && alunosSelecionados.length === 0) {
      toast.warning('Selecione os alunos', 'A destinação específica exige ao menos um aluno.')
      setModalAlunos(true)
      return
    }

    await confirmar({
      titulo: 'Lançar simulado?',
      descricao:
        tipoDestinacao === 'TODOS'
          ? 'Todos os alunos com matrícula ativa na turma receberão o simulado.'
          : `${alunosSelecionados.length} aluno(s) receberão o simulado.`,
      rotuloConfirmar: 'Lançar',
      aoConfirmar: async () => {
        setLancando(true)

        try {
          await servicoSimulados.lancar(simuladoId, {
            alunoIds: tipoDestinacao === 'ESPECIFICO' ? alunosSelecionados : undefined,
          })

          toast.success('Simulado lançado', 'Os alunos já podem iniciar as tentativas.')
          navegar('/professor/reforco')
        } catch (erroLancar) {
          toast.error(
            'Não foi possível lançar',
            erroLancar instanceof ApiError ? erroLancar.message : undefined,
          )
        } finally {
          setLancando(false)
        }
      },
    })
  }

  function adicionarQuestao() {
    if (questoes.length >= MAXIMO_QUESTOES) {
      toast.warning('Limite de questões atingido', `Um simulado pode ter no máximo ${MAXIMO_QUESTOES} questões.`)
      return
    }
    setQuestoes((atuais) => [...atuais, questaoVazia()])
    setQuestaoAtiva(questoes.length)
  }

  function removerQuestao(indice: number) {
    if (questoes.length <= 1) return

    setQuestoes((atuais) => atuais.filter((_, i) => i !== indice))
    setQuestaoAtiva((atual) => Math.max(0, Math.min(atual, questoes.length - 2)))
  }

  /**
   * Cada questão importada entra sem `id`: com id, `salvar()` assumiria que já
   * está vinculada a este simulado e não criaria o SimuladoQuestao.
   */
  function alternarQuestaoBancoSelecionada(id: number) {
    setQuestoesBancoSelecionadas((atuais) => {
      const novas = new Set(atuais)
      if (novas.has(id)) novas.delete(id)
      else novas.add(id)
      return novas
    })
  }

  function importarQuestoesSelecionadas() {
    const todasEscolhidas = opcoesBancoQuestoes.filter((item) => questoesBancoSelecionadas.has(item.id))
    if (todasEscolhidas.length === 0) return

    const primeiraVaziaAntes = questoes.length === 1 && !questoes[0].enunciado.trim() && !questoes[0].id
    const espacoDisponivel = MAXIMO_QUESTOES - (primeiraVaziaAntes ? 0 : questoes.length)
    const escolhidas = todasEscolhidas.slice(0, Math.max(0, espacoDisponivel))

    if (escolhidas.length === 0) {
      toast.warning('Limite de questões atingido', `Um simulado pode ter no máximo ${MAXIMO_QUESTOES} questões.`)
      return
    }

    const importadas: QuestaoEditavel[] = escolhidas.map((escolhida) => {
      const alternativasDaQuestao = (requisicaoBancoAlternativas.data ?? [])
        .filter((alternativa) => alternativa.questaoId === escolhida.id)
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
        .map((alternativa) => ({ texto: alternativa.texto, correta: Boolean(alternativa.correta) }))

      return {
        enunciado: escolhida.enunciado,
        tipo: escolhida.tipo,
        disciplinaId: escolhida.disciplinaId ?? disciplinaId,
        nivelDificuldade: escolhida.nivelDificuldade ?? 'MEDIA',
        alternativas:
          alternativasDaQuestao.length >= 2 ? alternativasDaQuestao : questaoVazia().alternativas,
      }
    })

    // Descartar a primeira questão vazia encurta o array; o índice vem do resultado.
    const questoesFinal = primeiraVaziaAntes ? importadas : [...questoes, ...importadas]
    const cortadasPeloLimite = todasEscolhidas.length - escolhidas.length

    setQuestoes(questoesFinal)
    setQuestaoAtiva(Math.max(0, questoesFinal.length - 1))
    setErrosQuestoes({})
    setModalImportar(false)
    setQuestoesBancoSelecionadas(new Set())
    setDisciplinaBancoId(null)
    setDisciplinaBancoIdAplicada(null)
    setFiltroBancoAplicado(false)
    toast.success(
      `${importadas.length} questão(ões) importada(s)`,
      cortadasPeloLimite > 0
        ? `${cortadasPeloLimite} não coube(ram) — limite de ${MAXIMO_QUESTOES} questões por simulado. Revise antes de salvar.`
        : 'Revise o conteúdo antes de salvar.',
    )
  }

  if (edicao && requisicaoSimulado.error) {
    return (
      <Layout>
        <Header titulo="Simulado" voltarPara="/professor/reforco" />
        <ErroCarregamento
          mensagem={requisicaoSimulado.error}
          onRetry={requisicaoSimulado.reload}
        />
      </Layout>
    )
  }

  const questao = questoes[questaoAtiva]

  return (
    <Layout>
      <Header
        titulo={edicao ? 'Editar simulado' : 'Novo simulado'}
        subtitulo={
          somenteLeitura ? (
            <SubtituloItem icon={<Lock />}>
              {podeEstenderDisponibilidade
                ? 'Status: Simulado já lançado — só a disponibilidade pode ser alterada'
                : 'Status: Simulado já lançado — o conteúdo não pode mais ser alterado'}
            </SubtituloItem>
          ) : (
            <SubtituloItem icon={<ClipboardCheck />}>Questões: {questoes.length} montada(s)</SubtituloItem>
          )
        }
        voltarPara="/professor/reforco"
        rotuloVoltar="Módulo de reforço"
        actions={
          <>
            {!somenteLeitura && (
              <Button
                size="large"
                variant="secondary"
                icon={<FolderInput />}
                onClick={() => {
                  setFiltroImportarAplicado(false)
                  setTurmaImportarId(null)
                  setDisciplinaImportarId(null)
                  setTurmaImportarIdAplicada(null)
                  setDisciplinaImportarIdAplicada(null)
                  setSimuladoOrigemId(null)
                  setModalImportarSimulado(true)
                }}
              >
                Importar simulado
              </Button>
            )}
            {edicao && !somenteLeitura && (
              <Button size="large" variant="primary" icon={<Rocket />} loading={lancando} onClick={lancar}>
                Lançar
              </Button>
            )}
            <Button
              size="large"
              variant="danger"
              onClick={() => navegar('/professor/reforco')}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button
              size="large"
              variant="success"
              icon={<Save />}
              loading={salvando}
              disabled={somenteLeitura && !podeEstenderDisponibilidade}
              onClick={podeEstenderDisponibilidade ? salvarDisponibilidade : salvar}
            >
              Salvar
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

      {(edicao && requisicaoSimulado.loading) || carregandoTravaAprovacao || temQuestaoPendente ? (
        <SkeletonCartao />
      ) : aba === 'configuracao' ? (
        <>
          <Card titulo="Configuração do simulado">
            <Stack gap="md">
              <GradeAutoAjuste $larguraMinima="220px">
                <Input
                  label="Título"
                  required
                  placeholder="Ex.: Reforço de frações"
                  value={titulo}
                  error={erros.titulo}
                  disabled={somenteLeitura}
                  maxLength={150}
                  onChange={(evento) => form.setFieldValue('titulo', evento.target.value)}
                />

                <Select<number>
                  label="Disciplina"
                  options={opcoesDisciplinas}
                  value={disciplinaId}
                  loading={requisicaoDisciplinas.loading}
                  disabled={somenteLeitura}
                  searchable
                  clearable
                  placeholder="Selecionar disciplina..."
                  onChange={(valor) => form.setFieldValue('disciplinaId', valor)}
                />

                <Select<number>
                  label="Turma"
                  options={opcoesTurmas}
                  value={turmaId}
                  loading={requisicaoTurmas.loading}
                  error={erros.turmaId}
                  disabled={somenteLeitura}
                  searchable
                  clearable
                  placeholder="Selecionar turma..."
                  onChange={(value) => {
                    form.setFieldValue('turmaId', value)
                    setAlunosSelecionados([])
                  }}
                />

                <Select<number>
                  label="Plano de ensino"
                  options={opcoesPlanos}
                  value={planoEnsinoId}
                  loading={requisicaoPlanos.loading}
                  disabled={somenteLeitura}
                  searchable
                  clearable
                  placeholder="Selecionar plano..."
                  hint="Opcional."
                  onChange={(valor) => form.setFieldValue('planoEnsinoId', valor)}
                />

                <Select<TipoDestinacaoSimulado>
                  label="Destinação"
                  required
                  options={OPCOES_DESTINACAO.map((opcao) => ({
                    value: opcao.value,
                    label: opcao.label,
                  }))}
                  value={tipoDestinacao}
                  disabled={somenteLeitura}
                  onChange={(value) => form.setFieldValue('tipoDestinacao', value ?? 'TODOS')}
                />

                <Input
                  label="Tempo limite"
                  type="number"
                  min={1}
                  placeholder="Ex.: 30"
                  value={tempoLimite}
                  error={erros.tempoLimite}
                  disabled={somenteLeitura}
                  hint="Em minutos. Deixe vazio para sem limite."
                  onChange={(evento) => form.setFieldValue('tempoLimite', evento.target.value)}
                />

                <Input
                  label="Nota máxima"
                  type="number"
                  min={1}
                  step="0.5"
                  value={notaMaxima}
                  error={erros.notaMaxima}
                  disabled={somenteLeitura}
                  hint="Distribuída igualmente entre as questões."
                  onChange={(evento) => form.setFieldValue('notaMaxima', evento.target.value)}
                />
              </GradeAutoAjuste>

              {/* O DatePicker de data e hora tem dois campos internos e corta o texto em colunas mais estreitas. */}
              <GradeAutoAjuste $larguraMinima="320px">
                <DatePicker
                  label="Disponível a partir de"
                  modo="dataHora"
                  value={dataInicio}
                  disabled={somenteLeitura}
                  onChange={(evento) => form.setFieldValue('dataInicio', evento.target.value)}
                />

                <DatePicker
                  label="Disponível até"
                  modo="dataHora"
                  value={dataFim}
                  error={erros.dataFim}
                  hint={podeEstenderDisponibilidade ? 'Simulado já lançado — só este campo pode ser alterado.' : undefined}
                  disabled={somenteLeitura && !podeEstenderDisponibilidade}
                  onChange={(evento) => form.setFieldValue('dataFim', evento.target.value)}
                />
              </GradeAutoAjuste>

              {tipoDestinacao === 'ESPECIFICO' && (
                <SVinculo.SecaoVinculo>
                  <SVinculo.CabecalhoVinculo>
                    <SVinculo.TituloVinculo>Alunos</SVinculo.TituloVinculo>

                    {!somenteLeitura && (
                      <Button
                        size="small"
                        icon={<Users />}
                        disabled={!turmaId}
                        onClick={() => setModalAlunos(true)}
                      >
                        Selecionar alunos
                      </Button>
                    )}
                  </SVinculo.CabecalhoVinculo>

                  {alunosSelecionados.length === 0 ? (
                    <SVinculo.DicaVinculo>
                      Nenhum aluno selecionado — a destinação específica exige ao menos um.
                    </SVinculo.DicaVinculo>
                  ) : (
                    <SVinculo.ChipsVinculo>
                      {alunosSelecionados.map((alunoId) => {
                        const aluno = (requisicaoAlunos.data ?? []).find(
                          (matricula) => matricula.aluno.id === alunoId,
                        )
                        const nome = aluno?.aluno?.pessoa?.nome ?? `Aluno ${alunoId}`

                        return (
                          <Chip
                            key={alunoId}
                            variant="neutral"
                            disabled={somenteLeitura}
                            onRemove={
                              somenteLeitura
                                ? undefined
                                : () =>
                                    setAlunosSelecionados((atuais) => atuais.filter((id) => id !== alunoId))
                            }
                            rotuloRemover={`Remover ${nome}`}
                          >
                            {nome}
                          </Chip>
                        )
                      })}
                    </SVinculo.ChipsVinculo>
                  )}
                </SVinculo.SecaoVinculo>
              )}
            </Stack>
          </Card>
        </>
      ) : (
        <>
          {questao && (
            <QuestaoEditor
              questao={questao}
              indice={questaoAtiva}
              total={questoes.length}
              somenteLeitura={somenteLeitura}
              erros={errosQuestoes[questaoAtiva]}
              onChange={(atualizada) =>
                setQuestoes((atuais) =>
                  atuais.map((item, i) => (i === questaoAtiva ? atualizada : item)),
                )
              }
              onRemove={() => removerQuestao(questaoAtiva)}
              onImport={() => setModalImportar(true)}
              conteudo={
                <VinculoConteudoQuestao
                  questaoId={questao.id}
                  disciplinaId={questao.disciplinaId ?? disciplinaId}
                  somenteLeitura={somenteLeitura}
                  conteudoPlanoIdsPendentes={questao.conteudoPlanoIdsPendentes}
                  onChangePendentes={(ids) =>
                    setQuestoes((atuais) =>
                      atuais.map((item, i) => (i === questaoAtiva ? { ...item, conteudoPlanoIdsPendentes: ids } : item)),
                    )
                  }
                />
              }
              navegador={
                <>
                  {questoes.map((_, indice) => (
                    <StatusBadge
                      key={indice}
                      shape="square"
                      color={errosQuestoes[indice] ? 'red' : indice === questaoAtiva ? 'purple' : 'gray'}
                      selected={indice === questaoAtiva}
                      ariaLabel={`Ir para a questão ${indice + 1}`}
                      onClick={() => setQuestaoAtiva(indice)}
                    >
                      {indice + 1}
                    </StatusBadge>
                  ))}

                  {!somenteLeitura && questoes.length < MAXIMO_QUESTOES && (
                    <Button variant="secondary" size="small" icon={<Plus />} onClick={adicionarQuestao}>
                      Nova questão
                    </Button>
                  )}
                </>
              }
            />
          )}

          {questoes.length === 0 && (
            <EstadoVazio
              titulo="Nenhuma questão"
              descricao="Adicione ao menos uma questão para o simulado."
              icon={<Sparkles />}
              acao={<Button icon={<Plus />} onClick={adicionarQuestao}>Adicionar questão</Button>}
            />
          )}
        </>
      )}

      <Modal
        aberto={modalAlunos}
        onClose={() => setModalAlunos(false)}
        titulo="Selecionar alunos"
        descricao="Apenas alunos com matrícula ativa na turma escolhida."
        largura="520px"
        rodape={
          <>
            <Button variant="secondary" onClick={() => setModalAlunos(false)}>
              Fechar
            </Button>
            <Button onClick={() => setModalAlunos(false)}>
              Confirmar ({alunosSelecionados.length})
            </Button>
          </>
        }
      >
        <ListaAlunos>
          {requisicaoAlunos.loading && <span>Carregando alunos...</span>}

          {requisicaoAlunos.isEmpty && (
            <EstadoVazio
              titulo="Nenhum aluno ativo"
              descricao="Escolha uma turma que tenha alunos matriculados."
            />
          )}

          {(requisicaoAlunos.data ?? []).map((matricula) => (
            <CheckBox
              key={matricula.id}
              label={matricula.aluno?.pessoa?.nome}
              checked={alunosSelecionados.includes(matricula.aluno.id)}
              onChange={(evento) =>
                setAlunosSelecionados((atuais) =>
                  evento.target.checked
                    ? [...atuais, matricula.aluno.id]
                    : atuais.filter((item) => item !== matricula.aluno.id),
                )
              }
            />
          ))}
        </ListaAlunos>
      </Modal>

      <Modal
        aberto={modalImportar}
        onClose={() => setModalImportar(false)}
        titulo="Importar questão"
        largura="720px"
        rodape={
          <>
            <Button variant="secondary" onClick={() => setModalImportar(false)}>
              Cancelar
            </Button>
            <Button
              variant="success"
              disabled={questoesBancoSelecionadas.size === 0}
              onClick={importarQuestoesSelecionadas}
            >
              Salvar
            </Button>
          </>
        }
      >
        <Stack gap="md">
          <Select<number>
            label="Disciplina"
            options={opcoesDisciplinas}
            value={disciplinaBancoId}
            clearable
            placeholder="Todas"
            onChange={setDisciplinaBancoId}
          />

          <Button
            variant="secondary"
            onClick={() => {
              setDisciplinaBancoIdAplicada(disciplinaBancoId)
              setFiltroBancoAplicado(true)
            }}
          >
            Buscar
          </Button>

          <DataTable
            descricao="Questões do banco"
            columns={colunasBancoQuestoes}
            data={opcoesBancoQuestoes}
            rowKey={(item) => item.id}
            loading={requisicaoBancoQuestoes.loading}
            empty={{
              titulo: filtroBancoAplicado ? 'Nenhuma questão encontrada' : 'Filtre e busque',
              descricao: filtroBancoAplicado
                ? 'Todas as questões do banco já estão neste simulado ou não há questões para essa disciplina.'
                : 'Escolha a disciplina e clique em Buscar.',
              icon: <ClipboardCheck />,
            }}
          />
        </Stack>
      </Modal>

      <Modal
        aberto={modalImportarSimulado}
        onClose={() => setModalImportarSimulado(false)}
        titulo="Importar simulado"
        largura="720px"
        rodape={
          <>
            <Button variant="secondary" onClick={() => setModalImportarSimulado(false)}>
              Cancelar
            </Button>
            <Button variant="success" disabled={!simuladoOrigemId} loading={importandoSimulado} onClick={importarSimulado}>
              Salvar
            </Button>
          </>
        }
      >
        <Stack gap="md">
          <GradeAutoAjuste $larguraMinima="220px">
            <Select<number>
              label="Turma"
              options={opcoesTurmasImportar}
              value={turmaImportarId}
              clearable
              placeholder="Todas"
              onChange={setTurmaImportarId}
            />
            <Select<number>
              label="Disciplina"
              options={opcoesDisciplinas}
              value={disciplinaImportarId}
              clearable
              placeholder="Todas"
              onChange={setDisciplinaImportarId}
            />
          </GradeAutoAjuste>

          <Button
            variant="secondary"
            onClick={() => {
              setTurmaImportarIdAplicada(turmaImportarId)
              setDisciplinaImportarIdAplicada(disciplinaImportarId)
              setFiltroImportarAplicado(true)
            }}
          >
            Buscar
          </Button>

          <DataTable
            descricao="Simulados disponíveis para importar"
            columns={colunasSimuladosImportar}
            data={simuladosParaImportar}
            rowKey={(item) => item.id}
            loading={requisicaoSimuladosOrigem.loading}
            empty={{
              titulo: filtroImportarAplicado ? 'Nenhum simulado encontrado' : 'Filtre e busque',
              descricao: filtroImportarAplicado
                ? 'Ajuste os filtros e busque novamente.'
                : 'Escolha a turma e/ou disciplina e clique em Buscar.',
              icon: <FolderInput />,
            }}
          />
        </Stack>
      </Modal>
    </Layout>
  )
}
