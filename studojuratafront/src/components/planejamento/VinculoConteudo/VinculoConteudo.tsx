import { useMemo, useState } from 'react'
import { ListTree } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { CheckBox } from '@/components/ui/CheckBox'
import { Chip } from '@/components/ui/Chip'
import { Modal } from '@/components/ui/Modal'
import { EstadoVazio } from '@/components/feedback/EstadoVazio'
import { useToast } from '@/contexts/toast/toastContexto'
import { useAcao, useRequisicao } from '@/hooks/useRequisicao'
import { ApiError } from '@/dominios/comum/api'
import { conteudosPlano } from '@/dominios/planejamento/service'
import type { ConteudoPlano } from '@/dominios/planejamento/types'
import * as S from './styles'
import { Stack } from '@/components/ui/Stack'

import type { VinculoConteudoProps } from './types'

export function VinculoConteudo({
  entidadeId,
  escopoId,
  pertenceAoEscopo,
  servico,
  textos,
  exigirEntidade = false,
  somenteLeitura = false,
  conteudoPlanoIdsPendentes = [],
  onChangePendentes,
}: VinculoConteudoProps) {
  const toast = useToast()
  const [modalAberto, setModalAberto] = useState(false)
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set())

  const requisicaoVinculos = useRequisicao(
    () => servico.listarConteudos(entidadeId as number),
    [entidadeId],
    { ativo: Boolean(entidadeId) },
  )

  const requisicaoConteudos = useRequisicao(() => conteudosPlano.listar(), [], { ativo: Boolean(escopoId) })

  const conteudosVinculados = useMemo(() => {
    if (entidadeId) {
      return (requisicaoVinculos.data ?? [])
        .map((vinculo) => vinculo.conteudoPlano)
        .filter((item): item is ConteudoPlano => Boolean(item))
    }

    const porId = new Map((requisicaoConteudos.data ?? []).map((conteudo) => [conteudo.id, conteudo]))
    return conteudoPlanoIdsPendentes
      .map((id) => porId.get(id))
      .filter((item): item is ConteudoPlano => Boolean(item))
  }, [entidadeId, requisicaoVinculos.data, requisicaoConteudos.data, conteudoPlanoIdsPendentes])

  const vinculadosIds = useMemo(() => new Set(conteudosVinculados.map((item) => item.id)), [conteudosVinculados])

  const conteudosDisponiveis = useMemo(() => {
    if (!escopoId) return []

    return (requisicaoConteudos.data ?? [])
      .filter(
        (conteudo) =>
          pertenceAoEscopo(conteudo) &&
          conteudo.status !== 'INATIVO' &&
          !vinculadosIds.has(conteudo.id),
      )
      .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
  }, [requisicaoConteudos.data, vinculadosIds, escopoId, pertenceAoEscopo])

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

    if (!entidadeId) {
      onChangePendentes?.([...conteudoPlanoIdsPendentes, ...selecionados])
      setSelecionados(new Set())
      setModalAberto(false)
      return
    }

    try {
      await Promise.all(
        [...selecionados].map((conteudoId) => servico.vincularConteudo(entidadeId, conteudoId)),
      )
      toast.success(textos.vinculado)
      setSelecionados(new Set())
      setModalAberto(false)
      await requisicaoVinculos.reload()
    } catch (erro) {
      toast.error('Não foi possível vincular', erro instanceof ApiError ? erro.message : undefined)
    }
  })

  async function desvincular(conteudoPlanoId: number) {
    if (!entidadeId) {
      onChangePendentes?.(conteudoPlanoIdsPendentes.filter((id) => id !== conteudoPlanoId))
      return
    }

    try {
      await servico.desvincularConteudo(entidadeId, conteudoPlanoId)
      toast.success(textos.removido)
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
            disabled={exigirEntidade ? !entidadeId : !escopoId}
            onClick={() => setModalAberto(true)}
          >
            Vincular conteúdo
          </Button>
        )}
      </S.CabecalhoVinculo>

      {exigirEntidade && !entidadeId ? (
        <S.DicaVinculo>{textos.semEntidade}</S.DicaVinculo>
      ) : !escopoId ? (
        <S.DicaVinculo>{textos.semEscopo}</S.DicaVinculo>
      ) : conteudosVinculados.length === 0 ? (
        <S.DicaVinculo>{textos.semVinculos}</S.DicaVinculo>
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
        descricao={textos.descricaoModal}
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
            descricao={textos.modalVazio}
            icon={<ListTree />}
          />
        ) : (
          <Stack gap="md">
            {conteudosDisponiveis.map((conteudo) => (
              <CheckBox
                key={conteudo.id}
                label={`${conteudo.ordem ? `${conteudo.ordem}. ` : ''}${conteudo.titulo ?? 'Conteúdo'}`}
                checked={selecionados.has(conteudo.id)}
                onChange={() => alternarSelecionado(conteudo.id)}
              />
            ))}
          </Stack>
        )}
      </Modal>
    </S.SecaoVinculo>
  )
}
