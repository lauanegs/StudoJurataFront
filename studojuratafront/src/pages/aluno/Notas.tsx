import { useMemo, useState } from 'react'
import styled from 'styled-components'

import { Layout } from '../../components/layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DropDown } from '../../components/ui/DropDown'
import { Header } from '../../components/ui/Header'
import { Select } from '../../components/ui/Select'
import { ErroCarregamento } from '../../components/feedback/ErroCarregamento'
import { EstadoVazio } from '../../components/feedback/EstadoVazio'
import { Skeleton } from '../../components/feedback/Skeleton'
import { useAlunoLogado } from '../../hooks/usePerfilLogado'
import { useRequisicao } from '../../hooks/useRequisicao'
import {
  disciplinas as servicoDisciplinas,
  notas as servicoNotas,
  simuladoAlunos,
  simulados as servicoSimulados,
} from '../../services/endpoints'
import { formatarNota } from '../../utils/format'

const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`

/* Confirmado no Figma: select de disciplina + botão "Buscar" colados, na
   mesma linha. */
const CamposCabecalho = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  width: fit-content;
  max-width: 100%;
  overflow-x: auto;
`

/**
 * Notas do aluno logado.
 *
 * O back devolve a Nota consolidada por disciplina/período; os simulados que a
 * compõem são reconstruídos aqui a partir das tentativas concluídas.
 */
export default function AlunoNotas() {
  const { alunoId, loading: carregandoAluno, error: erroAluno } = useAlunoLogado()

  // Confirmado no Figma: o filtro é por disciplina e só se aplica ao clicar
  // em "Buscar" — a lista começa completa, sem filtro.
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<number | null>(null)
  const [disciplinaId, setDisciplinaId] = useState<number | null>(null)

  const requisicaoNotas = useRequisicao(
    () => servicoNotas.historicoPorAluno(alunoId as number),
    [alunoId],
    { ativo: Boolean(alunoId) },
  )
  const requisicaoTentativas = useRequisicao(
    () => simuladoAlunos.listarPorAluno(alunoId as number),
    [alunoId],
    { ativo: Boolean(alunoId) },
  )
  const requisicaoSimulados = useRequisicao(() => servicoSimulados.listar(), [])
  const requisicaoDisciplinas = useRequisicao(() => servicoDisciplinas.listar(), [])

  const porSimulado = useMemo(
    () => new Map((requisicaoSimulados.data ?? []).map((simulado) => [simulado.id, simulado])),
    [requisicaoSimulados.data],
  )

  const opcoesDisciplinas = useMemo(() => {
    const ids = new Set((requisicaoNotas.data ?? []).map((nota) => nota.disciplina?.id).filter(Boolean))
    return (requisicaoDisciplinas.data ?? [])
      .filter((disciplina) => ids.has(disciplina.id))
      .map((disciplina) => ({ value: disciplina.id, label: disciplina.titulo ?? '—' }))
  }, [requisicaoNotas.data, requisicaoDisciplinas.data])

  const notas = useMemo(() => {
    const lista = requisicaoNotas.data ?? []
    return disciplinaId ? lista.filter((nota) => nota.disciplina?.id === disciplinaId) : lista
  }, [requisicaoNotas.data, disciplinaId])

  function simuladosDaDisciplina(disciplinaFiltroId?: number) {
    return (requisicaoTentativas.data ?? [])
      .filter((tentativa) => {
        if (tentativa.status !== 'CONCLUIDO') return false
        return porSimulado.get(tentativa.simuladoId)?.disciplinaId === disciplinaFiltroId
      })
      .map((tentativa) => {
        const simulado = porSimulado.get(tentativa.simuladoId)

        return {
          label: simulado?.titulo ?? `Simulado ${tentativa.simuladoId}`,
          value: `Nota: ${formatarNota(tentativa.nota)}/${formatarNota(simulado?.notaMaxima ?? 10)}`,
        }
      })
  }

  if (erroAluno) {
    return (
      <Layout>
        <Header titulo="Notas" />
        <ErroCarregamento titulo="Cadastro do aluno não encontrado" mensagem={erroAluno} />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo="Notas"
        filtros={
          <CamposCabecalho>
            <Select<number>
              label="Disciplina"
              options={opcoesDisciplinas}
              value={disciplinaSelecionada}
              loading={requisicaoDisciplinas.loading}
              clearable
              placeholder="Todas as disciplinas"
              maxWidth="280px"
              emptyText="Nenhuma disciplina com notas"
              onChange={setDisciplinaSelecionada}
            />

            <Button size="large" onClick={() => setDisciplinaId(disciplinaSelecionada)}>
              Buscar
            </Button>
          </CamposCabecalho>
        }
      />

      <Card>
        {requisicaoNotas.loading || carregandoAluno ? (
          <Skeleton $altura="160px" $raio="8px" />
        ) : requisicaoNotas.error ? (
          <ErroCarregamento
            mensagem={requisicaoNotas.error}
            onRetry={requisicaoNotas.reload}
          />
        ) : notas.length === 0 ? (
          <EstadoVazio
            titulo="Você ainda não tem notas"
            descricao="As notas são calculadas automaticamente a partir dos simulados concluídos."
          />
        ) : (
          <Lista>
            {notas.map((nota, indice) => (
              <DropDown
                key={nota.id}
                titulo={nota.disciplina?.titulo ?? `Disciplina ${nota.disciplina?.id}`}
                resumo={`Nota: ${formatarNota(nota.total)}/10`}
                abertoInicialmente={indice === 0}
                itens={simuladosDaDisciplina(nota.disciplina?.id)}
                emptyText="Nenhum simulado concluído nesta disciplina ainda."
              />
            ))}
          </Lista>
        )}
      </Card>
    </Layout>
  )
}
