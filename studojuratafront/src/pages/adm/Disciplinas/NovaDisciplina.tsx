import { useState } from 'react'
import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { Card } from '../../../components/ui/Card/Card'
import { Input } from '../../../components/ui/Input/Input'
import { Button } from '../../../components/ui/Button'

export default function NovaDisciplina() {
  const [nome, setNome] = useState('')

  return (
    <Layout perfil="adm">
      <Header titulo="Nova disciplina">
        <Button label="Excluir disciplina" style={{ background: '#e0525c' }} />
        <Button label="Salvar" style={{ background: '#1db954' }} />
      </Header>

      <Card>
        <div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Nome:</div>
          <Input
            placeholder="Digite o nome da disciplina..."
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
      </Card>
    </Layout>
  )
}
