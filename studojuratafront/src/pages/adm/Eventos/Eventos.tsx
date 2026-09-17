import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { eventos as servicoEventos } from '../../../services/eventos'
import { deInputDataHora, formatarDataHora, normalizar } from '../../../utils/format'
import { deEvento, useFormularioEvento } from '../../../formularios/eventos'
import type { Evento } from '../../../types/eventos'
import type { Coluna } from '../../../components/ui/DataTable/types'

const CorpoModal = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.xs};
`

type Filtro = 'todos' | 'pendentes' | 'concluidos'

export default function Eventos() {
  const toast = useToast()
  const confirmar = useConfirm()
  const localizacao = useLocation()
  const navegar = useNavigate()

  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)

  const [modalAberto, setModalAberto] = useState(false)
  const [emEdicao, setEmEdicao] = useState<Evento | null>(null)
  const form = useFormularioEvento()

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

  // replace limpa o state para o "voltar" não reabrir o modal.
  useEffect(() => {
    if ((localizacao.state as { abrirNovo?: boolean } | null)?.abrirNovo) {
      abrirNovo()
      navegar(localizacao.pathname, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function abrirNovo() {
    setEmEdicao(null)
    form.reset()
    setModalAberto(true)
  }

  function abrirEdicao(evento: Evento) {
    setEmEdicao(evento)
    form.setValues(deEvento(evento))
    form.clearErrors()
    setModalAberto(true)
  }

  const { executar: salvar, executando: salvando } = useAcao(async () => {
    if ((await form.validate()).hasErrors) return
    const formulario = form.getValues()

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
    }
  })

  const { executar: alternarConclusao, executando: alternando } = useAcao(async (evento: Evento) => {
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
  })

  const { executar: excluir, executando: excluindo } = useAcao(async (evento: Evento) => {
    await confirmar({
      titulo: 'Excluir evento?',
      descricao: `"${evento.titulo}" será removido da agenda.`,
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
      aoConfirmar: async () => {
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
      },
    })
  })

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
          <Tag variant="success">
            Concluído
          </Tag>
        ) : (
          <Tag variant="warning">
            Pendente
          </Tag>
        ),
    },
  ]

  return (
    <Layout>
      <Header
        titulo="Eventos"
        actions={
          <Button size="large" icon={<Plus />} onClick={abrirNovo}>
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
              Cadastrar evento
            </Button>
          ),
        }}
        actions={(evento) => (
          <>
            <IconButton
              label={evento.concluido ? 'Reabrir evento' : 'Marcar como concluído'}
              icon={<Check />}
              variant={evento.concluido ? 'neutral' : 'success'}
              disabled={alternando || excluindo}
              onClick={() => alternarConclusao(evento)}
            />
            <IconButton
              label="Editar evento"
              icon={<Pencil />}
              disabled={excluindo}
              onClick={() => abrirEdicao(evento)}
            />
            <IconButton
              label="Excluir evento"
              icon={<Trash2 />}
              variant="danger"
              disabled={excluindo}
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
              variant="secondary"
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
          <Input
            label="Título"
            required
            placeholder="Ex.: Aula demonstrativa"
            {...form.getInputProps('titulo')}
            disabled={salvando}
            maxLength={120}
          />

          <DatePicker
            label="Data e horário"
            required
            modo="dataHora"
            value={form.values.dataHorario}
            error={form.errors.dataHorario as string | undefined}
            disabled={salvando}
            onChange={(evento) => form.setFieldValue('dataHorario', evento.target.value)}
          />

          <TextArea
            label="Descrição"
            placeholder="Detalhes do evento, contatos, observações..."
            {...form.getInputProps('descricao')}
            disabled={salvando}
            maxLength={2000}
            rows={4}
          />

          <CheckBox
            label="Concluído"
            description="Eventos concluídos saem da lista de pendentes da Home."
            checked={form.values.concluido}
            disabled={salvando}
            onChange={(evento) => form.setFieldValue('concluido', evento.target.checked)}
          />
        </CorpoModal>
      </Modal>
    </Layout>
  )
}
