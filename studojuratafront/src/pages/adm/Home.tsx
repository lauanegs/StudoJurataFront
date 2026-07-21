import { useState } from 'react'
import { Layout } from '../../components/layout/Layout'
import { Banner } from '../../components/ui/Banner'
import { SeparadorCard } from '../../components/ui/SeparadorCard/SeparadorCard'
import { Card } from '../../components/ui/Card/Card'
import { AniversarianteCard } from '../../components/ui/AniversarianteCard'
import { EventoCard } from '../../components/ui/EventoCard'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input/Input'
import { TextArea } from '../../components/ui/TextArea/TextArea'
import { CheckBox } from '../../components/ui/CheckBox/CheckBox'
import { Button } from '../../components/ui/Button'
import { Users, GraduationCap } from 'lucide-react'
import type { Evento } from '../../types'

const ANIVERSARIANTES = [
  { nome: 'Cristian Gonzaga', data: '16/03/2025' },
  { nome: 'Cristian Gonzaga', data: '16/03/2025' },
  { nome: 'Cristian Gonzaga', data: '16/03/2025' },
]

const EVENTOS_INICIAIS: Evento[] = [
  {
    id: '1',
    titulo: 'Aula demonstrativa',
    descricao: 'Aula demonstrativa para Miguel Gomes, pai Eduardo (34) 99999-9999',
    dataHorario: '2026-07-20T11:00',
    concluido: false,
  },
  {
    id: '2',
    titulo: 'Aula demonstrativa',
    descricao: 'Aula demonstrativa para Miguel Gomes, pai Eduardo (34) 99999-9999',
    dataHorario: '2026-07-20T11:00',
    concluido: false,
  },
  {
    id: '3',
    titulo: 'Aula demonstrativa',
    descricao: 'Aula demonstrativa para Miguel Gomes, pai Eduardo (34) 99999-9999',
    dataHorario: '2026-07-20T11:00',
    concluido: false,
  },
]

export default function AdmHome() {
  const [eventos, setEventos] = useState<Evento[]>(EVENTOS_INICIAIS)
  const [modalAberto, setModalAberto] = useState(false)
  const [eventoEmEdicao, setEventoEmEdicao] = useState<Evento | null>(null)

  const [dataHorario, setDataHorario] = useState('')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [concluido, setConcluido] = useState(false)

  function abrirNovoEvento() {
    setEventoEmEdicao(null)
    setDataHorario('')
    setTitulo('')
    setDescricao('')
    setConcluido(false)
    setModalAberto(true)
  }

  function abrirEdicaoEvento(evento: Evento) {
    setEventoEmEdicao(evento)
    setDataHorario(evento.dataHorario)
    setTitulo(evento.titulo)
    setDescricao(evento.descricao)
    setConcluido(evento.concluido)
    setModalAberto(true)
  }

  function salvarEvento() {
    if (eventoEmEdicao) {
      if (concluido) {
        // eventos concluídos saem da sessão principal e passam a existir
        // apenas na listagem completa (tela Eventos)
        setEventos((prev) => prev.filter((ev) => ev.id !== eventoEmEdicao.id))
      } else {
        setEventos((prev) =>
          prev.map((ev) =>
            ev.id === eventoEmEdicao.id
              ? { ...ev, titulo, descricao, dataHorario, concluido }
              : ev,
          ),
        )
      }
    } else {
      const novoEvento: Evento = {
        id: crypto.randomUUID(),
        titulo,
        descricao,
        dataHorario,
        concluido,
      }

      if (!concluido) setEventos((prev) => [...prev, novoEvento])
    }

    setModalAberto(false)
  }

  function excluirEvento(id: string) {
    setEventos((prev) => prev.filter((ev) => ev.id !== id))
  }

  return (
    <Layout perfil="adm">
      <Banner />

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Users size={32} color="#049DBF" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '24px' }}>23</strong>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>alunos ativos</span>
              </div>
            </div>
          </Card>
        </div>

        <div style={{ flex: 1, minWidth: '220px' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <GraduationCap size={32} color="#8b5cf6" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '24px' }}>3</strong>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>professores ativos</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <SeparadorCard title="Aniversariantes da semana">
        {ANIVERSARIANTES.map((a, index) => (
          <AniversarianteCard key={index} nome={a.nome} data={a.data} />
        ))}
      </SeparadorCard>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <strong>Eventos</strong>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button label="+ Adicionar evento" onClick={abrirNovoEvento} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {eventos.map((evento) => (
            <EventoCard
              key={evento.id}
              titulo={evento.titulo}
              data={evento.dataHorario}
              descricao={evento.descricao}
              onEdit={() => abrirEdicaoEvento(evento)}
              onDelete={() => excluirEvento(evento.id)}
            />
          ))}

          {eventos.length === 0 && (
            <span style={{ fontSize: '14px', color: '#9ca3af' }}>Nenhum evento cadastrado.</span>
          )}
        </div>
      </Card>

      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        title={eventoEmEdicao ? 'Editar evento' : 'Novo evento'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            type="datetime-local"
            placeholder="Digite a data e horário..."
            value={dataHorario}
            onChange={(e) => setDataHorario(e.target.value)}
          />
          <Input
            placeholder="Digite o Título..."
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <TextArea
            placeholder="Digite a descrição..."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
          <CheckBox
            label="Concluído"
            checked={concluido}
            onChange={(e) => setConcluido(e.target.checked)}
          />

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button label="Cancelar" onClick={() => setModalAberto(false)} style={{ background: '#e0525c' }} />
            <Button label="Salvar" onClick={salvarEvento} style={{ background: '#1db954' }} />
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
