import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ClipboardCheck, Eye, X } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { BuscaInput } from '../../../components/ui/BuscaInput'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { IconButton } from '../../../components/ui/IconButton'
import { Tag } from '../../../components/ui/Tag'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useDebounce } from '../../../hooks/useDebounce'
import { usePaginacao } from '../../../hooks/usePaginacao'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { disciplinas as servicoDisciplinas, questoes as servicoQuestoes } from '../../../services/endpoints'
import { normalizar } from '../../../utils/format'
import {
  ROTULO_NIVEL_DIFICULDADE,
  ROTULO_ORIGEM_QUESTAO,
  ROTULO_TIPO_QUESTAO,
  NIVEL_DIFICULDADE_VARIANT,
} from '../../../utils/labels'
import type { QuestaoResponse } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

/**
 * Fila de moderação de questões.
 *
 * O back marca como PENDENTE tudo que a IA gera (StatusQuestao.PENDENTE); só
 * depois de aprovada a questão pode compor um simulado visível ao aluno.
 */
export default function QuestoesPendentes() {
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)
  const [processando, setProcessando] = useState<number | null>(null)

  const { data, loading, error, reload } = useRequisicao(
    () => servicoQuestoes.listarPendentes(),
    [],
  )
  const requisicaoDisciplinas = useRequisicao(() => servicoDisciplinas.listar(), [])

  const nomeDisciplina = (id?: number | null) =>
    (requisicaoDisciplinas.data ?? []).find((disciplina) => disciplina.id === id)?.titulo ?? '—'

  const filtradas = useMemo(() => {
    const lista = data ?? []
    if (!buscaAtrasada.trim()) return lista

    const termo = normalizar(buscaAtrasada)
    return lista.filter((questao) => normalizar(questao.enunciado).includes(termo))
  }, [data, buscaAtrasada])

  const paginacao = usePaginacao(filtradas)

  async function aprovar(questao: QuestaoResponse) {
    setProcessando(questao.id)

    try {
      await servicoQuestoes.aprovar(questao.id)
      toast.success('Questão aprovada', 'Ela já pode ser usada em simulados.')
      await reload()
    } catch (erroAprovar) {
      toast.error(
        'Não foi possível aprovar',
        erroAprovar instanceof ApiError ? erroAprovar.message : undefined,
      )
    } finally {
      setProcessando(null)
    }
  }

  async function rejeitar(questao: QuestaoResponse) {
    const confirmado = await confirmar({
      titulo: 'Rejeitar questão?',
      descricao: 'A questão fica marcada como rejeitada e não entra em nenhum simulado.',
      rotuloConfirmar: 'Rejeitar',
      tone: 'danger',
    })

    if (!confirmado) return

    setProcessando(questao.id)

    try {
      await servicoQuestoes.rejeitar(questao.id)
      toast.success('Questão rejeitada')
      await reload()
    } catch (erroRejeitar) {
      toast.error(
        'Não foi possível rejeitar',
        erroRejeitar instanceof ApiError ? erroRejeitar.message : undefined,
      )
    } finally {
      setProcessando(null)
    }
  }

  const colunas: Coluna<QuestaoResponse>[] = [
    {
      key: 'enunciado',
      cabecalho: 'Enunciado',
      render: (questao) => (
        <span
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {questao.enunciado}
        </span>
      ),
    },
    {
      key: 'disciplina',
      cabecalho: 'Disciplina',
      ocultarEmTelaPequena: true,
      render: (questao) => nomeDisciplina(questao.disciplinaId),
    },
    {
      key: 'tipo',
      cabecalho: 'Tipo',
      ocultarEmTelaPequena: true,
      render: (questao) => ROTULO_TIPO_QUESTAO[questao.tipo],
    },
    {
      key: 'nivel',
      cabecalho: 'Nível',
      render: (questao) =>
        questao.nivelDificuldade ? (
          <Tag variant={NIVEL_DIFICULDADE_VARIANT[questao.nivelDificuldade]}>
            {ROTULO_NIVEL_DIFICULDADE[questao.nivelDificuldade]}
          </Tag>
        ) : (
          '—'
        ),
    },
    {
      key: 'origem',
      cabecalho: 'Origem',
      render: (questao) =>
        questao.origem ? (
          <Tag variant={questao.origem === 'IA' ? 'info' : 'neutral'}>
            {ROTULO_ORIGEM_QUESTAO[questao.origem]}
          </Tag>
        ) : (
          '—'
        ),
    },
  ]

  return (
    <Layout>
      <Header
        titulo="Questões aguardando aprovação"
        subtitulo={
          !loading && !error
            ? `${filtradas.length} questão(ões) na fila de revisão`
            : undefined
        }
        voltarPara="/professor/reforco"
        rotuloVoltar="Voltar para o módulo de reforço"
        filtros={<BuscaInput value={busca} onChange={setBusca} placeholder="Buscar no enunciado..." />}
      />

      <DataTable
        descricao="Questões pendentes de aprovação"
        columns={colunas}
        data={paginacao.itensDaPagina}
        rowKey={(questao) => questao.id}
        loading={loading}
        error={error}
        onReload={reload}
        onRowClick={(questao) => navegar(`/professor/reforco/questoes/${questao.id}`)}
        paginacao={{
          pagina: paginacao.pagina,
          totalPaginas: paginacao.totalPaginas,
          label: paginacao.label,
          temAnterior: paginacao.temAnterior,
          temProxima: paginacao.temProxima,
          onPrevious: paginacao.anterior,
          onNext: paginacao.proxima,
        }}
        empty={{
          titulo: busca ? 'Nenhuma questão encontrada' : 'Nada para revisar',
          descricao: busca
            ? 'Revise o termo buscado ou limpe o filtro.'
            : 'Todas as questões geradas já foram aprovadas ou rejeitadas.',
          icon: <ClipboardCheck />,
        }}
        actions={(questao) => (
          <>
            <IconButton
              label="Revisar questão"
              icon={<Eye />}
              onClick={() => navegar(`/professor/reforco/questoes/${questao.id}`)}
            />
            <IconButton
              label="Aprovar questão"
              icon={<Check />}
              variant="success"
              disabled={processando === questao.id}
              onClick={() => aprovar(questao)}
            />
            <IconButton
              label="Rejeitar questão"
              icon={<X />}
              variant="danger"
              disabled={processando === questao.id}
              onClick={() => rejeitar(questao)}
            />
          </>
        )}
      />
    </Layout>
  )
}
