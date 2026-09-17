import { api } from './api'
import type { PontuacaoAluno, Skin, SkinAluno } from '../types/gamificacao'

export const gamificacao = {
  pontuacao: (alunoId: number) => api.get<PontuacaoAluno>(`/gamificacao/aluno/${alunoId}/pontuacao`),
  skinsDisponiveis: () => api.get<Skin[]>('/gamificacao/skins'),
  skinsDoAluno: (alunoId: number) => api.get<SkinAluno[]>(`/gamificacao/aluno/${alunoId}/skins`),
  comprar: (alunoId: number, skinId: number) =>
    api.post<SkinAluno>(`/gamificacao/aluno/${alunoId}/skins/${skinId}/comprar`),
  equipar: (alunoId: number, skinId: number) =>
    api.post<SkinAluno>(`/gamificacao/aluno/${alunoId}/skins/${skinId}/equipar`),
}
