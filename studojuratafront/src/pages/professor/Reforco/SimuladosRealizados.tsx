import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { ClipboardList, FileText, Search } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { Select } from '../../../components/ui/Select'
import { Tag } from '../../../components/ui/Tag'
import { Skeleton } from '../../../components/feedback/Skeleton'
import { useToast } from '../../../contexts/toastContexto'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { matriculas, professores as servicoProfessores, simuladoAlunos, simulados as servicoSimulados } from '../../../services/endpoints'
import { formatarPorcentagem } from '../../../utils/format'
import type { Coluna } from '../../../components/ui/DataTable/types'

type TipoFiltro = 'disciplina' | 'aluno'

/* Confirmado no Figma: 3 selects + botão Buscar numa linha só, sem rótulo
   separado — mesmo padrão do header de Notas. */
const CamposCabecalho = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`

const CampoLargura = styled.div`
  width: 211px;
`

const LarguraBotao = styled.div`
  width: 150px;
  flex-shrink: 0;

  button {
    width: 100%;
  }
`

interface FiltroAplicado {
  turmaId: number
  tipo: TipoFiltro
  especificoId: number
}

interface LinhaSimulado {
  chave: string
  simuladoId: number
  titulo: string
  disciplinaOuAluno: string
  mediaGeral: number | null
  participacao?: { concluidas: number; total: number }
  acertos?: { quantidade: number; total: number }
  tentativaId?: number
}

export default function SimuladosRealizados() {
  const navegar = useNavigate()
  const toast = useToast()
  const { professorId } = useProfessorLogado()

  const [turmaId, setTurmaId] = useState<number | null>(null)
  const [tipo, setTipo] = useState<TipoFiltro | null>(null)
  const [especificoId, setEspecificoId] = useState<number | null>(null)
  const [filtro, setFiltro] = useState<FiltroAplicado | null>(null)

  const requisicaoVinculos = useRequisicao(
    () => servicoProfessores.turmasLecionadas(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )

  const opcoesTurmas = useMemo(() => {
    const unicas = new Map<number, string>()
    for (const vinculo of requisicaoVinculos.data ?? []) {
      if (vinculo.turma) unicas.set(vinculo.turma.id, vinculo.turma.titulo)
    }
    return [...unicas.entries()].map(([value, label]) => ({ value, label }))
  }, [requisicaoVinculos.data])

  const opcoesTipo: { value: TipoFiltro; label: string }[] = [
    { value: 'disciplina', label: 'Disciplina' },
    { value: 'aluno', label: 'Aluno' },
  ]

  const disciplinasDaTurma = useMemo(
    () =>
      (requisicaoVinculos.data ?? [])
        .filter((vinculo) => vinculo.turma?.id === turmaId && vinculo.disciplina)
        .map((vinculo) => ({ value: vinculo.disciplina!.id, label: vinculo.disciplina?.titulo ?? '—' })),
    [requisicaoVinculos.data, turmaId],
  )

  const requisicaoMatriculasTurma = useRequisicao(
    () => matriculas.ativosPorTurma(turmaId as number),
    [turmaId],
    { ativo: Boolean(turmaId) && tipo === 'aluno' },
  )

  const opcoesEspecifico = useMemo(() => {
    if (tipo === 'disciplina') return disciplinasDaTurma

    if (tipo === 'aluno') {
      return (requisicaoMatriculasTurma.data ?? []).map((matricula) => ({
        value: matricula.aluno.id,
        label: matricula.aluno?.pessoa?.nome ?? `Aluno ${matricula.aluno.id}`,
      }))
    }

    return []
  }, [tipo, disciplinasDaTurma, requisicaoMatriculasTurma.data])

  function buscar() {
    if (!turmaId || !tipo || !especificoId) {
      toast.warning('Selecione turma, tipo de filtro e o item específico antes de buscar.')
      return
    }

    setFiltro({ turmaId, tipo, especificoId })
  }

  // Sempre ativas — a tela abre com a lista completa (todas as turmas do
  // professor), sem exigir filtro antes de mostrar algo.
  const requisicaoSimulados = useRequisicao(() => servicoSimulados.listar(), [])
  const requisicaoTentativas = useRequisicao(() => simuladoAlunos.listar(), [])

  const linhas = useMemo<LinhaSimulado[]>(() => {
    const turmasDoProfessor = new Set((requisicaoVinculos.data ?? []).map((v) => v.turma?.id))
    const tentativas = requisicaoTentativas.data ?? []

    function nomeDisciplina(disciplinaId?: number | null) {
      return (requisicaoVinculos.data ?? []).find((v) => v.disciplina?.id === disciplinaId)?.disciplina?.titulo ?? '—'
    }

    function metricasDoSimulado(simuladoId: number, todosSimulados: typeof simulados) {
      const doSimulado = tentativas.filter((tentativa) => tentativa.simuladoId === simuladoId)
      const concluidas = doSimulado.filter((tentativa) => tentativa.status === 'CONCLUIDO')
      const maxima = todosSimulados.find((item) => item.id === simuladoId)?.notaMaxima || 10

      const mediaGeral = concluidas.length
        ? (concluidas.reduce((total, item) => total + (item.nota ?? 0), 0) / concluidas.length / maxima) * 100
        : null

      return { mediaGeral, total: doSimulado.length, concluidas: concluidas.length }
    }

    const simulados = (requisicaoSimulados.data ?? []).filter(
      (simulado) =>
        simulado.status !== 'RASCUNHO' &&
        turmasDoProfessor.has(simulado.turmaId ?? undefined) &&
        (!filtro || simulado.turmaId === filtro.turmaId),
    )

    // Sem filtro aplicado: lista todos os simulados realizados do professor,
    // um por linha, mostrando a própria disciplina de cada um.
    if (!filtro) {
      return simulados.map((simulado) => {
        const metricas = metricasDoSimulado(simulado.id, simulados)
        return {
          chave: `simulado-${simulado.id}`,
          simuladoId: simulado.id,
          titulo: simulado.titulo,
          disciplinaOuAluno: nomeDisciplina(simulado.disciplinaId),
          mediaGeral: metricas.mediaGeral,
          participacao: { concluidas: metricas.concluidas, total: metricas.total },
        }
      })
    }

    if (filtro.tipo === 'disciplina') {
      return simulados
        .filter((simulado) => simulado.disciplinaId === filtro.especificoId)
        .map((simulado) => {
          const metricas = metricasDoSimulado(simulado.id, simulados)
          return {
            chave: `simulado-${simulado.id}`,
            simuladoId: simulado.id,
            titulo: simulado.titulo,
            disciplinaOuAluno: opcoesEspecifico.find((item) => item.value === filtro.especificoId)?.label ?? '—',
            mediaGeral: metricas.mediaGeral,
            participacao: { concluidas: metricas.concluidas, total: metricas.total },
          }
        })
    }

    // Por aluno: uma linha por simulado em que o aluno tem tentativa, dentro da turma filtrada.
    const tentativasDoAluno = tentativas.filter((tentativa) => tentativa.alunoId === filtro.especificoId)

    return tentativasDoAluno
      .map((tentativa) => {
        const simulado = simulados.find((item) => item.id === tentativa.simuladoId)
        if (!simulado) return null

        const metricas = metricasDoSimulado(simulado.id, simulados)
        const maxima = simulado.quantidadeQuestoes ?? undefined

        const linha: LinhaSimulado = {
          chave: `tentativa-${tentativa.id}`,
          simuladoId: simulado.id,
          titulo: simulado.titulo,
          disciplinaOuAluno: nomeDisciplina(simulado.disciplinaId),
          mediaGeral: metricas.mediaGeral,
          acertos: { quantidade: tentativa.quantidadeAcertos ?? 0, total: maxima ?? 0 },
          tentativaId: tentativa.id,
        }

        return linha
      })
      .filter((linha): linha is LinhaSimulado => linha !== null)
  }, [filtro, requisicaoSimulados.data, requisicaoTentativas.data, opcoesEspecifico, requisicaoVinculos.data])

  const carregando = requisicaoSimulados.loading || requisicaoTentativas.loading

  const colunas: Coluna<LinhaSimulado>[] = [
    { key: 'titulo', cabecalho: 'Título', render: (linha) => linha.titulo },
    {
      key: 'disciplinaOuAluno',
      cabecalho: 'Disciplina / Aluno',
      render: (linha) => linha.disciplinaOuAluno,
    },
    {
      key: 'media',
      cabecalho: 'Média geral',
      alinhamento: 'center',
      render: (linha) =>
        linha.mediaGeral !== null ? (
          <Tag variant={linha.mediaGeral >= 70 ? 'success' : linha.mediaGeral >= 50 ? 'warning' : 'error'}>
            {formatarPorcentagem(linha.mediaGeral)}
          </Tag>
        ) : (
          '—'
        ),
    },
    {
      // Confirmado no Figma: o cabeçalho é sempre "Participação/Acertos" —
      // não troca de texto conforme o filtro, só o conteúdo da célula muda.
      key: 'participacaoAcertos',
      cabecalho: 'Participação/Acertos',
      alinhamento: 'center',
      render: (linha) =>
        linha.acertos
          ? `${linha.acertos.quantidade}${linha.acertos.total ? ` / ${linha.acertos.total}` : ''}`
          : linha.participacao
            ? `${linha.participacao.concluidas} / ${linha.participacao.total}`
            : '—',
    },
  ]

  function detalhar(linha: LinhaSimulado) {
    if (linha.tentativaId) {
      navegar(`/professor/reforco/simulados/${linha.simuladoId}/resultados/${linha.tentativaId}`)
    } else {
      navegar(`/professor/reforco/simulados/${linha.simuladoId}/resultados`)
    }
  }

  return (
    <Layout>
      <Header
        titulo="Simulados realizados"
        voltarPara="/professor/reforco"
        rotuloVoltar="Módulo de reforço"
        filtros={
          <CamposCabecalho>
            <CampoLargura>
              <Select
                placeholder="Turma"
                options={opcoesTurmas}
                value={turmaId}
                loading={requisicaoVinculos.loading}
                emptyText="Você não leciona em nenhuma turma"
                onChange={(valor) => {
                  setTurmaId(valor)
                  setEspecificoId(null)
                }}
              />
            </CampoLargura>

            <CampoLargura>
              <Select<TipoFiltro>
                placeholder="Disciplina / Aluno"
                options={opcoesTipo}
                value={tipo}
                emptyText="—"
                onChange={(valor) => {
                  setTipo(valor)
                  setEspecificoId(null)
                }}
              />
            </CampoLargura>

            <CampoLargura>
              <Select
                placeholder="Disc/Aluno (Específico)"
                options={opcoesEspecifico}
                value={especificoId}
                disabled={!tipo || !turmaId}
                loading={tipo === 'aluno' && requisicaoMatriculasTurma.loading}
                emptyText="Selecione turma e tipo primeiro"
                onChange={setEspecificoId}
              />
            </CampoLargura>

            <LarguraBotao>
              <Button size="large" icon={<Search />} onClick={buscar}>
                Buscar
              </Button>
            </LarguraBotao>
          </CamposCabecalho>
        }
      />

      {carregando ? (
        <Skeleton $altura="240px" $raio="8px" />
      ) : (
        <Card semPadding>
          <DataTable
            descricao="Simulados realizados"
            columns={colunas}
            data={linhas}
            rowKey={(linha) => linha.chave}
            empty={{
              titulo: 'Nenhum simulado realizado',
              descricao: filtro
                ? 'Não há simulados lançados para esse filtro ainda.'
                : 'Você ainda não lançou nenhum simulado.',
              icon: <FileText />,
            }}
            actions={(linha) => (
              <Button variant="subtle" size="small" icon={<ClipboardList />} onClick={() => detalhar(linha)}>
                Detalhar
              </Button>
            )}
          />
        </Card>
      )}
    </Layout>
  )
}
