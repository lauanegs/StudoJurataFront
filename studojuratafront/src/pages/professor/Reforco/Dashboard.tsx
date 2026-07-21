import { useNavigate } from 'react-router-dom'
import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { Card } from '../../../components/ui/Card/Card'
import { Button } from '../../../components/ui/Button'
import { AlertaDesempenhoCard } from '../../../components/ui/AlertaDesempenhoCard/AlertaDesempenhoCard'
import { DesempenhoCard } from '../../../components/ui/DesempenhoCard/DesempenhoCard'

const DESEMPENHOS = [
  { titulo: 'Por conteúdo', descricao: 'Desempenho por matéria', porcentagem: 45 },
  { titulo: 'Por conteúdo', descricao: 'Desempenho por matéria', porcentagem: 20 },
  { titulo: 'Por conteúdo', descricao: 'Desempenho por matéria', porcentagem: 80 },
  { titulo: 'Por conteúdo', descricao: 'Desempenho por matéria', porcentagem: 20 },
]

export default function Dashboard() {
  const navigate = useNavigate()

  const mediaGeral = Math.round(
    DESEMPENHOS.reduce((soma, item) => soma + item.porcentagem, 0) / DESEMPENHOS.length,
  )

  const temAlerta = DESEMPENHOS.some((item) => item.porcentagem < 50)

  return (
    <Layout perfil="professor">
      <Header titulo="Módulo de Reforço">
        <Button label="Ver simulados" onClick={() => navigate('/professor/reforco/simulados-realizados')} />
        <Button label="Lançar simulado" onClick={() => navigate('/professor/reforco/lancar-simulado')} />
      </Header>

      {temAlerta && (
        <AlertaDesempenhoCard
          titulo="Alerta"
          descricao="Desempenho baixo no conteúdo frações"
          media={`${mediaGeral}%`}
        />
      )}

      <Card>
        <strong style={{ display: 'block', marginBottom: '16px' }}>Desempenho</strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {DESEMPENHOS.map((item, index) => (
            <DesempenhoCard key={index} titulo={item.titulo} descricao={item.descricao} porcentagem={item.porcentagem} />
          ))}
        </div>
      </Card>
    </Layout>
  )
}
