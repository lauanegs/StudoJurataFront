import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { ClipboardCheck, Search } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { Select } from '../../../components/ui/Select'
import { Skeleton } from '../../../components/feedback/Skeleton'
import { useToast } from '../../../contexts/toastContexto'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useRequisicao } from '../../../hooks/useRequisicao'
import {
  matriculas,
  professores as servicoProfessores,
  questoes as servicoQuestoes,
  simuladoAlunos,
  simuladoQuestoes,
  simulados as servicoSimulados,
} from '../../../services/endpoints'
import { formatarData } from '../../../utils/format'
import type { Coluna } from '../../../components/ui/DataTable/types'

type TipoFiltro = 'disciplina' | 'aluno'

/* Confirmado no Figma: 3 selects + botão Buscar numa linha só, sem rótulo
   separado — mesmo padrão do header de Notas / Simulados realizados. */
const CamposCabecalho = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  width: fit-content;
  max-width: 100%;
  overflow-x: auto;
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

interface LinhaAprovacao {
  simuladoId: number
  titulo: string
  tipoRotulo: string
  especificoRotulo: string
  dataCriacao?: string
}

export default function SimuladosAprovacao() {
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
  const requisicaoPendentes = useRequisicao(() => servicoQuestoes.listarPendentes(), [])
  const requisicaoSimuladoQuestoes = useRequisicao(() => simuladoQuestoes.listar(), [])
  const requisicaoTentativas = useRequisicao(() => simuladoAlunos.listar(), [], {
    ativo: filtro?.tipo === 'aluno',
  })

  const linhas = useMemo<LinhaAprovacao[]>(() => {
    const turmasDoProfessor = new Set((requisicaoVinculos.data ?? []).map((v) => v.turma?.id))

    function nomeDisciplina(disciplinaId?: number | null) {
      return (requisicaoVinculos.data ?? []).find((v) => v.disciplina?.id === disciplinaId)?.disciplina?.titulo ?? '—'
    }

    const idsPendentes = new Set((requisicaoPendentes.data ?? []).map((questao) => questao.id))
    const simuladosComPendencia = new Set(
      (requisicaoSimuladoQuestoes.data ?? [])
        .filter((vinculo) => idsPendentes.has(vinculo.questaoId))
        .map((vinculo) => vinculo.simuladoId),
    )

    let simulados = (requisicaoSimulados.data ?? []).filter(
      (simulado) =>
        simuladosComPendencia.has(simulado.id) &&
        turmasDoProfessor.has(simulado.turmaId ?? undefined) &&
        (!filtro || simulado.turmaId === filtro.turmaId),
    )

    // Sem filtro: lista todos os simulados com pendência, mostrando a
    // própria disciplina de cada um.
    if (!filtro) {
      return simulados.map((simulado) => ({
        simuladoId: simulado.id,
        titulo: simulado.titulo,
        tipoRotulo: 'Disciplina',
        especificoRotulo: nomeDisciplina(simulado.disciplinaId),
        dataCriacao: simulado.createdAt,
      }))
    }

    if (filtro.tipo === 'disciplina') {
      simulados = simulados.filter((simulado) => simulado.disciplinaId === filtro.especificoId)
    } else {
      const simuladoIdsDoAluno = new Set(
        (requisicaoTentativas.data ?? [])
          .filter((tentativa) => tentativa.alunoId === filtro.especificoId)
          .map((tentativa) => tentativa.simuladoId),
      )
      simulados = simulados.filter((simulado) => simuladoIdsDoAluno.has(simulado.id))
    }

    const rotuloTipo = filtro.tipo === 'disciplina' ? 'Disciplina' : 'Aluno'
    const rotuloEspecifico = opcoesEspecifico.find((item) => item.value === filtro.especificoId)?.label ?? '—'

    return simulados.map((simulado) => ({
      simuladoId: simulado.id,
      titulo: simulado.titulo,
      tipoRotulo: rotuloTipo,
      especificoRotulo: rotuloEspecifico,
      dataCriacao: simulado.createdAt,
    }))
  }, [
    filtro,
    requisicaoSimulados.data,
    requisicaoPendentes.data,
    requisicaoSimuladoQuestoes.data,
    requisicaoTentativas.data,
    requisicaoVinculos.data,
    opcoesEspecifico,
  ])

  const carregando =
    requisicaoSimulados.loading || requisicaoPendentes.loading || requisicaoSimuladoQuestoes.loading

  const colunas: Coluna<LinhaAprovacao>[] = [
    { key: 'titulo', cabecalho: 'Título', render: (linha) => linha.titulo },
    { key: 'tipo', cabecalho: 'Disciplina / Aluno', render: (linha) => linha.tipoRotulo },
    { key: 'especifico', cabecalho: 'Disciplina / Aluno', render: (linha) => linha.especificoRotulo },
    {
      key: 'data',
      cabecalho: 'Data criação',
      render: (linha) => formatarData(linha.dataCriacao),
    },
  ]

  return (
    <Layout>
      <Header
        titulo="Simulados aguardando aprovação"
        voltarPara="/professor/reforco"
        rotuloVoltar="Voltar para o módulo de reforço"
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
                placeholder="Disciplina / Aluno (Específico)"
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
            descricao="Simulados aguardando aprovação"
            columns={colunas}
            data={linhas}
            rowKey={(linha) => linha.simuladoId}
            empty={{
              titulo: 'Nada para aprovar',
              descricao: filtro
                ? 'Nenhum simulado com questões pendentes para esse filtro.'
                : 'Nenhum simulado seu tem questões pendentes de aprovação.',
              icon: <ClipboardCheck />,
            }}
            actions={(linha) => (
              <Button
                variant="subtle"
                size="small"
                onClick={() => navegar(`/professor/reforco/aprovacao/${linha.simuladoId}`)}
              >
                Detalhar
              </Button>
            )}
          />
        </Card>
      )}
    </Layout>
  )
}
