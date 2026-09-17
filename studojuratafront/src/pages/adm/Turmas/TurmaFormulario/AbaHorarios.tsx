import { useState } from 'react'
import { CalendarClock, Plus, Trash2 } from 'lucide-react'

import { Button } from '../../../../components/ui/Button'
import { Card } from '../../../../components/ui/Card'
import { DataTable } from '../../../../components/ui/DataTable'
import { IconButton } from '../../../../components/ui/IconButton'
import { Select } from '../../../../components/ui/Select'
import { TimePicker } from '../../../../components/ui/TimePicker'
import { useConfirm } from '../../../../contexts/confirmContexto'
import { useToast } from '../../../../contexts/toastContexto'
import { ApiError } from '../../../../services/api'
import { horariosTurma } from '../../../../services/turmas'
import { formatarHora } from '../../../../utils/format'
import { OPCOES_DIA_SEMANA, ROTULO_DIA_SEMANA } from '../../../../utils/labels'
import type { RequestResult } from '../../../../hooks/useRequisicao'
import type { DiaSemana, HorarioTurma } from '../../../../types/turmas'
import { LinhaCampos } from './styles'

const HORARIO_VAZIO = { diaSemana: null as DiaSemana | null, horaInicio: '', horaFim: '' }

interface AbaHorariosProps {
  turmaId: number
  requisicaoHorarios: RequestResult<HorarioTurma[]>
}

export function AbaHorarios({ turmaId, requisicaoHorarios }: AbaHorariosProps) {
  const toast = useToast()
  const confirmar = useConfirm()
  const [novoHorario, setNovoHorario] = useState(HORARIO_VAZIO)

  async function adicionarHorario() {
    if (!novoHorario.diaSemana || !novoHorario.horaInicio || !novoHorario.horaFim) {
      toast.warning('Horário incompleto', 'Informe o dia, a hora de início e a de término.')
      return
    }

    if (novoHorario.horaFim <= novoHorario.horaInicio) {
      toast.warning('Horário inválido', 'A hora de término deve ser maior que a de início.')
      return
    }

    try {
      await horariosTurma.adicionar(turmaId, {
        diaSemana: novoHorario.diaSemana,
        horaInicio: `${novoHorario.horaInicio}:00`,
        horaFim: `${novoHorario.horaFim}:00`,
      })

      toast.success('Horário adicionado')
      setNovoHorario(HORARIO_VAZIO)
      await requisicaoHorarios.reload()
    } catch (erroAdicionar) {
      toast.error('Não foi possível adicionar', erroAdicionar instanceof ApiError ? erroAdicionar.message : undefined)
    }
  }

  async function removerHorario(horarioId: number) {
    await confirmar({
      titulo: 'Remover horário?',
      rotuloConfirmar: 'Remover',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await horariosTurma.remover(horarioId)
          toast.success('Horário removido')
          await requisicaoHorarios.reload()
        } catch (erroRemover) {
          toast.error('Não foi possível remover', erroRemover instanceof ApiError ? erroRemover.message : undefined)
        }
      },
    })
  }

  return (
    <>
      <Card titulo="Horários semanais">
        <LinhaCampos $colunas="2fr 1fr 1fr auto">
          <Select<DiaSemana>
            label="Dia da semana"
            options={OPCOES_DIA_SEMANA}
            value={novoHorario.diaSemana}
            placeholder="Selecionar dia..."
            onChange={(valor) => setNovoHorario((atual) => ({ ...atual, diaSemana: valor }))}
          />

          <TimePicker
            label="Início"
            value={novoHorario.horaInicio}
            onChange={(evento) => setNovoHorario((atual) => ({ ...atual, horaInicio: evento.target.value }))}
          />

          <TimePicker
            label="Término"
            value={novoHorario.horaFim}
            onChange={(evento) => setNovoHorario((atual) => ({ ...atual, horaFim: evento.target.value }))}
          />

          <Button size="large" icon={<Plus />} onClick={adicionarHorario}>
            Adicionar
          </Button>
        </LinhaCampos>
      </Card>

      <DataTable<HorarioTurma>
        descricao="Horários semanais da turma"
        columns={[
          { key: 'dia', cabecalho: 'Dia da semana', render: (horario) => ROTULO_DIA_SEMANA[horario.diaSemana] },
          { key: 'inicio', cabecalho: 'Início', render: (horario) => formatarHora(horario.horaInicio) },
          { key: 'fim', cabecalho: 'Término', render: (horario) => formatarHora(horario.horaFim) },
        ]}
        data={requisicaoHorarios.data ?? []}
        rowKey={(horario) => horario.id}
        loading={requisicaoHorarios.loading}
        error={requisicaoHorarios.error}
        onReload={requisicaoHorarios.reload}
        densidade="compacta"
        empty={{
          titulo: 'Nenhum horário definido',
          descricao: 'Os horários semanais orientam o planejamento das aulas.',
          icon: <CalendarClock />,
        }}
        actions={(horario) => (
          <IconButton
            label="Remover horário"
            icon={<Trash2 />}
            variant="danger"
            onClick={() => removerHorario(horario.id)}
          />
        )}
      />
    </>
  )
}
