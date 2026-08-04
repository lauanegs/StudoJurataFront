import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { CalendarDays, Check, Pencil, Plus, Trash2 } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { BuscaInput } from '../../../components/ui/BuscaInput'
import { Button } from '../../../components/ui/Button'
import { CheckBox } from '../../../components/ui/CheckBox'
import { DataTable } from '../../../components/ui/DataTable'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Header } from '../../../components/ui/Header'
import { IconButton } from '../../../components/ui/IconButton'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { Tab } from '../../../components/ui/Tab'
import { Tag } from '../../../components/ui/Tag'
import { TextArea } from '../../../components/ui/TextArea'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useDebounce } from '../../../hooks/useDebounce'
import { usePaginacao } from '../../../hooks/usePaginacao'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { eventos as servicoEventos } from '../../../services/endpoints'
import { deInputDataHora, formatarDataHora, normalizar, paraInputDataHora } from '../../../utils/format'
import type { Evento } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

const CorpoModal = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.xs};
`

type Filtro = 'todos' | 'pendentes' | 'concluidos'

const FORMULARIO_VAZIO = { dataHorario: '', titulo: '', descricao: '', concluido: false }

export default function Eventos() {
  const toast = useToast()
  const confirmar = useConfirm()

  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)

  const [modalAberto, setModalAberto] = useState(false)
  const [emEdicao, setEmEdicao] = useState<Evento | null>(null)
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO)
  const [erros, setErros] = useState<{ titulo?: string; dataHorario?: string }>({})
  const [salvando, setSalvando] = useState(false)

  const { data, loading, error, reload } = useRequisicao(() => servicoEventos.listar(), [])

  const filtrados = useMemo(() => {
    let lista = data ?? []

    if (filtro === 'pendentes') lista = lista.filter((evento) => !evento.concluido)
    if (filtro === 'concluidos') lista = lista.filter((evento) => evento.concluido)

    if (buscaAtrasada.trim()) {
      const termo = normalizar(buscaAtrasada)
      lista = lista.filter(
        (evento) =>
          normalizar(evento.titulo).includes(termo) || normalizar(evento.descricao).includes(termo),
      )
    }

    // Mais próximos primeiro — o back devolve sem ordenação garantida.
    return [...lista].sort(
      (a, b) => new Date(a.dataHorario).getTime() - new Date(b.dataHorario).getTime(),
    )
  }, [data, filtro, buscaAtrasada])

  const paginacao = usePaginacao(filtrados)

  const contadores = useMemo(() => {
    const lista = data ?? []
    return {
      todos: lista.length,
      pendentes: lista.filter((evento) => !evento.concluido).length,
      concluidos: lista.filter((evento) => evento.concluido).length,
    }
  }, [data])

  useEffect(() => {
    paginacao.reiniciar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro, buscaAtrasada])

  function abrirNovo() {
    setEmEdicao(null)
    setFormulario(FORMULARIO_VAZIO)
    setErros({})
    setModalAberto(true)
  }

  function abrirEdicao(evento: Evento) {
    setEmEdicao(evento)
    setFormulario({
      dataHorario: paraInputDataHora(evento.dataHorario),
      titulo: evento.titulo,
      descricao: evento.descricao ?? '',
      concluido: evento.concluido,
    })
    setErros({})
    setModalAberto(true)
  }

  function validar() {
    const encontrados: typeof erros = {}

    // Evento.titulo e Evento.dataHorario são @Column(nullable = false).
    if (!formulario.titulo.trim()) encontrados.titulo = 'Informe o título do evento'
    if (!formulario.dataHorario) encontrados.dataHorario = 'Informe a data e o horário'

    setErros(encontrados)
    return Object.keys(encontrados).length === 0
  }

  async function salvar() {
    if (!validar()) return

    setSalvando(true)

    try {
      const corpo = {
        titulo: formulario.titulo.trim(),
        descricao: formulario.descricao.trim() || undefined,
        dataHorario: deInputDataHora(formulario.dataHorario) as string,
        concluido: formulario.concluido,
      }

      if (emEdicao) {
        await servicoEventos.atualizar(emEdicao.id, corpo)
      } else {
        await servicoEventos.criar(corpo)
      }

      toast.success(emEdicao ? 'Evento atualizado' : 'Evento criado', corpo.titulo)
      setModalAberto(false)
      await reload()
    } catch (erroSalvar) {
      toast.error(
        'Não foi possível salvar',
        erroSalvar instanceof ApiError ? erroSalvar.message : undefined,
      )
    } finally {
      setSalvando(false)
    }
  }

  async function alternarConclusao(evento: Evento) {
    try {
      await servicoEventos.atualizar(evento.id, { ...evento, concluido: !evento.concluido })
      toast.success(evento.concluido ? 'Evento reaberto' : 'Evento concluído', evento.titulo)
      await reload()
    } catch (erroAtualizar) {
      toast.error(
        'Não foi possível atualizar',
        erroAtualizar instanceof ApiError ? erroAtualizar.message : undefined,
      )
    }
  }

  async function excluir(evento: Evento) {
    const confirmado = await confirmar({
      titulo: 'Excluir evento?',
      descricao: `"${evento.titulo}" será removido da agenda.`,
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
    })

    if (!confirmado) return

    try {
      await servicoEventos.excluir(evento.id)
      toast.success('Evento excluído')
      await reload()
    } catch (erroExclusao) {
      toast.error(
        'Não foi possível excluir',
        erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
      )
    }
  }

  const colunas: Coluna<Evento>[] = [
    {
      key: 'titulo',
      cabecalho: 'Título',
      ordenavel: true,
      valorOrdenacao: (evento) => evento.titulo,
      render: (evento) => evento.titulo,
    },
    {
      key: 'data',
      cabecalho: 'Data e horário',
      ordenavel: true,
      valorOrdenacao: (evento) => evento.dataHorario,
      render: (evento) => formatarDataHora(evento.dataHorario),
    },
    {
      key: 'descricao',
      cabecalho: 'Descrição',
      ocultarEmTelaPequena: true,
      render: (evento) => evento.descricao ?? '—',
    },
    {
      key: 'concluido',
      cabecalho: 'Situação',
      render: (evento) =>
        evento.concluido ? (
          <Tag variant="success" ponto>
            Concluído
          </Tag>
        ) : (
          <Tag variant="warning" ponto>
            Pendente
          </Tag>
        ),
    },
  ]

  return (
    <Layout>
      <Header
        titulo="Eventos"
        subtitulo={!loading && !error ? `${filtrados.length} evento(s)` : undefined}
        actions={
          <Button icon={<Plus />} onClick={abrirNovo}>
            Adicionar evento
          </Button>
        }
        filtros={<BuscaInput value={busca} onChange={setBusca} placeholder="Buscar evento..." />}
      />

      <Tab<Filtro>
        rotuloAcessivel="Filtrar eventos"
        value={filtro}
        onChange={setFiltro}
        options={[
          { value: 'todos', label: 'Todos', contador: contadores.todos },
          { value: 'pendentes', label: 'Pendentes', contador: contadores.pendentes },
          { value: 'concluidos', label: 'Concluídos', contador: contadores.concluidos },
        ]}
      />

      <DataTable
        descricao="Lista de eventos"
        columns={colunas}
        data={paginacao.itensDaPagina}
        rowKey={(evento) => evento.id}
        loading={loading}
        error={error}
        onReload={reload}
        onRowClick={abrirEdicao}
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
          titulo: busca || filtro !== 'todos' ? 'Nenhum evento encontrado' : 'Agenda vazia',
          descricao:
            busca || filtro !== 'todos'
              ? 'Ajuste o filtro ou limpe a busca.'
              : 'Cadastre aulas demonstrativas, reuniões e datas importantes da escola.',
          icon: <CalendarDays />,
          acao: !busca && filtro === 'todos' && (
            <Button icon={<Plus />} onClick={abrirNovo}>
              Criar evento
            </Button>
          ),
        }}
        actions={(evento) => (
          <>
            <IconButton
              label={evento.concluido ? 'Reabrir evento' : 'Marcar como concluído'}
              icon={<Check />}
              variant={evento.concluido ? 'neutral' : 'success'}
              onClick={() => alternarConclusao(evento)}
            />
            <IconButton label="Editar evento" icon={<Pencil />} onClick={() => abrirEdicao(evento)} />
            <IconButton
              label="Excluir evento"
              icon={<Trash2 />}
              variant="danger"
              onClick={() => excluir(evento)}
            />
          </>
        )}
      />

      <Modal
        aberto={modalAberto}
        onClose={() => setModalAberto(false)}
        titulo={emEdicao ? 'Editar evento' : 'Novo evento'}
        descricao="Eventos aparecem na Home de todos os perfis."
        bloqueado={salvando}
        rodape={
          <>
            <Button
              variant="danger"
              onClick={() => setModalAberto(false)}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button variant="success" loading={salvando} onClick={salvar}>
              Salvar
            </Button>
          </>
        }
      >
        <CorpoModal>
          <DatePicker
            label="Data e horário"
            required
            modo="dataHora"
            value={formulario.dataHorario}
            error={erros.dataHorario}
            disabled={salvando}
            onChange={(evento) =>
              setFormulario((atual) => ({ ...atual, dataHorario: evento.target.value }))
            }
          />

          <Input
            label="Título"
            required
            placeholder="Ex.: Aula demonstrativa"
            value={formulario.titulo}
            error={erros.titulo}
            disabled={salvando}
            maxLength={120}
            onChange={(evento) =>
              setFormulario((atual) => ({ ...atual, titulo: evento.target.value }))
            }
          />

          <TextArea
            label="Descrição"
            placeholder="Detalhes do evento, contatos, observações..."
            value={formulario.descricao}
            disabled={salvando}
            maxLength={2000}
            rows={4}
            onChange={(evento) =>
              setFormulario((atual) => ({ ...atual, descricao: evento.target.value }))
            }
          />

          <CheckBox
            label="Concluído"
            description="Eventos concluídos saem da lista de pendentes da Home."
            checked={formulario.concluido}
            disabled={salvando}
            onChange={(evento) =>
              setFormulario((atual) => ({ ...atual, concluido: evento.target.checked }))
            }
          />
        </CorpoModal>
      </Modal>
    </Layout>
  )
}
