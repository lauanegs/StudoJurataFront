import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { Card } from '../../../components/ui/Card/Card'
import { Tab } from '../../../components/ui/Tab/Tab'
import { Input } from '../../../components/ui/Input/Input'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { DataTable } from '../../../components/ui/DataTable'
import { CheckBox } from '../../../components/ui/CheckBox/CheckBox'
import { X } from 'lucide-react'

interface Chip {
  id: string
  nome: string
}

const DISCIPLINAS_DISPONIVEIS: Chip[] = [
  { id: '1', nome: 'Robótica' },
  { id: '2', nome: 'Jogos' },
  { id: '3', nome: 'Programação' },
]

const PROFESSORES_DISPONIVEIS: Chip[] = [
  { id: '1', nome: 'Lauane' },
  { id: '2', nome: 'Fábio' },
]

const ALUNOS_ATIVOS = Array.from({ length: 4 }).map((_, i) => ({
  id: String(i + 1),
  aluno: 'Cristian Gonzaga Campos',
  idade: 8,
}))

const HISTORICO_ALUNOS = Array.from({ length: 4 }).map((_, i) => ({
  id: String(i + 1),
  aluno: 'Cristian Gonzaga Campos',
  status: i === 0 ? 'Ativo' : 'Concluído',
  dataFim: i === 0 ? '-' : '12/07/2026',
}))

export default function NovaTurma() {
  const navigate = useNavigate()
  const [tabAtiva, setTabAtiva] = useState('dados')

  const [titulo, setTitulo] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [capacidadeMaxima, setCapacidadeMaxima] = useState('')
  const [status, setStatus] = useState('')

  const [disciplinas, setDisciplinas] = useState<Chip[]>([])
  const [professores, setProfessores] = useState<Chip[]>([])

  const [modalDisciplina, setModalDisciplina] = useState(false)
  const [modalProfessor, setModalProfessor] = useState(false)
  const [buscaModal, setBuscaModal] = useState('')

  function toggleDisciplina(chip: Chip) {
    setDisciplinas((prev) =>
      prev.some((d) => d.id === chip.id) ? prev.filter((d) => d.id !== chip.id) : [...prev, chip],
    )
  }

  function toggleProfessor(chip: Chip) {
    setProfessores((prev) =>
      prev.some((p) => p.id === chip.id) ? prev.filter((p) => p.id !== chip.id) : [...prev, chip],
    )
  }

  const colunasAlunosAtivos = [
    { header: 'Nome aluno', accessor: 'aluno' as const },
    { header: 'Idade', accessor: 'idade' as const },
    { header: 'Ações', accessor: 'actions' as const, width: '100px' },
  ]

  const colunasHistorico = [
    { header: 'Nome aluno', accessor: 'aluno' as const },
    { header: 'Status', accessor: 'status' as const },
    { header: 'Data fim', accessor: 'dataFim' as const },
    { header: 'Ações', accessor: 'actions' as const, width: '100px' },
  ]

  return (
    <Layout perfil="adm">
      <Header titulo="Nova turma">
        <Button label="Excluir turma" style={{ background: '#e0525c' }} />
        <Button label="Salvar" style={{ background: '#1db954' }} />
      </Header>

      <Tab
        options={[
          { label: 'Dados da turma', value: 'dados' },
          { label: 'Alunos ativos', value: 'alunos' },
          { label: 'Histórico de alunos', value: 'historico' },
        ]}
        value={tabAtiva}
        onChange={setTabAtiva}
      />

      {tabAtiva === 'dados' && (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Input placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />

            <div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Disciplinas:</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Button label="Vincular disciplina" onClick={() => setModalDisciplina(true)} />
                {disciplinas.map((d) => (
                  <span
                    key={d.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 14px', borderRadius: '999px', border: '1px solid #d1d5db',
                      fontSize: '13px', color: '#374151',
                    }}
                  >
                    {d.nome}
                    <X size={14} style={{ cursor: 'pointer' }} onClick={() => toggleDisciplina(d)} />
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Professores:</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Button label="Vincular professor" onClick={() => setModalProfessor(true)} />
                {professores.map((p) => (
                  <span
                    key={p.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 14px', borderRadius: '999px', border: '1px solid #d1d5db',
                      fontSize: '13px', color: '#374151',
                    }}
                  >
                    {p.nome}
                    <X size={14} style={{ cursor: 'pointer' }} onClick={() => toggleProfessor(p)} />
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <Input type="date" placeholder="Data início..." value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
              <Input type="date" placeholder="Data fim..." value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>

            <Input
              placeholder="Quantidade de alunos..."
              value={capacidadeMaxima}
              onChange={(e) => setCapacidadeMaxima(e.target.value)}
            />

            <Input placeholder="Ativo/Inativo" value={status} onChange={(e) => setStatus(e.target.value)} />
          </div>
        </Card>
      )}

      {tabAtiva === 'alunos' && (
        <>
          <Header titulo="">
            <Button label="Matricular aluno" onClick={() => navigate('/adm/turmas/matricular')} />
          </Header>
          <DataTable
            columns={colunasAlunosAtivos}
            data={ALUNOS_ATIVOS}
            renderActions={() => (
              <div style={{ display: 'flex', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/adm/turmas/matricular')}>
                editar
              </div>
            )}
          />
        </>
      )}

      {tabAtiva === 'historico' && (
        <DataTable
          columns={colunasHistorico}
          data={HISTORICO_ALUNOS}
          renderActions={() => <span style={{ color: '#64748b', cursor: 'pointer' }}>ver</span>}
        />
      )}

      <Modal isOpen={modalDisciplina} onClose={() => setModalDisciplina(false)} title="Vincular disciplina">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input placeholder="Buscar disciplina..." value={buscaModal} onChange={(e) => setBuscaModal(e.target.value)} />

          {DISCIPLINAS_DISPONIVEIS
            .filter((d) => d.nome.toLowerCase().includes(buscaModal.toLowerCase()))
            .map((d) => (
              <CheckBox
                key={d.id}
                label={d.nome}
                checked={disciplinas.some((sel) => sel.id === d.id)}
                onChange={() => toggleDisciplina(d)}
              />
            ))}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button label="Cancelar" onClick={() => setModalDisciplina(false)} style={{ background: '#e0525c' }} />
            <Button label="Salvar" onClick={() => setModalDisciplina(false)} style={{ background: '#1db954' }} />
          </div>
        </div>
      </Modal>

      <Modal isOpen={modalProfessor} onClose={() => setModalProfessor(false)} title="Vincular professor">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input placeholder="Buscar professor..." value={buscaModal} onChange={(e) => setBuscaModal(e.target.value)} />

          {PROFESSORES_DISPONIVEIS
            .filter((p) => p.nome.toLowerCase().includes(buscaModal.toLowerCase()))
            .map((p) => (
              <CheckBox
                key={p.id}
                label={p.nome}
                checked={professores.some((sel) => sel.id === p.id)}
                onChange={() => toggleProfessor(p)}
              />
            ))}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button label="Cancelar" onClick={() => setModalProfessor(false)} style={{ background: '#e0525c' }} />
            <Button label="Salvar" onClick={() => setModalProfessor(false)} style={{ background: '#1db954' }} />
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
