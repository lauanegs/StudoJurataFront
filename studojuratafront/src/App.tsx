import './App.css'
import { AlertaDesempenhoCard } from './components/ui/AlertaDesempenhoCard'
import { AlternativaButton } from './components/ui/AlternativaButton'
import { AlternativaCard } from './components/ui/AlternativaCard'
import { AniversarianteCard } from './components/ui/AniversarianteCard'
import { Banner } from './components/ui/Banner'
import { Button } from './components/ui/Button'
import { DataTable } from './components/ui/DataTable'
import { Flag, FileText } from 'lucide-react'
import { Input } from './components/ui/Input/Input'
import { Select } from './components/ui/Select/Select'
import { EnunciadoSimuladoCard } from './components/ui/EnunciadoSImuladoCard/EnunciadoSImuladoCard'

interface TurmaData {
  turma: string
  alunos: number
}

function App() {

  const colunas = [
    { header: 'Turma', accessor: 'turma' as const },
    { header: 'Alunos', accessor: 'alunos' as const },
    { header: 'Ações', accessor: 'actions' as const, width: '100px' }
  ]

  const dados: TurmaData[] = [
    { turma: 'Geek Junior - quarta - 8:00', alunos: 4 },
    { turma: 'Geek Junior - quarta - 8:00', alunos: 4 },
    { turma: 'Geek Junior - quarta - 8:00', alunos: 4 },
    { turma: 'Geek Junior - quarta - 8:00', alunos: 4 },
  ]

  const opcoesDatas = [
    { value: '26/03/2026', label: '26/03/2026' },
    { value: '27/03/2026', label: '27/03/2026' },
  ]

  return (
    <div
      style={{
        padding: 40,
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          width: 800,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
      >
        <AlertaDesempenhoCard
          titulo="Alerta"
          descricao="Desempenho baixo no conteúdo frações"
          media="45%"
        />

        <AlternativaButton letra="A" texto="Vaca" />
        <AlternativaButton letra="B" texto="Cavalo" />
        <AlternativaButton letra="C" texto="Galinha" selecionado />

        <AlternativaCard letra="A" texto="Vaca" status="correta" />
        <AlternativaCard letra="B" texto="Cachorro" status="incorreta" />

        <AniversarianteCard nome="Cristian Gonzaga" data="16/03/2025" />

        <Banner
          titulo="Continue seus estudos!"
          subtitulo="Você já completou 70% da trilha de Direito Civil."
          mascoteSrc="/images/mascote.png"
        />

        <Button
          label="Registrar aula"
        />

        <DataTable
          columns={colunas}
          data={dados}
          renderActions={() => (
            <div style={{ display: 'flex', gap: '12px', cursor: 'pointer' }}>
              <Flag size={18} color="#64748b" />
              <FileText size={18} color="#64748b" />
            </div>
          )}
        />

        <Input
          placeholder="Buscar turma..."
          onChange={(e) => console.log(e.target.value)}
        />

        <Select
          options={opcoesDatas}
        />

        <EnunciadoSimuladoCard
          enunciado="Qual é o animal que muge?"
          onPlayAudio={() => console.log("Tocando áudio...")}
        />
      </div>
    </div>
  )
}

export default App