import { useState } from 'react'
import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { Card } from '../../../components/ui/Card/Card'
import { Input } from '../../../components/ui/Input/Input'
import { Button } from '../../../components/ui/Button'
import { CheckBox } from '../../../components/ui/CheckBox/CheckBox'
import { Select } from '../../../components/ui/Select/Select'
import { Trash2 } from 'lucide-react'

interface ResponsavelForm {
  id: string
  responsavelId: string | number
  parentesco: string | number
}

const RESPONSAVEIS_DISPONIVEIS = [
  { value: '1', label: 'Ana Gonzaga' },
  { value: '2', label: 'Eduardo Campos' },
]

const PARENTESCOS = [
  { value: 'MAE', label: 'Mãe' },
  { value: 'PAI', label: 'Pai' },
  { value: 'AVO', label: 'Avô/Avó' },
  { value: 'OUTRO', label: 'Outro' },
]

export default function NovoAluno() {
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [celular, setCelular] = useState('')
  const [email, setEmail] = useState('')
  const [sexoFeminino, setSexoFeminino] = useState(false)
  const [sexoMasculino, setSexoMasculino] = useState(false)

  const [responsaveis, setResponsaveis] = useState<ResponsavelForm[]>([
    { id: crypto.randomUUID(), responsavelId: '', parentesco: '' },
  ])

  function adicionarResponsavel() {
    setResponsaveis((prev) => [...prev, { id: crypto.randomUUID(), responsavelId: '', parentesco: '' }])
  }

  function removerResponsavel(id: string) {
    setResponsaveis((prev) => prev.filter((r) => r.id !== id))
  }

  function atualizarResponsavel(id: string, campo: 'responsavelId' | 'parentesco', valor: string | number) {
    setResponsaveis((prev) => prev.map((r) => (r.id === id ? { ...r, [campo]: valor } : r)))
  }

  return (
    <Layout perfil="adm">
      <Header titulo="Novo aluno">
        <Button label="Excluir aluno" style={{ background: '#e0525c' }} />
        <Button label="Salvar" style={{ background: '#1db954' }} />
      </Header>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Nome do aluno:</div>
            <Input placeholder="Nome do aluno..." value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>

          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>CPF:</div>
            <Input placeholder="CPF..." value={cpf} onChange={(e) => setCpf(e.target.value)} />
          </div>

          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Data de nascimento:</div>
            <Input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
          </div>

          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Celular:</div>
            <Input placeholder="Celular..." value={celular} onChange={(e) => setCelular(e.target.value)} />
          </div>

          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Email:</div>
            <Input placeholder="Email..." value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Sexo:</div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <CheckBox label="Feminino" checked={sexoFeminino} onChange={(e) => setSexoFeminino(e.target.checked)} />
              <CheckBox label="Masculino" checked={sexoMasculino} onChange={(e) => setSexoMasculino(e.target.checked)} />
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button label="+ Adicionar responsável" onClick={adicionarResponsavel} />
      </div>

      {responsaveis.map((r, index) => (
        <Card key={r.id}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <strong>Responsável {index + 1}</strong>
            {responsaveis.length > 1 && (
              <Trash2 size={18} color="#64748b" style={{ cursor: 'pointer' }} onClick={() => removerResponsavel(r.id)} />
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Responsável:</div>
              <Select
                options={RESPONSAVEIS_DISPONIVEIS}
                value={r.responsavelId}
                onChange={(v) => atualizarResponsavel(r.id, 'responsavelId', v)}
                placeholder="Selecione o responsável..."
              />
            </div>

            <div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Parentesco:</div>
              <Select
                options={PARENTESCOS}
                value={r.parentesco}
                onChange={(v) => atualizarResponsavel(r.id, 'parentesco', v)}
                placeholder="Selecione o parentesco..."
              />
            </div>
          </div>
        </Card>
      ))}
    </Layout>
  )
}
