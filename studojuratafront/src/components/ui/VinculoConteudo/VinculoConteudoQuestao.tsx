import { useMemo, useState } from 'react'
import { ListTree } from 'lucide-react'

import { Button } from '../Button'
import { CheckBox } from '../CheckBox'
import { Chip } from '../Chip'
import { Modal } from '../Modal'
import { EstadoVazio } from '../../feedback/EstadoVazio'
import { useToast } from '../../../contexts/toastContexto'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { conteudosPlano, questoes as servicoQuestoes } from '../../../services/endpoints'
import type { ConteudoPlano } from '../../../types'
import * as S from './styles'

interface VinculoConteudoQuestaoProps {
  /** Ausente quando a questão ainda não foi salva — nesse caso o componente entra em modo local, ver conteudoPlanoIdsPendentes/onChangePendentes. */
  questaoId?: number
  /** Escopo do seletor: só conteúdos do plano de ensino desta disciplina aparecem como opção. */
  disciplinaId?: number | null
  somenteLeitura?: boolean
  /** Modo local (sem questaoId ainda): ids escolhidos ficam só no estado do formulário pai, comitados via API assim que a questão for salva e ganhar id — mesmo princípio das alternativas, que também só existem no back depois do salvar. */
  conteudoPlanoIdsPendentes?: number[]
  onChangePendentes?: (ids: number[]) => void
}

/**
 * Vincula/desvincula a questão a conteúdo(s) do plano de ensino — mesma
 * "seção" (título + botão + chips, ver ./styles) usada por
 * VinculoConteudoAula, mesmo par de entidades (X vinculado a ConteudoPlano).
 *
 * Sem esse vínculo a questão fica invisível pro cálculo de desempenho por
 * conteúdo/nível que decide o reforço (back: RecomendacaoService) — hoje só
 * questões geradas pela IA ganham esse vínculo automaticamente na criação;
 * questões feitas pelo professor (a maioria) precisam dele aqui.
 *
 * Sem `questaoId` (questão nova, ainda não salva) o componente não bloqueia
 * a escolha de conteúdo esperando o professor salvar antes — isso era um
 * impedimento real (confirmado pelo usuário): escolher fica só no estado
 * local (`conteudoPlanoIdsPendentes`/`onChangePendentes`, controlado pelo
 * formulário pai) até a questão existir de verdade.
 */
export function VinculoConteudoQuestao({
  questaoId,
  disciplinaId,
  somenteLeitura = false,
  conteudoPlanoIdsPendentes = [],
  onChangePendentes,
}: VinculoConteudoQuestaoProps) {
  const toast = useToast()
  const [modalAberto, setModalAberto] = useState(false)
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set())

  const requisicaoVinculos = useRequisicao(
    () => servicoQuestoes.listarConteudos(questaoId as number),
    [questaoId],
    { ativo: Boolean(questaoId) },
  )

  // Precisa dos títulos tanto pro checklist do modal quanto pros chips já
  // escolhidos no modo local (sem questaoId) — carrega assim que a
  // disciplina é conhecida, não só quando o modal abre.
  const requisicaoConteudos = useRequisicao(() => conteudosPlano.listar(), [], { ativo: Boolean(disciplinaId) })

  const conteudosVinculados = useMemo(() => {
    if (questaoId) {
      return (requisicaoVinculos.data ?? [])
        .map((vinculo) => vinculo.conteudoPlano)
        .filter((item): item is ConteudoPlano => Boolean(item))
    }

    const porId = new Map((requisicaoConteudos.data ?? []).map((conteudo) => [conteudo.id, conteudo]))
    return conteudoPlanoIdsPendentes
      .map((id) => porId.get(id))
      .filter((item): item is ConteudoPlano => Boolean(item))
  }, [questaoId, requisicaoVinculos.data, requisicaoConteudos.data, conteudoPlanoIdsPendentes])

  const vinculadosIds = useMemo(() => new Set(conteudosVinculados.map((item) => item.id)), [conteudosVinculados])

  const conteudosDisponiveis = useMemo(() => {
    if (!disciplinaId) return []

    return (requisicaoConteudos.data ?? [])
      .filter(
        (conteudo) =>
          conteudo.planoEnsino?.turmaDisciplina?.disciplina?.id === disciplinaId &&
          conteudo.status !== 'INATIVO' &&
          !vinculadosIds.has(conteudo.id),
      )
      .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
  }, [requisicaoConteudos.data, vinculadosIds, disciplinaId])

  function alternarSelecionado(id: number) {
    setSelecionados((atuais) => {
      const proximo = new Set(atuais)
      if (proximo.has(id)) proximo.delete(id)
      else proximo.add(id)
      return proximo
    })
  }

  const { executar: vincular, executando: vinculando } = useAcao(async () => {
    if (selecionados.size === 0) return

    if (!questaoId) {
      onChangePendentes?.([...conteudoPlanoIdsPendentes, ...selecionados])
      setSelecionados(new Set())
      setModalAberto(false)
      return
    }

    try {
      await Promise.all(
        [...selecionados].map((conteudoId) => servicoQuestoes.vincularConteudo(questaoId, conteudoId)),
      )
      toast.success('Conteúdo vinculado à questão')
      setSelecionados(new Set())
      setModalAberto(false)
      await requisicaoVinculos.reload()
    } catch (erro) {
      toast.error('Não foi possível vincular', erro instanceof ApiError ? erro.message : undefined)
    }
  })

  async function desvincular(conteudoPlanoId: number) {
    if (!questaoId) {
      onChangePendentes?.(conteudoPlanoIdsPendentes.filter((id) => id !== conteudoPlanoId))
      return
    }

    try {
      await servicoQuestoes.desvincularConteudo(questaoId, conteudoPlanoId)
      toast.success('Conteúdo removido da questão')
      await requisicaoVinculos.reload()
    } catch (erro) {
      toast.error('Não foi possível remover', erro instanceof ApiError ? erro.message : undefined)
    }
  }

  return (
    <S.SecaoVinculo>
      <S.CabecalhoVinculo>
        <S.TituloVinculo>Conteúdo</S.TituloVinculo>

        {!somenteLeitura && (
          <Button
            size="small"
            icon={<ListTree />}
            disabled={!disciplinaId}
            onClick={() => setModalAberto(true)}
          >
            Vincular conteúdo
          </Button>
        )}
      </S.CabecalhoVinculo>

      {!disciplinaId ? (
        <S.DicaVinculo>Selecione a disciplina do simulado para vincular conteúdos.</S.DicaVinculo>
      ) : conteudosVinculados.length === 0 ? (
        <S.DicaVinculo>
          Nenhum conteúdo vinculado — sem isso, esta questão fica fora do cálculo de desempenho por conteúdo.
        </S.DicaVinculo>
      ) : (
        <S.ChipsVinculo>
          {conteudosVinculados.map((conteudo) => (
            <Chip
              key={conteudo.id}
              variant="neutral"
              onRemove={somenteLeitura ? undefined : () => desvincular(conteudo.id)}
              rotuloRemover={`Remover ${conteudo.titulo}`}
            >
              {conteudo.titulo ?? 'Conteúdo'}
            </Chip>
          ))}
        </S.ChipsVinculo>
      )}

      <Modal
        aberto={modalAberto}
        onClose={() => setModalAberto(false)}
        titulo="Vincular conteúdo"
        descricao="Selecione um ou mais conteúdos do plano de ensino desta disciplina para vincular a esta questão."
        largura="600px"
        rodape={
          <>
            <Button variant="secondary" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button variant="success" loading={vinculando} disabled={selecionados.size === 0} onClick={vincular}>
              Salvar
            </Button>
          </>
        }
      >
        {conteudosDisponiveis.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum conteúdo disponível"
            descricao="Todos os conteúdos desta disciplina já foram vinculados, ou ainda não há plano de ensino cadastrado para ela."
            icon={<ListTree />}
          />
        ) : (
          <S.Coluna>
            {conteudosDisponiveis.map((conteudo) => (
              <CheckBox
                key={conteudo.id}
                label={`${conteudo.ordem ? `${conteudo.ordem}. ` : ''}${conteudo.titulo ?? 'Conteúdo'}`}
                checked={selecionados.has(conteudo.id)}
                onChange={() => alternarSelecionado(conteudo.id)}
              />
            ))}
          </S.Coluna>
        )}
      </Modal>
    </S.SecaoVinculo>
  )
}
