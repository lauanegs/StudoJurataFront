import { useState } from 'react'
import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { Card } from '../../../components/ui/Card/Card'
import { Input } from '../../../components/ui/Input/Input'
import { Button } from '../../../components/ui/Button'
import { CheckBox } from '../../../components/ui/CheckBox/CheckBox'

export default function NovoResponsavel() {
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [celular, setCelular] = useState('')
  const [email, setEmail] = useState('')
  const [sexoFeminino, setSexoFeminino] = useState(false)
  const [sexoMasculino, setSexoMasculino] = useState(false)

  return (
    <Layout perfil="adm">
      <Header titulo="Novo responsável">
        <Button label="Excluir aluno" style={{ background: '#e0525c' }} />
        <Button label="Salvar" style={{ background: '#1db954' }} />
      </Header>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Nome do responsável:</div>
            <Input placeholder="Nome do responsável..." value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>

          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>CPF:</div>
            <Input placeholder="CPF..." value={cpf} onChange={(e) => setCpf(e.target.value)} />
          </div>

          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Data de Nascimento:</div>
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
    </Layout>
  )
}
