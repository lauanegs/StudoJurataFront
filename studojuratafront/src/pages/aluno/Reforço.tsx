import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout/Layout'
import { Header } from '../../components/ui/Header/Header'
import { Select } from '../../components/ui/Select/Select'
import { Button } from '../../components/ui/Button'
import { Tab } from '../../components/ui/Tab/Tab'
import { DataTable } from '../../components/ui/DataTable'
import { SimuladoIniciarCard } from '../../components/ui/SimuladoIniciarCard'

interface SimuladoParaFazer {
  id: string
  titulo: string
  responsavel: string
  quantidadeQuestoes: number
}

interface SimuladoRealizado {
  titulo: string
  acertos: string
  tempo: string
}

const SIMULADOS_A_FAZER: SimuladoParaFazer[] = Array.from({ length: 3 }).map((_, i) => ({
  id: String(i + 1),
  titulo: 'Matematica',
  responsavel: 'Studo Jurata',
  quantidadeQuestoes: 10,
}))

const SIMULADOS_REALIZADOS: SimuladoRealizado[] = Array.from({ length: 4 }).map(() => ({
  titulo: 'Matematica#11',
  acertos: '9/10',
  tempo: '00:30:30',
}))

export default function Reforco() {
  const [disciplina, setDisciplina] = useState<string | number>('')
  const [tabAtiva, setTabAtiva] = useState('afazer')
  const navigate = useNavigate()

  const colunas = [
    { header: 'Título', accessor: 'titulo' as const },
    { header: 'Acertos', accessor: 'acertos' as const },
    { header: 'Tempo', accessor: 'tempo' as const },
  ]

  return (
    <Layout perfil="aluno">
      <Header titulo="Reforço de aprendizagem">
        <Select options={[{ value: '1', label: 'Matemática' }]} value={disciplina} onChange={setDisciplina} placeholder="Disciplina" />
        <Button label="Buscar" />
      </Header>

      <Tab
        options={[
          { label: 'Simulados a fazer', value: 'afazer' },
          { label: 'Simulados realizados', value: 'realizados' },
        ]}
        value={tabAtiva}
        onChange={setTabAtiva}
      />

      {tabAtiva === 'afazer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {SIMULADOS_A_FAZER.map((s) => (
            <SimuladoIniciarCard
              key={s.id}
              titulo={s.titulo}
              responsavel={s.responsavel}
              quantidadeQuestoes={s.quantidadeQuestoes}
              onIniciar={() => navigate(`/aluno/simulado?id=${s.id}`)}
            />
          ))}
        </div>
      )}

      {tabAtiva === 'realizados' && (
        <DataTable columns={colunas} data={SIMULADOS_REALIZADOS} />
      )}
    </Layout>
  )
}
