import { api } from './api'
import type { Evento } from '../types/eventos'

export const eventos = {
  listar: () => api.get<Evento[]>('/eventos'),
  listarPendentes: () => api.get<Evento[]>('/eventos/pendentes'),
  criar: (dados: Partial<Evento>) => api.post<Evento>('/eventos', dados),
  atualizar: (id: number, dados: Partial<Evento>) => api.put<Evento>(`/eventos/${id}`, dados),
  excluir: (id: number) => api.delete(`/eventos/${id}`),
}
