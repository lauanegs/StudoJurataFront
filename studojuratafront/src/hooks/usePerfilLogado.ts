import { useMemo } from 'react'

import { alunos, gamificacao, professores } from '../services/endpoints'
import { resolverImagemSkin } from '../utils/skins'
import { useAuth } from './useAuth'
import { useRequisicao } from './useRequisicao'

/**
 * O /auth/me devolve `pessoaId`, não o id do Aluno nem o do Professor — e
 * quase toda rota do back é indexada por essas duas entidades. Estes hooks
 * fazem a ponte: buscam a lista e casam pelo pessoaId do usuário logado.
 */

export function useAlunoLogado() {
  const { usuario } = useAuth()
  const ehAluno = usuario?.tipoUsuario === 'ALUNO'

  const { data, loading, error, reload } = useRequisicao(() => alunos.listar(), [usuario?.pessoaId], {
    ativo: ehAluno && Boolean(usuario?.pessoaId),
  })

  const aluno = useMemo(
    () => (data ?? []).find((item) => item.pessoa?.id === usuario?.pessoaId) ?? null,
    [data, usuario?.pessoaId],
  )

  return {
    aluno,
    alunoId: aluno?.id ?? null,
    loading,
    error: error ?? (!loading && ehAluno && !aluno ? 'Não encontramos o cadastro deste aluno.' : null),
    reload,
  }
}

/**
 * Skin equipada pelo aluno — usada no banner da Home, no simulado em
 * andamento e na tela de resultado, para o mascote acompanhar a escolha
 * feita em "Meu perfil".
 */
export function useSkinEquipadaDoAluno(alunoId: number | null) {
  const { data } = useRequisicao(
    () => gamificacao.skinsDoAluno(alunoId as number),
    [alunoId],
    { ativo: Boolean(alunoId) },
  )

  const skinEquipada = useMemo(() => data?.find((item) => item.ativa)?.skin ?? null, [data])

  return {
    skinEquipada,
    imagemSkin: resolverImagemSkin(skinEquipada?.urlAsset),
  }
}

export function useProfessorLogado() {
  const { usuario } = useAuth()
  const ehProfessor = usuario?.tipoUsuario === 'PROFESSOR'

  const { data, loading, error, reload } = useRequisicao(
    () => professores.listar(),
    [usuario?.pessoaId],
    { ativo: ehProfessor && Boolean(usuario?.pessoaId) },
  )

  const professor = useMemo(
    () => (data ?? []).find((item) => item.pessoa?.id === usuario?.pessoaId) ?? null,
    [data, usuario?.pessoaId],
  )

  return {
    professor,
    professorId: professor?.id ?? null,
    loading,
    error:
      error ??
      (!loading && ehProfessor && !professor
        ? 'Não encontramos o cadastro deste professor.'
        : null),
    reload,
  }
}
