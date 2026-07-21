import { useState } from 'react'
import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { DataTable } from '../../../components/ui/DataTable'
import { Input } from '../../../components/ui/Input/Input'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { TextArea } from '../../../components/ui/TextArea/TextArea'
import { CheckBox } from '../../../components/ui/CheckBox/CheckBox'
import { Pencil, Trash2 } from 'lucide-react'
import { formatarData } from '../../../utils/format'
import type { Evento } from '../../../types'

interface EventoLinha {
  id: string
  titulo: string
  data: string
  concluido: string
}

const EVENTOS_INICIAIS: Evento[] = Array.from({ length: 5 }).map((_, index) => ({
  id: String(index + 1),
  titulo: 'Aula demonstrativa Miguel',
  descricao: 'Aula demonstrativa para Miguel Gomes',
  dataHorario: '2026-07-20T11:00',
  concluido: true,
}))

export default function Eventos() {
  const [busca, setBusca] = useState('')
  const [eventos, setEventos] = useState<Evento[]>(EVENTOS_INICIAIS)
  const [modalAberto, setModalAberto] = useState(false)
  const [eventoEmEdicao, setEventoEmEdicao] = useState<Evento | null>(null)

  const [dataHorario, setDataHorario] = useState('')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [concluido, setConcluido] = useState(false)

  const colunas = [
    { header: 'Título', accessor: 'titulo' as const },
    { header: 'Data', accessor: 'data' as const },
    { header: 'Concluído', accessor: 'concluido' as const },
    { header: 'Ações', accessor: 'actions' as const, width: '100px' },
  ]

  const linhas: EventoLinha[] = eventos
    .filter((e) => e.titulo.toLowerCase().includes(busca.toLowerCase()))
    .map((e) => ({
      id: e.id,
      titulo: e.titulo,
      data: formatarData(e.dataHorario),
      concluido: e.concluido ? 'Sim' : 'Não',
    }))

  function abrirNovo() {
    setEventoEmEdicao(null)
    setDataHorario('')
    setTitulo('')
    setDescricao('')
    setConcluido(false)
    setModalAberto(true)
  }

  function abrirEdicao(id: string) {
    const evento = eventos.find((e) => e.id === id)
    if (!evento) return

    setEventoEmEdicao(evento)
    setDataHorario(evento.dataHorario)
    setTitulo(evento.titulo)
    setDescricao(evento.descricao)
    setConcluido(evento.concluido)
    setModalAberto(true)
  }

  function salvar() {
    if (eventoEmEdicao) {
      setEventos((prev) =>
        prev.map((ev) =>
          ev.id === eventoEmEdicao.id ? { ...ev, titulo, descricao, dataHorario, concluido } : ev,
        ),
      )
    } else {
      setEventos((prev) => [
        ...prev,
        { id: crypto.randomUUID(), titulo, descricao, dataHorario, concluido },
      ])
    }

    setModalAberto(false)
  }

  function excluir(id: string) {
    setEventos((prev) => prev.filter((ev) => ev.id !== id))
  }

  return (
    <Layout perfil="adm">
      <Header titulo="Eventos">
        <Button label="+ Adicionar evento" onClick={abrirNovo} />
        <Input
          placeholder="Buscar evento..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </Header>

      <DataTable
        columns={colunas}
        data={linhas}
        renderActions={(row) => (
          <div style={{ display: 'flex', gap: '12px', cursor: 'pointer' }}>
            <Pencil size={18} color="#64748b" onClick={() => abrirEdicao(row.id)} />
            <Trash2 size={18} color="#64748b" onClick={() => excluir(row.id)} />
          </div>
        )}
      />

      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        title={eventoEmEdicao ? 'Editar evento' : 'Novo evento'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            type="datetime-local"
            value={dataHorario}
            onChange={(e) => setDataHorario(e.target.value)}
          />
          <Input placeholder="Digite o Título..." value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          <TextArea placeholder="Digite a descrição..." value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          <CheckBox label="Concluído" checked={concluido} onChange={(e) => setConcluido(e.target.checked)} />

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button label="Cancelar" onClick={() => setModalAberto(false)} style={{ background: '#e0525c' }} />
            <Button label="Salvar" onClick={salvar} style={{ background: '#1db954' }} />
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
