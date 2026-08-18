import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarPlus, ClipboardList, Users } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { BuscaInput } from '../../../components/ui/BuscaInput'
import { Button } from '../../../components/ui/Button'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { useDebounce } from '../../../hooks/useDebounce'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { professores as servicoProfessores, turmas as servicoTurmas } from '../../../services/endpoints'
import { normalizar } from '../../../utils/format'
import type { Turma } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

interface LinhaTurma {
  turma: Turma
  alunosAtivos: number
}

/**
 * Turmas do professor logado — uma linha por turma (não por vínculo
 * turma+disciplina: um professor pode lecionar mais de uma disciplina na
 * mesma turma, mas a lista do Figma é por turma; a disciplina entra em jogo
 * só na hora de registrar aula).
 */
export default function TurmasProfessor() {
  const navegar = useNavigate()
  const { professorId, loading: carregandoProfessor, error: erroProfessor } = useProfessorLogado()

  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)

  const { data, loading, error, reload } = useRequisicao(
    async () => {
      const vinculos = await servicoProfessores.turmasLecionadas(professorId as number)

      const turmasUnicas = new Map<number, Turma>()
      for (const vinculo of vinculos) {
        if (vinculo.turma && vinculo.turma.status !== 'INATIVA' && !turmasUnicas.has(vinculo.turma.id)) {
          turmasUnicas.set(vinculo.turma.id, vinculo.turma)
        }
      }

      const turmasComAlunos = await Promise.all(
        [...turmasUnicas.values()].map(async (turma) => ({
          turma,
          alunosAtivos: await servicoTurmas.alunosAtivos(turma.id),
        })),
      )

      return turmasComAlunos
    },
    [professorId],
    { ativo: Boolean(professorId) },
  )

  const filtrados = useMemo(() => {
    const lista = data ?? []
    if (!buscaAtrasada.trim()) return lista

    const termo = normalizar(buscaAtrasada)
    return lista.filter((linha) => normalizar(linha.turma.titulo).includes(termo))
  }, [data, buscaAtrasada])

  const colunas: Coluna<LinhaTurma>[] = [
    {
      key: 'turma',
      cabecalho: 'Turma',
      ordenavel: true,
      valorOrdenacao: (linha) => linha.turma.titulo ?? '',
      render: (linha) => linha.turma.titulo ?? '—',
    },
    {
      key: 'alunos',
      cabecalho: 'Alunos',
      largura: '160px',
      render: (linha) => linha.alunosAtivos,
    },
  ]

  if (erroProfessor) {
    return (
      <Layout>
        <Header titulo="Turmas" />
        <ErroCarregamento mensagem={erroProfessor} />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo="Turmas"
        filtros={<BuscaInput value={busca} onChange={setBusca} placeholder="Buscar turma..." />}
      />

      <DataTable
        descricao="Turmas em que você leciona"
        columns={colunas}
        data={filtrados}
        rowKey={(linha) => linha.turma.id}
        loading={loading || carregandoProfessor}
        error={error}
        onReload={reload}
        empty={{
          titulo: busca ? 'Nenhuma turma encontrada' : 'Você ainda não leciona em nenhuma turma',
          descricao: busca
            ? 'Revise o termo buscado ou limpe o filtro.'
            : 'A coordenação vincula professores às turmas na tela de cadastro da turma.',
          icon: <Users />,
        }}
        actions={(linha) => (
          <>
            <Button
              variant="subtle"
              size="small"
              icon={<ClipboardList />}
              onClick={() => navegar(`/professor/turmas/${linha.turma.id}`)}
            >
              Detalhar
            </Button>
            <Button
              variant="subtle"
              size="small"
              icon={<CalendarPlus />}
              onClick={() => navegar(`/professor/turmas/${linha.turma.id}/registrar-aula`)}
            >
              Registrar aula
            </Button>
          </>
        )}
      />
    </Layout>
  )
}
