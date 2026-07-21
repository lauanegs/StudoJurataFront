import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout/Layout'
import { Banner } from '../../components/ui/Banner'
import { GraficoDesempenhoAluno } from '../../components/ui/GraficoDesempenhoAluno'
import { Card } from '../../components/ui/Card/Card'
import { SimuladoIniciarCard } from '../../components/ui/SimuladoIniciarCard'

const DESEMPENHOS = [
  { titulo: 'programação', porcentagem: 70 },
  { titulo: 'programação', porcentagem: 100 },
  { titulo: 'programação', porcentagem: 70 },
  { titulo: 'programação', porcentagem: 70 },
  { titulo: 'programação', porcentagem: 70 },
]

const SIMULADOS_ATIVOS = Array.from({ length: 4 }).map((_, i) => ({
  id: String(i + 1),
  titulo: 'Matematica',
  responsavel: 'Studo Jurata',
  quantidadeQuestoes: 10,
}))

export default function AlunoHome() {
  const navigate = useNavigate()

  return (
    <Layout perfil="aluno">
      <Banner />

      <Card>
        <strong style={{ display: 'block', marginBottom: '16px' }}>Desempenho</strong>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {DESEMPENHOS.map((d, index) => (
            <GraficoDesempenhoAluno key={index} titulo={d.titulo} porcentagem={d.porcentagem} />
          ))}
        </div>
      </Card>

      <Card>
        <strong style={{ display: 'block', marginBottom: '16px' }}>Simulados</strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {SIMULADOS_ATIVOS.map((s) => (
            <SimuladoIniciarCard
              key={s.id}
              titulo={s.titulo}
              responsavel={s.responsavel}
              quantidadeQuestoes={s.quantidadeQuestoes}
              onIniciar={() => navigate(`/aluno/simulado?id=${s.id}`)}
            />
          ))}
        </div>
      </Card>
    </Layout>
  )
}
