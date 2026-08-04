import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { ListTree, Pencil, Plus, Save, Trash2 } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { BuscaInput } from '../../../components/ui/BuscaInput'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { IconButton } from '../../../components/ui/IconButton'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { Tag } from '../../../components/ui/Tag'
import { TextArea } from '../../../components/ui/TextArea'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useDebounce } from '../../../hooks/useDebounce'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { conteudosPlano, planosEnsino } from '../../../services/endpoints'
import { formatarCargaHoraria, normalizar } from '../../../utils/format'
import type { ConteudoPlano } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

const CorpoModal = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.xs};
`

const Grade = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
`

const FORMULARIO_VAZIO = { ordem: '', titulo: '', descricao: '', cargaHoraria: '' }

/**
 * Conteúdos de um plano de ensino.
 *
 * A qualidade da descrição importa: é a partir dela que o módulo de IA gera as
 * questões dos simulados de reforço (ia/service/GeracaoQuestaoIAService).
 */
export default function ConteudosPlano() {
  const { planoId } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const idPlano = Number(planoId)

  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)
  const [modalAberto, setModalAberto] = useState(false)
  const [emEdicao, setEmEdicao] = useState<ConteudoPlano | null>(null)
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO)
  const [erros, setErros] = useState<Record<string, string | undefined>>({})
  const [salvando, setSalvando] = useState(false)

  const requisicaoPlano = useRequisicao(() => planosEnsino.buscar(idPlano), [idPlano])
  const requisicaoConteudos = useRequisicao(() => conteudosPlano.listar(), [])

  const conteudos = useMemo(
    () =>
      (requisicaoConteudos.data ?? [])
        .filter((conteudo) => conteudo.planoEnsino?.id === idPlano)
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)),
    [requisicaoConteudos.data, idPlano],
  )

  const filtrados = useMemo(() => {
    if (!buscaAtrasada.trim()) return conteudos

    const termo = normalizar(buscaAtrasada)
    return conteudos.filter(
      (conteudo) => normalizar(conteudo.titulo).includes(termo) || normalizar(conteudo.descricao).includes(termo),
    )
  }, [conteudos, buscaAtrasada])

  const proximaOrdem = useMemo(
    () => (conteudos.length === 0 ? 1 : Math.max(...conteudos.map((c) => c.ordem ?? 0)) + 1),
    [conteudos],
  )

  function abrirNovo() {
    setEmEdicao(null)
    setFormulario({ ...FORMULARIO_VAZIO, ordem: String(proximaOrdem) })
    setErros({})
    setModalAberto(true)
  }

  function abrirEdicao(conteudo: ConteudoPlano) {
    setEmEdicao(conteudo)
    setFormulario({
      ordem: conteudo.ordem?.toString() ?? '',
      titulo: conteudo.titulo ?? '',
      descricao: conteudo.descricao ?? '',
      cargaHoraria: conteudo.cargaHoraria?.toString() ?? '',
    })
    setErros({})
    setModalAberto(true)
  }

  function validar() {
    const encontrados: Record<string, string | undefined> = {}

    if (!formulario.titulo.trim()) encontrados.titulo = 'Informe o título do conteúdo'

    if (!formulario.descricao.trim()) {
      encontrados.descricao = 'Descreva o conteúdo — a IA usa este texto para gerar as questões'
    } else if (formulario.descricao.trim().length < 30) {
      encontrados.descricao = 'Descreva com mais detalhe (mínimo de 30 caracteres)'
    }

    if (formulario.ordem && (!Number.isInteger(Number(formulario.ordem)) || Number(formulario.ordem) <= 0)) {
      encontrados.ordem = 'A ordem deve ser um número inteiro positivo'
    }

    setErros(encontrados)
    return Object.keys(encontrados).filter((chave) => encontrados[chave]).length === 0
  }

  async function salvar() {
    if (!validar() || !requisicaoPlano.data) return

    setSalvando(true)

    try {
      const corpo = {
        planoEnsino: requisicaoPlano.data,
        titulo: formulario.titulo.trim(),
        descricao: formulario.descricao.trim(),
        ordem: formulario.ordem ? Number(formulario.ordem) : undefined,
        cargaHoraria: formulario.cargaHoraria ? Number(formulario.cargaHoraria) : undefined,
        status: 'ATIVO' as const,
      }

      if (emEdicao) {
        await conteudosPlano.atualizar(emEdicao.id, corpo)
      } else {
        await conteudosPlano.criar(corpo)
      }

      toast.success(emEdicao ? 'Conteúdo atualizado' : 'Conteúdo adicionado', corpo.titulo)
      setModalAberto(false)
      await requisicaoConteudos.reload()
    } catch (erroSalvar) {
      toast.error(
        'Não foi possível salvar',
        erroSalvar instanceof ApiError ? erroSalvar.message : undefined,
      )
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(conteudo: ConteudoPlano) {
    const confirmado = await confirmar({
      titulo: 'Excluir conteúdo?',
      descricao: `"${conteudo.titulo}" será desativado. Aulas que já o referenciam continuam válidas.`,
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
    })

    if (!confirmado) return

    try {
      await conteudosPlano.excluir(conteudo.id)
      toast.success('Conteúdo excluído')
      await requisicaoConteudos.reload()
    } catch (erroExclusao) {
      toast.error(
        'Não foi possível excluir',
        erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
      )
    }
  }

  const colunas: Coluna<ConteudoPlano>[] = [
    {
      key: 'ordem',
      cabecalho: '#',
      largura: '64px',
      alinhamento: 'center',
      render: (conteudo) => <Tag variant="purple">{conteudo.ordem ?? '—'}</Tag>,
    },
    {
      key: 'titulo',
      cabecalho: 'Título',
      render: (conteudo) => conteudo.titulo ?? '—',
    },
    {
      key: 'descricao',
      cabecalho: 'Descrição',
      ocultarEmTelaPequena: true,
      render: (conteudo) => (
        <span
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {conteudo.descricao ?? '—'}
        </span>
      ),
    },
    {
      key: 'carga',
      cabecalho: 'Carga',
      render: (conteudo) => formatarCargaHoraria(conteudo.cargaHoraria),
    },
  ]

  if (requisicaoPlano.error) {
    return (
      <Layout>
        <Header titulo="Conteúdos do plano" voltarPara="/professor/plano-ensino" />
        <ErroCarregamento
          mensagem={requisicaoPlano.error}
          onRetry={requisicaoPlano.reload}
        />
      </Layout>
    )
  }

  const plano = requisicaoPlano.data

  return (
    <Layout>
      <Header
        titulo="Conteúdos do plano de ensino"
        subtitulo={
          plano && (
            <>
              <strong>{plano.titulo ?? `Plano #${plano.id}`}</strong>
              <Tag variant="neutral">{plano.periodoLetivo}</Tag>
              {plano.curso?.nome && <span>{plano.curso.nome}</span>}
            </>
          )
        }
        voltarPara="/professor/plano-ensino"
        rotuloVoltar="Voltar para planos de ensino"
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Pencil />}
              onClick={() => navegar(`/professor/plano-ensino/${idPlano}`)}
            >
              Editar plano
            </Button>
            <Button icon={<Plus />} onClick={abrirNovo}>
              Adicionar conteúdo
            </Button>
          </>
        }
        filtros={<BuscaInput value={busca} onChange={setBusca} placeholder="Buscar conteúdo..." />}
      />

      <Card semPadding>
        <DataTable
          descricao="Conteúdos do plano de ensino"
          columns={colunas}
          data={filtrados}
          rowKey={(conteudo) => conteudo.id}
          loading={requisicaoConteudos.loading}
          error={requisicaoConteudos.error}
          onReload={requisicaoConteudos.reload}
          onRowClick={abrirEdicao}
          empty={{
            titulo: busca ? 'Nenhum conteúdo encontrado' : 'Nenhum conteúdo cadastrado',
            descricao: busca
              ? 'Revise o termo buscado ou limpe o filtro.'
              : 'Os conteúdos organizam o plano em unidades e alimentam a geração de questões pela IA.',
            icon: <ListTree />,
            acao: !busca && (
              <Button icon={<Plus />} onClick={abrirNovo}>
                Adicionar conteúdo
              </Button>
            ),
          }}
          actions={(conteudo) => (
            <>
              <IconButton label="Editar conteúdo" icon={<Pencil />} onClick={() => abrirEdicao(conteudo)} />
              <IconButton
                label="Excluir conteúdo"
                icon={<Trash2 />}
                variant="danger"
                onClick={() => excluir(conteudo)}
              />
            </>
          )}
        />
      </Card>

      <Modal
        aberto={modalAberto}
        onClose={() => setModalAberto(false)}
        titulo={emEdicao ? 'Editar conteúdo' : 'Novo conteúdo'}
        descricao="Quanto mais específica a descrição, melhores as questões geradas pela IA."
        largura="640px"
        bloqueado={salvando}
        rodape={
          <>
            <Button variant="danger" onClick={() => setModalAberto(false)} disabled={salvando}>
              Cancelar
            </Button>
            <Button variant="success" icon={<Save />} loading={salvando} onClick={salvar}>
              Salvar
            </Button>
          </>
        }
      >
        <CorpoModal>
          <Grade>
            <Input
              label="Ordem"
              type="number"
              min={1}
              value={formulario.ordem}
              error={erros.ordem}
              disabled={salvando}
              hint="Define a sequência das unidades."
              onChange={(evento) => setFormulario((atual) => ({ ...atual, ordem: evento.target.value }))}
            />

            <Input
              label="Carga horária"
              type="number"
              min={1}
              placeholder="Ex.: 8"
              value={formulario.cargaHoraria}
              disabled={salvando}
              hint="Em horas."
              onChange={(evento) =>
                setFormulario((atual) => ({ ...atual, cargaHoraria: evento.target.value }))
              }
            />
          </Grade>

          <Input
            label="Título"
            required
            placeholder="Ex.: Unidade 1 — Introdução à lógica"
            value={formulario.titulo}
            error={erros.titulo}
            disabled={salvando}
            maxLength={150}
            onChange={(evento) => setFormulario((atual) => ({ ...atual, titulo: evento.target.value }))}
          />

          <TextArea
            label="Descrição detalhada"
            required
            placeholder="Descreva os tópicos trabalhados, exemplos e o nível esperado. Este texto é o insumo da IA para gerar questões alinhadas ao que foi ensinado."
            value={formulario.descricao}
            error={erros.descricao}
            disabled={salvando}
            maxLength={2000}
            rows={6}
            autoAltura
            onChange={(evento) =>
              setFormulario((atual) => ({ ...atual, descricao: evento.target.value }))
            }
          />
        </CorpoModal>
      </Modal>
    </Layout>
  )
}
