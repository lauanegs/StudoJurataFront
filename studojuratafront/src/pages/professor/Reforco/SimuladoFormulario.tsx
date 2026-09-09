import { useMemo, useState } from 'react'
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
import { QuestaoEditor } from '../../../components/ui/QuestaoEditor'
import { VinculoConteudoQuestao } from '../../../components/ui/VinculoConteudo'
import {
  questaoVazia,
  validarQuestao,
  type ErrosQuestao,
  type QuestaoEditavel,
} from '../../../components/ui/QuestaoEditor/types'
import { Select } from '../../../components/ui/Select'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { Tab } from '../../../components/ui/Tab'
import { Tag } from '../../../components/ui/Tag'
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
  disciplinas as servicoDisciplinas,
  matriculas,
  planosEnsino,
  questoes as servicoQuestoes,
  simuladoQuestoes,
  simulados as servicoSimulados,
  turmas as servicoTurmas,
} from '../../../services/endpoints'
import { deInputDataHora, paraInputDataHora } from '../../../utils/format'
import { OPCOES_DESTINACAO, ROTULO_TIPO_QUESTAO } from '../../../utils/labels'
import type { QuestaoResponse, SimuladoResponse, TipoDestinacaoSimulado } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

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

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`

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

  const [titulo, setTitulo] = useState('')
  const [disciplinaId, setDisciplinaId] = useState<number | null>(null)
  const [turmaId, setTurmaId] = useState<number | null>(null)
  const [planoEnsinoId, setPlanoEnsinoId] = useState<number | null>(null)
  const [tipoDestinacao, setTipoDestinacao] = useState<TipoDestinacaoSimulado>('TODOS')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [tempoLimite, setTempoLimite] = useState('')
  const [notaMaxima, setNotaMaxima] = useState('10')

  const [questoes, setQuestoes] = useState<QuestaoEditavel[]>([questaoVazia()])
  const [questaoAtiva, setQuestaoAtiva] = useState(0)
  const [errosQuestoes, setErrosQuestoes] = useState<Record<number, ErrosQuestao>>({})
  const [erros, setErros] = useState<Record<string, string | undefined>>({})

  const [modalAlunos, setModalAlunos] = useState(false)
  const [alunosSelecionados, setAlunosSelecionados] = useState<number[]>([])

  // Confirmado no Figma: filtra por Disciplina + Buscar (não busca livre por
  // texto) e permite marcar mais de uma questão — cada uma marcada vira uma
  // questão nova no simulado (não substitui o slot ativo).
  const [modalImportar, setModalImportar] = useState(false)
  const [disciplinaBancoId, setDisciplinaBancoId] = useState<number | null>(null)
  const [filtroBancoAplicado, setFiltroBancoAplicado] = useState(false)
  const [questoesBancoSelecionadas, setQuestoesBancoSelecionadas] = useState<Set<number>>(new Set())

  // Modal "Importar simulado": pega todas as questões de um simulado
  // existente de uma vez (diferente do modal acima, que importa 1 questão
  // por vez pro slot ativo).
  const [modalImportarSimulado, setModalImportarSimulado] = useState(false)
  const [turmaImportarId, setTurmaImportarId] = useState<number | null>(null)
  const [disciplinaImportarId, setDisciplinaImportarId] = useState<number | null>(null)
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

  // `edicao` entra no `ativo` das duas de baixo (banco de questões/alternativas)
  // além dos modais de importação: são as mesmas usadas pra resolver o
  // enunciado/alternativas completos de cada questão já vinculada a este
  // simulado, na hidratação logo abaixo (ver requisicaoVinculosSimulado).
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

  // Vínculos (SimuladoQuestao) DESTE simulado — separada da de cima
  // (que é só pro modal "Importar simulado", de OUTRO simulado) pra não
  // misturar as duas responsabilidades; ver hidratação de `questoes` abaixo.
  const requisicaoVinculosSimulado = useRequisicao(() => simuladoQuestoes.listar(), [], { ativo: edicao })

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
        (!turmaImportarId || item.turmaId === turmaImportarId) &&
        (!disciplinaImportarId || item.disciplinaId === disciplinaImportarId),
    )
  }, [requisicaoSimuladosOrigem.data, filtroImportarAplicado, turmaImportarId, disciplinaImportarId, simuladoId])

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

      setQuestoes(importadas)
      setQuestaoAtiva(0)
      setErrosQuestoes({})
      setModalImportarSimulado(false)
      setSimuladoOrigemId(null)
      toast.success('Simulado importado', `${importadas.length} questão(ões) copiada(s). Revise antes de salvar.`)
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
        (!disciplinaBancoId || item.disciplinaId === disciplinaBancoId),
    )
  }, [requisicaoBancoQuestoes.data, idsJaNoSimulado, filtroBancoAplicado, disciplinaBancoId])

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
    setTitulo(simulado.titulo)
    setDisciplinaId(simulado.disciplinaId ?? null)
    setTurmaId(simulado.turmaId ?? null)
    setPlanoEnsinoId(simulado.planoEnsinoId ?? null)
    setTipoDestinacao(simulado.tipoDestinacao)
    setDataInicio(paraInputDataHora(simulado.dataInicio))
    setDataFim(paraInputDataHora(simulado.dataFim))
    setTempoLimite(simulado.tempoLimite?.toString() ?? '')
    setNotaMaxima(simulado.notaMaxima?.toString() ?? '10')
  })

  // Carrega as questões JÁ SALVAS deste simulado (editar um existente sem
  // isso mostrava sempre 1 questão em branco, mesmo com questões reais
  // vinculadas — o estado `questoes` só era populado pra criação do zero ou
  // pelos fluxos de importar). Combina as 3 requisições numa só referência
  // estável, porque useHidratar só aplica quando o valor muda de referência
  // e as 3 precisam estar prontas juntas pra resolver enunciado+alternativas
  // de cada questão vinculada.
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
        label: plano.titulo ?? `Plano #${plano.id}`,
        descricao: plano.curso?.nome,
      })),
    [requisicaoPlanos.data],
  )

  const somenteLeitura = edicao && requisicaoSimulado.data?.status !== 'RASCUNHO'

  function validarCabecalho() {
    const encontrados: Record<string, string | undefined> = {}

    // SimuladoRequestDTO: titulo @NotBlank, tipoDestinacao @NotNull.
    if (!titulo.trim()) encontrados.titulo = 'Informe o título do simulado'

    if (tipoDestinacao === 'ESPECIFICO' && !turmaId) {
      encontrados.turmaId = 'Selecione a turma para escolher os alunos'
    }

    if (tempoLimite && (!Number.isInteger(Number(tempoLimite)) || Number(tempoLimite) <= 0)) {
      encontrados.tempoLimite = 'Informe os minutos como número inteiro positivo'
    }

    if (notaMaxima && (!Number.isFinite(Number(notaMaxima)) || Number(notaMaxima) <= 0)) {
      encontrados.notaMaxima = 'A nota máxima deve ser maior que zero'
    }

    if (dataInicio && dataFim && new Date(dataFim) <= new Date(dataInicio)) {
      encontrados.dataFim = 'A data final deve ser posterior à inicial'
    }

    setErros(encontrados)
    return Object.keys(encontrados).filter((chave) => encontrados[chave]).length === 0
  }

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
    const cabecalhoOk = validarCabecalho()
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
    setQuestoes((atuais) => [...atuais, questaoVazia()])
    setQuestaoAtiva(questoes.length)
  }

  function removerQuestao(indice: number) {
    if (questoes.length <= 1) return

    setQuestoes((atuais) => atuais.filter((_, i) => i !== indice))
    setQuestaoAtiva((atual) => Math.max(0, Math.min(atual, questoes.length - 2)))
  }

  /**
   * Importa o conteúdo de uma ou mais questões já existentes no banco —
   * confirmado no Figma: seleção múltipla via checkbox. Cada marcada vira
   * uma questão NOVA no simulado (sem `id`, pra `salvar()` criar o vínculo
   * SimuladoQuestao — se reaproveitássemos o id, ele pularia essa criação
   * assumindo que quem já tem id já está vinculado a este simulado).
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
    const escolhidas = opcoesBancoQuestoes.filter((item) => questoesBancoSelecionadas.has(item.id))
    if (escolhidas.length === 0) return

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

    // A primeira questão (se ainda vazia) é substituída; as demais são adicionadas.
    setQuestoes((atuais) => {
      const primeiraVazia =
        atuais.length === 1 && !atuais[0].enunciado.trim() && !atuais[0].id ? atuais.slice(1) : atuais
      return [...primeiraVazia, ...importadas]
    })
    setQuestaoAtiva(Math.max(0, questoes.length + importadas.length - 1))
    setErrosQuestoes({})
    setModalImportar(false)
    setQuestoesBancoSelecionadas(new Set())
    setDisciplinaBancoId(null)
    setFiltroBancoAplicado(false)
    toast.success(
      `${importadas.length} questão(ões) importada(s)`,
      'Revise o conteúdo antes de salvar.',
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
              Status: Simulado já lançado — o conteúdo não pode mais ser alterado
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
              disabled={somenteLeitura}
              onClick={salvar}
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

      {edicao && requisicaoSimulado.loading ? (
        <SkeletonCartao />
      ) : aba === 'configuracao' ? (
        <>
          <Card titulo="Configuração do simulado">
            <Coluna>
              <Grade>
                <Input
                  label="Título"
                  required
                  placeholder="Ex.: Reforço de frações"
                  value={titulo}
                  error={erros.titulo}
                  disabled={somenteLeitura}
                  maxLength={150}
                  onChange={(evento) => setTitulo(evento.target.value)}
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
                  onChange={setDisciplinaId}
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
                    setTurmaId(value)
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
                  onChange={setPlanoEnsinoId}
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
                  onChange={(value) => setTipoDestinacao(value ?? 'TODOS')}
                />

                <DatePicker
                  label="Disponível a partir de"
                  modo="dataHora"
                  value={dataInicio}
                  disabled={somenteLeitura}
                  onChange={(evento) => setDataInicio(evento.target.value)}
                />

                <DatePicker
                  label="Disponível até"
                  modo="dataHora"
                  value={dataFim}
                  error={erros.dataFim}
                  disabled={somenteLeitura}
                  onChange={(evento) => setDataFim(evento.target.value)}
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
                  onChange={(evento) => setTempoLimite(evento.target.value)}
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
                  onChange={(evento) => setNotaMaxima(evento.target.value)}
                />
              </Grade>

              {tipoDestinacao === 'ESPECIFICO' && (
                <Coluna>
                  <div>
                    <Button
                      icon={<Users />}
                      disabled={!turmaId || somenteLeitura}
                      onClick={() => setModalAlunos(true)}
                    >
                      Selecionar alunos
                    </Button>
                  </div>

                  {alunosSelecionados.length === 0 ? (
                    <Tag variant="warning">Nenhum aluno selecionado</Tag>
                  ) : (
                    <Chips>
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
                    </Chips>
                  )}
                </Coluna>
              )}
            </Coluna>
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

                  {!somenteLeitura && (
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
            <Button variant="danger" onClick={() => setModalImportar(false)}>
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
        <Coluna>
          <Select<number>
            label="Disciplina"
            options={opcoesDisciplinas}
            value={disciplinaBancoId}
            clearable
            placeholder="Todas"
            onChange={setDisciplinaBancoId}
          />

          <Button variant="secondary" onClick={() => setFiltroBancoAplicado(true)}>
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
        </Coluna>
      </Modal>

      <Modal
        aberto={modalImportarSimulado}
        onClose={() => setModalImportarSimulado(false)}
        titulo="Importar simulado"
        largura="720px"
        rodape={
          <>
            <Button variant="danger" onClick={() => setModalImportarSimulado(false)}>
              Cancelar
            </Button>
            <Button variant="success" disabled={!simuladoOrigemId} loading={importandoSimulado} onClick={importarSimulado}>
              Salvar
            </Button>
          </>
        }
      >
        <Coluna>
          <Grade>
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
          </Grade>

          <Button variant="secondary" onClick={() => setFiltroImportarAplicado(true)}>
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
        </Coluna>
      </Modal>
    </Layout>
  )
}
