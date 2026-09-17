import styled from 'styled-components'

import { Card } from '../../../../components/ui/Card'
import { DatePicker } from '../../../../components/ui/DatePicker'
import { Input } from '../../../../components/ui/Input'
import { Select, type SelectOption } from '../../../../components/ui/Select'
import { Stack } from '../../../../components/ui/Stack'
import { OPCOES_ATIVA_INATIVA } from '../../../../utils/labels'
import type { FormularioTurma } from '../../../../formularios/turmas'
import type { StatusAtivoInativo } from '../../../../types/comum'

/* Três campos por linha fixos: com auto-fit o número de colunas variaria com a tela. */
const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`

interface DadosTurmaProps {
  form: FormularioTurma
  salvando: boolean
  opcoesCursos: SelectOption<number>[]
  carregandoCursos: boolean
}

export function DadosTurma({ form, salvando, opcoesCursos, carregandoCursos }: DadosTurmaProps) {
  const { titulo, cursoId, capacidadeMaxima, dataInicio, dataFim, ativa } = form.values
  const erros = form.errors as Record<string, string | undefined>

  return (
    <Card titulo="Dados da turma">
      <Stack gap="md">
        <Grade>
          <Input
            label="Nome da turma"
            required
            placeholder="Ex.: Geek Júnior — Terça 8h"
            value={titulo}
            error={erros.titulo}
            disabled={salvando}
            maxLength={120}
            onChange={(evento) => form.setFieldValue('titulo', evento.target.value)}
          />

          <Select<number>
            label="Curso"
            required
            options={opcoesCursos}
            value={cursoId}
            loading={carregandoCursos}
            error={erros.cursoId}
            searchable
            clearable
            placeholder="Selecionar curso..."
            emptyText="Cadastre um curso primeiro"
            onChange={(valor) => form.setFieldValue('cursoId', valor)}
          />

          <Input
            label="Capacidade máxima"
            type="number"
            min={1}
            placeholder="Ex.: 20"
            value={capacidadeMaxima}
            error={erros.capacidadeMaxima}
            disabled={salvando}
            hint="Usada para alertar quando a turma lota."
            onChange={(evento) => form.setFieldValue('capacidadeMaxima', evento.target.value)}
          />

          <DatePicker
            label="Data de início"
            value={dataInicio}
            disabled={salvando}
            onChange={(evento) => form.setFieldValue('dataInicio', evento.target.value)}
          />

          <DatePicker
            label="Data de término"
            value={dataFim}
            error={erros.dataFim}
            // Turma ativa não tem data de término; só ganha uma ao ser encerrada.
            disabled={salvando || ativa}
            hint={ativa ? 'Só é definida ao encerrar a turma (Situação: Inativa).' : undefined}
            onChange={(evento) => form.setFieldValue('dataFim', evento.target.value)}
          />

          <Select<StatusAtivoInativo>
            label="Situação"
            options={OPCOES_ATIVA_INATIVA}
            value={ativa ? 'ATIVO' : 'INATIVO'}
            hint="Turmas inativas não recebem novas matrículas."
            disabled={salvando}
            onChange={(valor) => {
              const novoAtiva = valor !== 'INATIVO'
              form.setFieldValue('ativa', novoAtiva)
              if (novoAtiva) form.setFieldValue('dataFim', '')
            }}
          />
        </Grade>
      </Stack>
    </Card>
  )
}
