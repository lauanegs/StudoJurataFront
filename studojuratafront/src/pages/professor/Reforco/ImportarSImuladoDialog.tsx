import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Select } from '../../../components/ui/Select/Select'
import { Button } from '../../../components/ui/Button'
import { DataTable } from '../../../components/ui/DataTable'
import { CheckBox } from '../../../components/ui/CheckBox/CheckBox'

interface SimuladoImportavel {
  id: string
  titulo: string
  disciplinaAluno: string
  mediaGeral: string
  participacao: string
}

const SIMULADOS_DISPONIVEIS: SimuladoImportavel[] = Array.from({ length: 3 }).map((_, i) => ({
  id: String(i + 1),
  titulo: 'Matematica#11',
  disciplinaAluno: 'Robótica',
  mediaGeral: '45%',
  participacao: '9/10',
}))

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelecionar: (simulado: SimuladoImportavel) => void
}

export function ImportarSimuladoDialog({ isOpen, onClose, onSelecionar }: Props) {
  const [turma, setTurma] = useState<string | number>('')
  const [contexto, setContexto] = useState<string | number>('')
  const [selecionado, setSelecionado] = useState<string | null>(null)

  const colunas = [
    { header: 'Selecionar', accessor: 'actions' as const, width: '90px' },
    { header: 'Título', accessor: 'titulo' as const },
    { header: 'Disciplina / Aluno', accessor: 'disciplinaAluno' as const },
    { header: 'Média geral', accessor: 'mediaGeral' as const },
    { header: 'Participação', accessor: 'participacao' as const },
  ]

  function confirmar() {
    const simulado = SIMULADOS_DISPONIVEIS.find((s) => s.id === selecionado)
    if (simulado) onSelecionar(simulado)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar simulado" width="640px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Select options={[{ value: '1', label: 'Geek Junior' }]} value={turma} onChange={setTurma} placeholder="Turma" />
          <Select
            options={[{ value: 'disciplina', label: 'Disciplina' }, { value: 'aluno', label: 'Aluno' }]}
            value={contexto}
            onChange={setContexto}
            placeholder="Disciplina / Aluno"
          />
          <Button label="Buscar" />
        </div>

        <DataTable
          columns={colunas}
          data={SIMULADOS_DISPONIVEIS}
          renderActions={(row) => (
            <CheckBox
              checked={selecionado === row.id}
              onChange={() => setSelecionado((prev) => (prev === row.id ? null : row.id))}
            />
          )}
        />

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button label="Cancelar" onClick={onClose} style={{ background: '#e0525c' }} />
          <Button label="Selecionar" onClick={confirmar} style={{ background: '#1db954' }} />
        </div>
      </div>
    </Modal>
  )
}

export default ImportarSimuladoDialog
