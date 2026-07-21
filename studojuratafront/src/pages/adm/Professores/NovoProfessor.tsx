import { useState } from 'react'
import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { Card } from '../../../components/ui/Card/Card'
import { Input } from '../../../components/ui/Input/Input'
import { Button } from '../../../components/ui/Button'
import { CheckBox } from '../../../components/ui/CheckBox/CheckBox'
import { Modal } from '../../../components/ui/Modal'
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

export default function NovoProfessor() {
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [celular, setCelular] = useState('')
  const [email, setEmail] = useState('')
  const [sexoFeminino, setSexoFeminino] = useState(false)
  const [sexoMasculino, setSexoMasculino] = useState(false)

  const [disciplinas, setDisciplinas] = useState<Chip[]>([])
  const [modalDisciplina, setModalDisciplina] = useState(false)
  const [buscaModal, setBuscaModal] = useState('')

  function toggleDisciplina(chip: Chip) {
    setDisciplinas((prev) =>
      prev.some((d) => d.id === chip.id) ? prev.filter((d) => d.id !== chip.id) : [...prev, chip],
    )
  }

  return (
    <Layout perfil="adm">
      <Header titulo="Novo professor">
        <Button label="Excluir professor" style={{ background: '#e0525c' }} />
        <Button label="Salvar" style={{ background: '#1db954' }} />
      </Header>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Nome:</div>
            <Input placeholder="Nome do professor..." value={nome} onChange={(e) => setNome(e.target.value)} />
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
        </div>
      </Card>

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
    </Layout>
  )
}
