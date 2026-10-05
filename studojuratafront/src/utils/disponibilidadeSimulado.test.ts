import { describe, expect, it } from 'vitest'

import { disponibilidadeDoSimulado } from './disponibilidadeSimulado'
import type { SimuladoResponse } from '../types/simulados'

const AGORA = new Date('2026-10-02T12:00:00').getTime()
const base = { id: 1, titulo: 'S', status: 'PUBLICADO' } as SimuladoResponse

describe('disponibilidadeDoSimulado', () => {
  it('libera simulado publicado dentro da janela', () => {
    expect(disponibilidadeDoSimulado({ ...base, dataInicio: '2026-10-01T08:00', dataFim: '2026-10-05T08:00' }, AGORA).indisponivel).toBe(false)
  })

  it('bloqueia encerrado, antes do início e depois do prazo', () => {
    expect(disponibilidadeDoSimulado({ ...base, status: 'ENCERRADO' }, AGORA)).toMatchObject({ motivo: 'Encerrado', encerrado: true })
    expect(disponibilidadeDoSimulado({ ...base, dataInicio: '2026-10-03T08:00' }, AGORA).indisponivel).toBe(true)
    // Ainda vai abrir: indisponível, mas não encerrado.
    expect(disponibilidadeDoSimulado({ ...base, dataInicio: '2026-10-03T08:00' }, AGORA).encerrado).toBeFalsy()
    expect(disponibilidadeDoSimulado({ ...base, dataFim: '2026-10-01T08:00' }, AGORA).motivo).toBe('Prazo encerrado')
  })
})
