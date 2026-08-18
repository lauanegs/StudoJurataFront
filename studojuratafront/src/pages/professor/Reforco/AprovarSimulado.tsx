import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Check, ClipboardCheck, Pencil, Save, X } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Header } from '../../../components/ui/Header'
import { QuestaoEditor } from '../../../components/ui/QuestaoEditor'
import { validarQuestao, type ErrosQuestao, type QuestaoEditavel } from '../../../components/ui/QuestaoEditor/types'
import { StatusBadge } from '../../../components/ui/StatusBadge'
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
  questoes as servicoQuestoes,
  simuladoQuestoes,
  simulados as servicoSimulados,
} from '../../../services/endpoints'

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

/**
 * Aprovação em lote das questões pendentes de um simulado, uma de cada vez —
 * reaproveita o mesmo QuestaoEditor usado em criar/editar simulado e em
 * revisar questão avulsa (confirmado no Figma: mesma estrutura de editor +
 * paginador de questões).
 */
export default function AprovarSimulado() {
  const { simuladoId } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const idSimulado = Number(simuladoId)

  const [questoes, setQuestoes] = useState<QuestaoEditavel[]>([])
  const [questaoAtiva, setQuestaoAtiva] = useState(0)
  const [editando, setEditando] = useState(false)
  const [erros, setErros] = useState<ErrosQuestao>({})
  const [processando, setProcessando] = useState(false)
  const [processandoLote, setProcessandoLote] = useState(false)

  const requisicaoSimulado = useRequisicao(() => servicoSimulados.buscar(idSimulado), [idSimulado])
  const requisicaoVinculos = useRequisicao(() => simuladoQuestoes.listar(), [])
  const requisicaoTodasQuestoes = useRequisicao(() => servicoQuestoes.listar(), [])
  const requisicaoAlternativas = useRequisicao(() => servicoAlternativas.listar(), [])
  const requisicaoDisciplinas = useRequisicao(() => servicoDisciplinas.listar(), [])

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

  const opcoesDisciplinas = useMemo(
    () =>
      (requisicaoDisciplinas.data ?? []).map((disciplina) => ({
        value: disciplina.id,
        label: disciplina.titulo ?? `Disciplina ${disciplina.id}`,
      })),
    [requisicaoDisciplinas.data],
  )

  const questaoAtual = questoes[questaoAtiva] ?? null

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
        voltarPara="/professor/reforco/aprovacao"
        rotuloVoltar="Voltar para simulados aguardando aprovação"
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

      {carregando ? (
        <SkeletonCartao />
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
              disciplinas={opcoesDisciplinas}
              carregandoDisciplinas={requisicaoDisciplinas.loading}
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
