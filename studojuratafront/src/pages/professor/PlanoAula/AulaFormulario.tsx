import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { ListTree, Save, Trash2 } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { CheckBox } from '../../../components/ui/CheckBox'
import { Chip } from '../../../components/ui/Chip'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Header } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { TextArea } from '../../../components/ui/TextArea'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useHidratar } from '../../../hooks/useHidratar'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { aulas as servicoAulas, conteudosPlano, planosAula } from '../../../services/endpoints'
import { theme as tokens } from '../../../styles/theme'

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`

export default function AulaFormulario() {
  const { planoAulaId, aulaId } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const idPlano = Number(planoAulaId)
  const edicao = Boolean(aulaId)
  const idAula = aulaId ? Number(aulaId) : null

  const [ordem, setOrdem] = useState('')
  const [titulo, setTitulo] = useState('')
  const [dataPrevista, setDataPrevista] = useState('')
  const [dataPublicacao, setDataPublicacao] = useState('')
  const [cargaHoraria, setCargaHoraria] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [erros, setErros] = useState<Record<string, string | undefined>>({})
  const [modalConteudoAberto, setModalConteudoAberto] = useState(false)
  const [conteudosSelecionados, setConteudosSelecionados] = useState<Set<number>>(new Set())

  const requisicaoPlano = useRequisicao(() => planosAula.buscar(idPlano), [idPlano])
  const requisicaoAula = useRequisicao(() => servicoAulas.buscar(idAula as number), [idAula], {
    ativo: Boolean(idAula),
  })
  const requisicaoAulas = useRequisicao(() => servicoAulas.listarPorPlanoAula(idPlano), [idPlano])

  const requisicaoConteudosAula = useRequisicao(
    () => servicoAulas.listarConteudos(idAula as number),
    [idAula],
    { ativo: Boolean(idAula) },
  )
  const requisicaoConteudosPlano = useRequisicao(() => conteudosPlano.listar(), [], {
    ativo: modalConteudoAberto,
  })

  useHidratar(requisicaoAula.data, (aula) => {
    setOrdem(aula.ordem?.toString() ?? '')
    setTitulo(aula.titulo ?? '')
    setDataPrevista(aula.dataPrevista?.slice(0, 10) ?? '')
    setDataPublicacao(aula.dataPublicacao?.slice(0, 10) ?? '')
    setCargaHoraria(aula.cargaHoraria?.toString() ?? '')
    setObservacoes(aula.observacoes ?? '')
  })

  const proximaOrdem = useMemo(() => {
    const existentes = (requisicaoAulas.data ?? []).map((aula) => aula.ordem ?? 0)
    return existentes.length === 0 ? 1 : Math.max(...existentes) + 1
  }, [requisicaoAulas.data])

  // Em uma aula nova o campo aparece já preenchido com a próxima ordem livre,
  // sem precisar de estado extra: a sugestão só vale enquanto nada foi digitado.
  const ordemExibida = ordem || (edicao ? '' : String(proximaOrdem))

  const conteudosDisponiveis = useMemo(() => {
    if (!requisicaoPlano.data) return []

    const vinculados = new Set((requisicaoConteudosAula.data ?? []).map((item) => item.conteudoPlano?.id))

    return (requisicaoConteudosPlano.data ?? [])
      .filter(
        (conteudo) =>
          conteudo.planoEnsino?.id === requisicaoPlano.data?.planoEnsino?.id &&
          conteudo.status !== 'INATIVO' &&
          !vinculados.has(conteudo.id),
      )
      .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
  }, [requisicaoConteudosPlano.data, requisicaoConteudosAula.data, requisicaoPlano.data])

  function validar() {
    const encontrados: Record<string, string | undefined> = {}

    if (!titulo.trim()) encontrados.titulo = 'Informe o título da aula'

    if (ordemExibida && (!Number.isInteger(Number(ordemExibida)) || Number(ordemExibida) <= 0)) {
      encontrados.ordem = 'A ordem deve ser um número inteiro positivo'
    }

    if (cargaHoraria && (!Number.isFinite(Number(cargaHoraria)) || Number(cargaHoraria) <= 0)) {
      encontrados.cargaHoraria = 'Informe um número de horas maior que zero'
    }

    // Ordem duplicada confunde a sequência exibida na listagem.
    const duplicada = (requisicaoAulas.data ?? []).some(
      (aula) => aula.ordem === Number(ordemExibida) && aula.id !== idAula && aula.status !== 'INATIVO',
    )

    if (ordemExibida && duplicada) encontrados.ordem = 'Já existe uma aula com esta ordem'

    setErros(encontrados)
    return Object.keys(encontrados).filter((chave) => encontrados[chave]).length === 0
  }

  const { executar: salvar, executando: salvando } = useAcao(async () => {
    if (!validar() || !requisicaoPlano.data) return

    try {
      const corpo = {
        planoAula: requisicaoPlano.data,
        titulo: titulo.trim(),
        ordem: ordemExibida ? Number(ordemExibida) : undefined,
        dataPrevista: dataPrevista || undefined,
        dataPublicacao: dataPublicacao || undefined,
        cargaHoraria: cargaHoraria ? Number(cargaHoraria) : undefined,
        observacoes: observacoes.trim() || undefined,
        status: 'ATIVO' as const,
      }

      if (edicao) {
        await servicoAulas.atualizar(idAula as number, corpo)
      } else {
        await servicoAulas.criar(corpo)
      }

      toast.success(edicao ? 'Aula atualizada' : 'Aula criada', corpo.titulo)
      navegar(`/professor/plano-aula/${idPlano}/aulas`)
    } catch (erroSalvar) {
      toast.error(
        'Não foi possível salvar',
        erroSalvar instanceof ApiError ? erroSalvar.message : undefined,
      )
    }
  })

  const { executar: excluir, executando: excluindo } = useAcao(async () => {
    if (!idAula) return

    await confirmar({
      titulo: 'Excluir aula?',
      descricao: 'Frequências e conteúdos já registrados são preservados.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoAulas.excluir(idAula)
          toast.success('Aula excluída')
          navegar(`/professor/plano-aula/${idPlano}/aulas`)
        } catch (erroExclusao) {
          toast.error(
            'Não foi possível excluir',
            erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
          )
        }
      },
    })
  })

  function alternarConteudoSelecionado(id: number) {
    setConteudosSelecionados((atuais) => {
      const novos = new Set(atuais)
      if (novos.has(id)) novos.delete(id)
      else novos.add(id)
      return novos
    })
  }

  const { executar: vincularConteudos, executando: vinculando } = useAcao(async () => {
    if (!idAula || conteudosSelecionados.size === 0) return

    try {
      await Promise.all(
        [...conteudosSelecionados].map((conteudoId) => servicoAulas.vincularConteudo(idAula, conteudoId)),
      )
      toast.success('Conteúdo vinculado à aula')
      setConteudosSelecionados(new Set())
      setModalConteudoAberto(false)
      await requisicaoConteudosAula.reload()
    } catch (erroVincular) {
      toast.error('Não foi possível vincular', erroVincular instanceof ApiError ? erroVincular.message : undefined)
    }
  })

  async function desvincularConteudo(conteudoPlanoId: number) {
    if (!idAula) return

    try {
      await servicoAulas.desvincularConteudo(idAula, conteudoPlanoId)
      toast.success('Conteúdo removido da aula')
      await requisicaoConteudosAula.reload()
    } catch (erroRemover) {
      toast.error('Não foi possível remover', erroRemover instanceof ApiError ? erroRemover.message : undefined)
    }
  }

  if (requisicaoPlano.error) {
    return (
      <Layout>
        <Header titulo="Aula" voltarPara="/professor/plano-aula" />
        <ErroCarregamento
          mensagem={requisicaoPlano.error}
          onRetry={requisicaoPlano.reload}
        />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo={edicao ? 'Editar aula' : 'Nova aula'}
        subtitulo={requisicaoPlano.data?.turmaDisciplina?.turma?.titulo}
        voltarPara={`/professor/plano-aula/${idPlano}/aulas`}
        rotuloVoltar="Voltar para as aulas"
        actions={
          <>
            {edicao && (
              <Button
                size="large"
                variant="danger"
                icon={<Trash2 />}
                loading={excluindo}
                onClick={excluir}
                disabled={salvando}
              >
                Excluir
              </Button>
            )}
            <Button
              size="large"
              variant="danger"
              onClick={() => navegar(`/professor/plano-aula/${idPlano}/aulas`)}
              disabled={salvando || excluindo}
            >
              Cancelar
            </Button>
            <Button
              size="large"
              variant="success"
              icon={<Save />}
              loading={salvando}
              disabled={excluindo}
              onClick={salvar}
            >
              Salvar
            </Button>
          </>
        }
      />

      {edicao && requisicaoAula.loading ? (
        <SkeletonCartao />
      ) : (
        <Card titulo="Dados da aula">
          <Coluna>
            <Input
              label="Título da aula"
              required
              placeholder="Ex.: Aula 1 — Primeiros comandos"
              value={titulo}
              error={erros.titulo}
              disabled={salvando}
              maxLength={150}
              onChange={(evento) => setTitulo(evento.target.value)}
            />

            <Grade>
              <Input
                label="Ordem"
                type="number"
                min={1}
                value={ordemExibida}
                error={erros.ordem}
                disabled={salvando}
                hint="Sequência da aula no plano."
                onChange={(evento) => setOrdem(evento.target.value)}
              />

              <Input
                label="Quantidade de horários"
                type="number"
                min={1}
                placeholder="Ex.: 2"
                value={cargaHoraria}
                error={erros.cargaHoraria}
                disabled={salvando}
                onChange={(evento) => setCargaHoraria(evento.target.value)}
              />

              <DatePicker
                label="Data prevista"
                value={dataPrevista}
                disabled={salvando}
                onChange={(evento) => setDataPrevista(evento.target.value)}
              />
            </Grade>

            <div>
              <Button
                icon={<ListTree />}
                disabled={!idAula}
                onClick={() => setModalConteudoAberto(true)}
              >
                Vincular conteúdo do plano de ensino
              </Button>
              {!idAula && (
                <div style={{ fontSize: '12px', color: tokens.colors.textTertiary, marginTop: '4px' }}>
                  Salve a aula antes de vincular conteúdos.
                </div>
              )}
            </div>

            {idAula && !requisicaoConteudosAula.isEmpty && (
              <Chips>
                {(requisicaoConteudosAula.data ?? []).map((vinculo) => (
                  <Chip
                    key={vinculo.id}
                    variant="neutral"
                    onRemove={() => desvincularConteudo(vinculo.conteudoPlano.id)}
                    rotuloRemover={`Remover ${vinculo.conteudoPlano?.titulo}`}
                  >
                    {vinculo.conteudoPlano?.titulo ?? 'Conteúdo'}
                  </Chip>
                ))}
              </Chips>
            )}

            <DatePicker
              label="Data publicação"
              value={dataPublicacao}
              disabled={salvando}
              hint="Quando a aula foi (ou será) efetivamente ministrada."
              onChange={(evento) => setDataPublicacao(evento.target.value)}
            />

            <TextArea
              label="Observações"
              placeholder="Materiais necessários, combinados com a turma, adaptações..."
              value={observacoes}
              disabled={salvando}
              maxLength={2000}
              rows={4}
              autoAltura
              onChange={(evento) => setObservacoes(evento.target.value)}
            />
          </Coluna>
        </Card>
      )}

      <Modal
        aberto={modalConteudoAberto}
        onClose={() => setModalConteudoAberto(false)}
        titulo="Vincular conteúdo"
        descricao="Selecione um ou mais conteúdos do plano de ensino para vincular a esta aula."
        largura="600px"
        rodape={
          <>
            <Button variant="secondary" onClick={() => setModalConteudoAberto(false)}>
              Cancelar
            </Button>
            <Button
              loading={vinculando}
              disabled={conteudosSelecionados.size === 0}
              onClick={vincularConteudos}
            >
              Salvar
            </Button>
          </>
        }
      >
        {requisicaoConteudosPlano.isEmpty ? (
          <EstadoVazio
            titulo="Nenhum conteúdo disponível"
            descricao="Todos os conteúdos do plano de ensino já foram vinculados a esta aula."
            icon={<ListTree />}
          />
        ) : (
          <Coluna>
            {conteudosDisponiveis.map((conteudo) => (
              <CheckBox
                key={conteudo.id}
                label={`${conteudo.ordem ? `${conteudo.ordem}. ` : ''}${conteudo.titulo ?? 'Conteúdo'}`}
                checked={conteudosSelecionados.has(conteudo.id)}
                onChange={() => alternarConteudoSelecionado(conteudo.id)}
              />
            ))}
          </Coluna>
        )}
      </Modal>
    </Layout>
  )
}
