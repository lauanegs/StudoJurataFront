import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Plus, Rocket, Save, Sparkles } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { BuscaInput } from '../../../components/ui/BuscaInput'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { CheckBox } from '../../../components/ui/CheckBox'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Header } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { QuestaoEditor } from '../../../components/ui/QuestaoEditor'
import {
  questaoVazia,
  validarQuestao,
  type ErrosQuestao,
  type QuestaoEditavel,
} from '../../../components/ui/QuestaoEditor/types'
import { Select } from '../../../components/ui/Select'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { Tag } from '../../../components/ui/Tag'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useDebounce } from '../../../hooks/useDebounce'
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
import { deInputDataHora, normalizar, paraInputDataHora } from '../../../utils/format'
import { OPCOES_DESTINACAO, ROTULO_TIPO_QUESTAO } from '../../../utils/labels'
import type { QuestaoResponse, TipoDestinacaoSimulado } from '../../../types'

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

const Navegador = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};

  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.base};
`

const ListaAlunos = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  max-height: 320px;
  overflow-y: auto;
  padding-bottom: ${({ theme }) => theme.spacing.xs};
`

const OpcaoQuestaoBanco = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  text-align: left;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.purple};
  }
`

const ListaQuestoesScroll = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  max-height: 400px;
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
export default function SimuladoFormulario() {
  const { id } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

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

  const [modalImportar, setModalImportar] = useState(false)
  const [buscaBanco, setBuscaBanco] = useState('')
  const buscaBancoAtrasada = useDebounce(buscaBanco)

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

  const requisicaoBancoQuestoes = useRequisicao(() => servicoQuestoes.listar(), [], {
    ativo: modalImportar,
  })
  const requisicaoBancoAlternativas = useRequisicao(() => servicoAlternativas.listar(), [], {
    ativo: modalImportar,
  })

  const idsJaNoSimulado = useMemo(
    () => new Set(questoes.map((item) => item.id).filter((id): id is number => Boolean(id))),
    [questoes],
  )

  const opcoesBancoQuestoes = useMemo(() => {
    const disponiveis = (requisicaoBancoQuestoes.data ?? []).filter(
      (item) => item.status !== 'REJEITADA' && !idsJaNoSimulado.has(item.id),
    )

    if (!buscaBancoAtrasada.trim()) return disponiveis

    const termo = normalizar(buscaBancoAtrasada)
    return disponiveis.filter((item) => normalizar(item.enunciado).includes(termo))
  }, [requisicaoBancoQuestoes.data, idsJaNoSimulado, buscaBancoAtrasada])

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
        descricao: plano.periodoLetivo,
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
        }
      }

      toast.success(
        edicao ? 'Simulado atualizado' : 'Simulado criado',
        'Ele fica em rascunho até você lançá-lo para os alunos.',
      )

      navegar('/professor/reforco/simulados')
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

    if (tipoDestinacao === 'ESPECIFICO' && alunosSelecionados.length === 0) {
      toast.warning('Selecione os alunos', 'A destinação específica exige ao menos um aluno.')
      setModalAlunos(true)
      return
    }

    const confirmado = await confirmar({
      titulo: 'Lançar simulado?',
      descricao:
        tipoDestinacao === 'TODOS'
          ? 'Todos os alunos com matrícula ativa na turma receberão o simulado.'
          : `${alunosSelecionados.length} aluno(s) receberão o simulado.`,
      rotuloConfirmar: 'Lançar',
    })

    if (!confirmado) return

    setLancando(true)

    try {
      await servicoSimulados.lancar(simuladoId, {
        alunoIds: tipoDestinacao === 'ESPECIFICO' ? alunosSelecionados : undefined,
      })

      toast.success('Simulado lançado', 'Os alunos já podem iniciar as tentativas.')
      navegar('/professor/reforco/simulados')
    } catch (erroLancar) {
      toast.error(
        'Não foi possível lançar',
        erroLancar instanceof ApiError ? erroLancar.message : undefined,
      )
    } finally {
      setLancando(false)
    }
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
   * Importa o conteúdo de uma questão já existente no banco para o slot ativo.
   *
   * Copia como questão nova (sem `id`) em vez de reaproveitar o registro
   * original: se reutilizássemos o id, `salvar()` pularia a criação do
   * SimuladoQuestao (assume que quem já tem id já está vinculado a este
   * simulado), e a questão importada nunca ficaria de fato ligada a ele.
   */
  function importarQuestao(escolhida: QuestaoResponse) {
    const alternativasDaQuestao = (requisicaoBancoAlternativas.data ?? [])
      .filter((alternativa) => alternativa.questaoId === escolhida.id)
      .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
      .map((alternativa) => ({ texto: alternativa.texto, correta: Boolean(alternativa.correta) }))

    const importada: QuestaoEditavel = {
      enunciado: escolhida.enunciado,
      tipo: escolhida.tipo,
      disciplinaId: escolhida.disciplinaId ?? disciplinaId,
      nivelDificuldade: escolhida.nivelDificuldade ?? 'MEDIA',
      alternativas:
        alternativasDaQuestao.length >= 2 ? alternativasDaQuestao : questaoVazia().alternativas,
    }

    setQuestoes((atuais) => atuais.map((item, i) => (i === questaoAtiva ? importada : item)))
    setErrosQuestoes((atuais) => {
      const resto = { ...atuais }
      delete resto[questaoAtiva]
      return resto
    })
    setModalImportar(false)
    setBuscaBanco('')
    toast.success('Questão importada', 'Revise o conteúdo antes de salvar.')
  }

  if (edicao && requisicaoSimulado.error) {
    return (
      <Layout>
        <Header titulo="Simulado" voltarPara="/professor/reforco/simulados" />
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
            <Tag variant="warning">
              Simulado já lançado — o conteúdo não pode mais ser alterado
            </Tag>
          ) : (
            <span>{questoes.length} questão(ões) montada(s)</span>
          )
        }
        voltarPara="/professor/reforco/simulados"
        rotuloVoltar="Voltar para simulados"
        actions={
          <>
            {edicao && !somenteLeitura && (
              <Button
                variant="primary"
                icon={<Rocket />}
                loading={lancando}
                onClick={lancar}
              >
                Lançar
              </Button>
            )}
            <Button
              variant="danger"
              onClick={() => navegar('/professor/reforco/simulados')}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button
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

      {edicao && requisicaoSimulado.loading ? (
        <SkeletonCartao />
      ) : (
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
                  hint="Opcional: vincula o simulado ao conteúdo trabalhado."
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
                  hint="Em minutos. Deixe isEmpty para sem limite."
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <Button
                    variant="secondary"
                    size="small"
                    icon={<Plus />}
                    disabled={!turmaId || somenteLeitura}
                    onClick={() => setModalAlunos(true)}
                  >
                    Selecionar alunos
                  </Button>

                  <Tag variant={alunosSelecionados.length > 0 ? 'success' : 'warning'}>
                    {alunosSelecionados.length} aluno(s) selecionado(s)
                  </Tag>
                </div>
              )}
            </Coluna>
          </Card>

          {questao && (
            <QuestaoEditor
              questao={questao}
              indice={questaoAtiva}
              total={questoes.length}
              disciplinas={opcoesDisciplinas}
              carregandoDisciplinas={requisicaoDisciplinas.loading}
              somenteLeitura={somenteLeitura}
              erros={errosQuestoes[questaoAtiva]}
              onChange={(atualizada) =>
                setQuestoes((atuais) =>
                  atuais.map((item, i) => (i === questaoAtiva ? atualizada : item)),
                )
              }
              onRemove={() => removerQuestao(questaoAtiva)}
              onImport={() => setModalImportar(true)}
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

          <Navegador role="group" aria-label="Navegação entre questões">
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
          </Navegador>
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
        descricao="Reaproveite uma questão já cadastrada no banco. O conteúdo é copiado para a questão atual."
        largura="640px"
        rodape={
          <Button variant="secondary" onClick={() => setModalImportar(false)}>
            Fechar
          </Button>
        }
      >
        <Coluna>
          <BuscaInput
            value={buscaBanco}
            onChange={setBuscaBanco}
            placeholder="Buscar por enunciado..."
          />

          <ListaQuestoesScroll>
            {requisicaoBancoQuestoes.loading && <span>Carregando questões...</span>}

            {!requisicaoBancoQuestoes.loading && opcoesBancoQuestoes.length === 0 && (
              <EstadoVazio
                titulo={buscaBanco ? 'Nenhuma questão encontrada' : 'Nenhuma questão disponível'}
                descricao={
                  buscaBanco
                    ? 'Revise o termo buscado ou limpe o filtro.'
                    : 'Todas as questões do banco já estão neste simulado ou o banco está vazio.'
                }
              />
            )}

            {opcoesBancoQuestoes.map((item) => (
              <OpcaoQuestaoBanco key={item.id} type="button" onClick={() => importarQuestao(item)}>
                <Tag variant="purple" size="small">
                  {ROTULO_TIPO_QUESTAO[item.tipo]}
                </Tag>
                <span>{item.enunciado}</span>
              </OpcaoQuestaoBanco>
            ))}
          </ListaQuestoesScroll>
        </Coluna>
      </Modal>
    </Layout>
  )
}
