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
import { aulas as servicoAulas, conteudosPlano } from '../../../services/endpoints'
import type { ConteudoPlano } from '../../../types'
import * as S from './styles'

interface VinculoConteudoAulaProps {
  /** Ausente quando a aula ainda não foi salva — nesse caso o componente entra em modo local, ver conteudoPlanoIdsPendentes/onChangePendentes. */
  aulaId?: number
  /** Escopo do seletor: só conteúdos deste plano de ensino aparecem como opção. */
  planoEnsinoId?: number | null
  somenteLeitura?: boolean
  /** Modo local (sem aulaId ainda): ids escolhidos ficam só no estado do formulário pai, comitados via API assim que a aula for salva e ganhar id — mesmo princípio de VinculoConteudoQuestao. */
  conteudoPlanoIdsPendentes?: number[]
  onChangePendentes?: (ids: number[]) => void
  /**
   * false em telas onde a aula é sempre escolhida entre as já existentes,
   * nunca criada aqui (RegistrarAulaTurma) — sem aulaId o botão fica
   * bloqueado em vez de abrir o modo local, porque não existe um "salvar"
   * nesta tela capaz de comitar os pendentes depois. Default true
   * (AulaFormulario, que cria a aula).
   */
  permitirModoLocal?: boolean
}

/**
 * Vincula/desvincula a aula a conteúdo(s) do plano de ensino — mesma "seção"
 * (título + botão + chips, ver ./styles) usada por VinculoConteudoQuestao,
 * mesmo par de entidades (X vinculado a ConteudoPlano). Usada tanto em
 * AulaFormulario (cadastro/edição da aula) quanto em RegistrarAulaTurma
 * (registro de conteúdo/chamada de uma aula já existente).
 *
 * Sem `aulaId` (aula nova, ainda não salva) o componente não bloqueia a
 * escolha de conteúdo esperando o professor salvar antes — mesmo
 * impedimento identificado no fluxo de questão: escolher fica só no estado
 * local (`conteudoPlanoIdsPendentes`/`onChangePendentes`, controlado pelo
 * formulário pai) até a aula existir de verdade.
 */
export function VinculoConteudoAula({
  aulaId,
  planoEnsinoId,
  somenteLeitura = false,
  conteudoPlanoIdsPendentes = [],
  onChangePendentes,
  permitirModoLocal = true,
}: VinculoConteudoAulaProps) {
  const toast = useToast()
  const [modalAberto, setModalAberto] = useState(false)
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set())

  const requisicaoVinculos = useRequisicao(
    () => servicoAulas.listarConteudos(aulaId as number),
    [aulaId],
    { ativo: Boolean(aulaId) },
  )

  // Precisa dos títulos tanto pro checklist do modal quanto pros chips já
  // escolhidos no modo local (sem aulaId) — carrega assim que o plano de
  // ensino é conhecido, não só quando o modal abre.
  const requisicaoConteudos = useRequisicao(() => conteudosPlano.listar(), [], { ativo: Boolean(planoEnsinoId) })

  const conteudosVinculados = useMemo(() => {
    if (aulaId) {
      return (requisicaoVinculos.data ?? [])
        .map((vinculo) => vinculo.conteudoPlano)
        .filter((item): item is ConteudoPlano => Boolean(item))
    }

    const porId = new Map((requisicaoConteudos.data ?? []).map((conteudo) => [conteudo.id, conteudo]))
    return conteudoPlanoIdsPendentes
      .map((id) => porId.get(id))
      .filter((item): item is ConteudoPlano => Boolean(item))
  }, [aulaId, requisicaoVinculos.data, requisicaoConteudos.data, conteudoPlanoIdsPendentes])

  const vinculadosIds = useMemo(() => new Set(conteudosVinculados.map((item) => item.id)), [conteudosVinculados])

  const conteudosDisponiveis = useMemo(() => {
    if (!planoEnsinoId) return []

    return (requisicaoConteudos.data ?? [])
      .filter(
        (conteudo) =>
          conteudo.planoEnsino?.id === planoEnsinoId &&
          conteudo.status !== 'INATIVO' &&
          !vinculadosIds.has(conteudo.id),
      )
      .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
  }, [requisicaoConteudos.data, vinculadosIds, planoEnsinoId])

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

    if (!aulaId) {
      onChangePendentes?.([...conteudoPlanoIdsPendentes, ...selecionados])
      setSelecionados(new Set())
      setModalAberto(false)
      return
    }

    try {
      await Promise.all(
        [...selecionados].map((conteudoId) => servicoAulas.vincularConteudo(aulaId, conteudoId)),
      )
      toast.success('Conteúdo vinculado à aula')
      setSelecionados(new Set())
      setModalAberto(false)
      await requisicaoVinculos.reload()
    } catch (erro) {
      toast.error('Não foi possível vincular', erro instanceof ApiError ? erro.message : undefined)
    }
  })

  async function desvincular(conteudoPlanoId: number) {
    if (!aulaId) {
      onChangePendentes?.(conteudoPlanoIdsPendentes.filter((id) => id !== conteudoPlanoId))
      return
    }

    try {
      await servicoAulas.desvincularConteudo(aulaId, conteudoPlanoId)
      toast.success('Conteúdo removido da aula')
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
            disabled={permitirModoLocal ? !planoEnsinoId : !aulaId}
            onClick={() => setModalAberto(true)}
          >
            Vincular conteúdo
          </Button>
        )}
      </S.CabecalhoVinculo>

      {!permitirModoLocal && !aulaId ? (
        <S.DicaVinculo>Selecione uma aula do plano para vincular conteúdos.</S.DicaVinculo>
      ) : !planoEnsinoId ? (
        <S.DicaVinculo>Esta turma ainda não tem plano de ensino — vincule um antes de registrar conteúdo.</S.DicaVinculo>
      ) : conteudosVinculados.length === 0 ? (
        <S.DicaVinculo>
          Nenhum conteúdo registrado — registrar o conteúdo alimenta o histórico do aluno e a repetição espaçada da IA.
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
        descricao="Selecione um ou mais conteúdos do plano de ensino para vincular a esta aula."
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
            descricao="Todos os conteúdos do plano de ensino já foram vinculados a esta aula."
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
