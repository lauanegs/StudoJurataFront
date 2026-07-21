import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Select } from '../../../components/ui/Select/Select'
import { Button } from '../../../components/ui/Button'
import { DataTable } from '../../../components/ui/DataTable'
import { CheckBox } from '../../../components/ui/CheckBox/CheckBox'

interface QuestaoImportavel {
  id: string
  enunciado: string
}

const QUESTOES_DISPONIVEIS: QuestaoImportavel[] = Array.from({ length: 3 }).map((_, i) => ({
  id: String(i + 1),
  enunciado: 'Qual o animal que muge?',
}))

interface Props {
  isOpen: boolean
  onClose: () => void
  onImportar: (questoes: QuestaoImportavel[]) => void
}

export function ImportarQuestaoDialog({ isOpen, onClose, onImportar }: Props) {
  const [disciplina, setDisciplina] = useState<string | number>('')
  const [selecionadas, setSelecionadas] = useState<string[]>([])

  function toggle(id: string) {
    setSelecionadas((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  function confirmar() {
    onImportar(QUESTOES_DISPONIVEIS.filter((q) => selecionadas.includes(q.id)))
    setSelecionadas([])
    onClose()
  }

  const colunas = [
    { header: 'Selecionar', accessor: 'actions' as const, width: '90px' },
    { header: 'Enunciado', accessor: 'enunciado' as const },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar questão" width="560px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Select
            options={[{ value: '1', label: 'Robótica' }, { value: '2', label: 'Programação' }]}
            value={disciplina}
            onChange={setDisciplina}
            placeholder="Disciplina"
          />
          <Button label="Buscar" />
        </div>

        <DataTable
          columns={colunas}
          data={QUESTOES_DISPONIVEIS}
          renderActions={(row) => (
            <CheckBox checked={selecionadas.includes(row.id)} onChange={() => toggle(row.id)} />
          )}
        />

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button label="Cancelar" onClick={onClose} style={{ background: '#e0525c' }} />
          <Button label="Importar" onClick={confirmar} style={{ background: '#1db954' }} />
        </div>
      </div>
    </Modal>
  )
}

export default ImportarQuestaoDialog
