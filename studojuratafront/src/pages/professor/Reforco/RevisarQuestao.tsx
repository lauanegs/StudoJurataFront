import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, Pencil, Save, X } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Header } from '../../../components/ui/Header'
import { QuestaoEditor } from '../../../components/ui/QuestaoEditor'
import { validarQuestao, type ErrosQuestao, type QuestaoEditavel } from '../../../components/ui/QuestaoEditor/types'
import { Tag } from '../../../components/ui/Tag'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
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
} from '../../../services/endpoints'
import { ROTULO_ORIGEM_QUESTAO } from '../../../utils/labels'

export default function RevisarQuestao() {
  const { questaoId } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const idQuestao = Number(questaoId)

  const [questao, setQuestao] = useState<QuestaoEditavel | null>(null)
  const [editando, setEditando] = useState(false)
  const [erros, setErros] = useState<ErrosQuestao>({})
  const [processando, setProcessando] = useState(false)

  const requisicaoQuestao = useRequisicao(() => servicoQuestoes.buscar(idQuestao), [idQuestao])
  const requisicaoAlternativas = useRequisicao(() => servicoAlternativas.listar(), [])
  const requisicaoDisciplinas = useRequisicao(() => servicoDisciplinas.listar(), [])

  useHidratar(
    requisicaoQuestao.data && requisicaoAlternativas.data ? requisicaoQuestao.data : null,
    (data) => {
      setQuestao({
      id: data.id,
      enunciado: data.enunciado,
      tipo: data.tipo,
      disciplinaId: data.disciplinaId ?? null,
      nivelDificuldade: data.nivelDificuldade ?? null,
      status: data.status,
        alternativas: (requisicaoAlternativas.data ?? [])
          .filter((alternativa) => alternativa.questaoId === data.id)
          .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
          .map((alternativa) => ({
            id: alternativa.id,
            texto: alternativa.texto,
            correta: Boolean(alternativa.correta),
          })),
      })
    },
  )

  const opcoesDisciplinas = useMemo(
    () =>
      (requisicaoDisciplinas.data ?? []).map((disciplina) => ({
        value: disciplina.id,
        label: disciplina.titulo ?? `Disciplina ${disciplina.id}`,
      })),
    [requisicaoDisciplinas.data],
  )

  async function salvarEdicao() {
    if (!questao) return

    const encontrados = validarQuestao(questao)
    setErros(encontrados)

    if (Object.keys(encontrados).length > 0) {
      toast.warning('Revise a questão', 'Há campos obrigatórios pendentes.')
      return
    }

    setProcessando(true)

    try {
      await servicoQuestoes.atualizar(idQuestao, {
        enunciado: questao.enunciado.trim(),
        tipo: questao.tipo,
        disciplinaId: questao.disciplinaId,
        nivelDificuldade: questao.nivelDificuldade,
        origem: requisicaoQuestao.data?.origem ?? 'PROFESSOR',
      })

      for (const [posicao, alternativa] of questao.alternativas.entries()) {
        if (!alternativa.texto.trim()) continue

        const corpo = {
          questaoId: idQuestao,
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
      await Promise.all([requisicaoQuestao.reload(), requisicaoAlternativas.reload()])
    } catch (erroSalvar) {
      toast.error(
        'Não foi possível salvar',
        erroSalvar instanceof ApiError ? erroSalvar.message : undefined,
      )
    } finally {
      setProcessando(false)
    }
  }

  async function aprovar() {
    setProcessando(true)

    try {
      await servicoQuestoes.aprovar(idQuestao)
      toast.success('Questão aprovada', 'Ela já pode ser usada em simulados.')
      navegar('/professor/reforco/questoes')
    } catch (erroAprovar) {
      toast.error(
        'Não foi possível aprovar',
        erroAprovar instanceof ApiError ? erroAprovar.message : undefined,
      )
    } finally {
      setProcessando(false)
    }
  }

  async function rejeitar() {
    const confirmado = await confirmar({
      titulo: 'Rejeitar questão?',
      descricao: 'A questão fica marcada como rejeitada e não entra em nenhum simulado.',
      rotuloConfirmar: 'Rejeitar',
      tone: 'danger',
    })

    if (!confirmado) return

    setProcessando(true)

    try {
      await servicoQuestoes.rejeitar(idQuestao)
      toast.success('Questão rejeitada')
      navegar('/professor/reforco/questoes')
    } catch (erroRejeitar) {
      toast.error(
        'Não foi possível rejeitar',
        erroRejeitar instanceof ApiError ? erroRejeitar.message : undefined,
      )
    } finally {
      setProcessando(false)
    }
  }

  if (requisicaoQuestao.error) {
    return (
      <Layout>
        <Header titulo="Revisar questão" voltarPara="/professor/reforco/questoes" />
        <ErroCarregamento
          mensagem={requisicaoQuestao.error}
          onRetry={requisicaoQuestao.reload}
        />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo="Revisar questão"
        subtitulo={
          requisicaoQuestao.data?.origem && (
            <Tag variant={requisicaoQuestao.data.origem === 'IA' ? 'info' : 'neutral'}>
              {ROTULO_ORIGEM_QUESTAO[requisicaoQuestao.data.origem]}
            </Tag>
          )
        }
        voltarPara="/professor/reforco/questoes"
        rotuloVoltar="Voltar para a fila de revisão"
        actions={
          editando ? (
            <>
              <Button
                variant="danger"
                onClick={() => {
                  setEditando(false)
                  setErros({})
                }}
                disabled={processando}
              >
                Cancelar edição
              </Button>
              <Button variant="success" icon={<Save />} loading={processando} onClick={salvarEdicao}>
                Salvar alterações
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                icon={<Pencil />}
                onClick={() => setEditando(true)}
                disabled={processando}
              >
                Editar
              </Button>
              <Button
                variant="danger"
                icon={<X />}
                onClick={rejeitar}
                disabled={processando}
              >
                Rejeitar
              </Button>
              <Button
                variant="success"
                icon={<Check />}
                loading={processando}
                onClick={aprovar}
              >
                Aprovar
              </Button>
            </>
          )
        }
      />

      {requisicaoQuestao.loading || !questao ? (
        <SkeletonCartao />
      ) : (
        <QuestaoEditor
          questao={questao}
          indice={0}
          total={1}
          disciplinas={opcoesDisciplinas}
          carregandoDisciplinas={requisicaoDisciplinas.loading}
          somenteLeitura={!editando}
          erros={erros}
          onChange={setQuestao}
        />
      )}
    </Layout>
  )
}
