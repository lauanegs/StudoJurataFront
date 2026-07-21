import { useState } from 'react'
import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { Card } from '../../../components/ui/Card/Card'
import { Input } from '../../../components/ui/Input/Input'
import { Button } from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Select/Select'

const ALUNOS_DISPONIVEIS = [
  { value: '1', label: 'Cristian Gonzaga Campos' },
  { value: '2', label: 'Ana Souza' },
  { value: '3', label: 'Pedro Lima' },
]

export default function MatricularAluno() {
  const [aluno, setAluno] = useState<string | number>('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [status, setStatus] = useState('')

  return (
    <Layout perfil="adm">
      <Header titulo="Matricular aluno">
        <Button label="Excluir matrícula" style={{ background: '#e0525c' }} />
        <Button label="Salvar" style={{ background: '#1db954' }} />
      </Header>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Aluno:</div>
            <Select options={ALUNOS_DISPONIVEIS} value={aluno} onChange={setAluno} placeholder="Selecione o aluno..." />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Data início da matrícula:</div>
              <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Data fim da matrícula:</div>
              <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Status da matrícula:</div>
            <Input placeholder="Ativo/Inativo" value={status} onChange={(e) => setStatus(e.target.value)} />
          </div>
        </div>
      </Card>
    </Layout>
  )
}
