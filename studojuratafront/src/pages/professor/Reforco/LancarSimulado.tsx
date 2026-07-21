import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { Card } from '../../../components/ui/Card/Card'
import { Input } from '../../../components/ui/Input/Input'
import { Button } from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Select/Select'
import { ImportarSimuladoDialog } from './ImportarSImuladoDialog'
import { X } from 'lucide-react'

interface AlunoChip {
  id: string
  nome: string
}

const ALUNOS_DISPONIVEIS: AlunoChip[] = [
  { id: '1', nome: 'aluno1' },
  { id: '2', nome: 'aluno2' },
]

export default function LancarSimulado() {
  const navigate = useNavigate()

  const [titulo, setTitulo] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [disciplina, setDisciplina] = useState<string | number>('')
  const [turma, setTurma] = useState<string | number>('')
  const [alunos, setAlunos] = useState<AlunoChip[]>([])
  const [modalImportar, setModalImportar] = useState(false)

  function toggleAluno(chip: AlunoChip) {
    setAlunos((prev) =>
      prev.some((a) => a.id === chip.id) ? prev.filter((a) => a.id !== chip.id) : [...prev, chip],
    )
  }

  return (
    <Layout perfil="professor">
      <Header titulo="Lançar Simulado">
        <Button label="Selecionar simulado existente" onClick={() => setModalImportar(true)} />
        <Button label="Novo simulado" onClick={() => navigate('/professor/reforco/novo-simulado')} />
      </Header>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Título:</div>
            <Input placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>

          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Data Início:</div>
            <Input type="datetime-local" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          </div>

          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Data Fim:</div>
            <Input type="datetime-local" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
          </div>

          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Disciplina:</div>
            <Select options={[{ value: '1', label: 'Robótica' }]} value={disciplina} onChange={setDisciplina} placeholder="Disciplina" />
          </div>

          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Turma:</div>
            <Select options={[{ value: '1', label: 'Geek Junior' }]} value={turma} onChange={setTurma} placeholder="Turma" />
          </div>

          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Alunos:</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Button label="Adicionar alunos" onClick={() => ALUNOS_DISPONIVEIS.forEach(toggleAluno)} />
              {alunos.map((a) => (
                <span
                  key={a.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '999px', border: '1px solid #d1d5db',
                    fontSize: '13px', color: '#374151',
                  }}
                >
                  {a.nome}
                  <X size={14} style={{ cursor: 'pointer' }} onClick={() => toggleAluno(a)} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <ImportarSimuladoDialog
        isOpen={modalImportar}
        onClose={() => setModalImportar(false)}
        onSelecionar={(simulado) => setTitulo(simulado.titulo)}
      />
    </Layout>
  )
}
