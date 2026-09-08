import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { NotebookPen, Search } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DropDown } from '../../../components/ui/DropDown'
import { Header } from '../../../components/ui/Header'
import { Select } from '../../../components/ui/Select'
import { Tab } from '../../../components/ui/Tab'
import { Tag } from '../../../components/ui/Tag'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { Skeleton } from '../../../components/feedback/Skeleton'
import { useToast } from '../../../contexts/toastContexto'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useRequisicao } from '../../../hooks/useRequisicao'
import {
  matriculas,
  notas as servicoNotas,
  professores as servicoProfessores,
  simuladoAlunos,
  simulados as servicoSimulados,
} from '../../../services/endpoints'
import { nivelDesempenho } from '../../../utils/desempenho'
import { formatarNota } from '../../../utils/format'
import type { TagVariant } from '../../../components/ui/Tag'

const VARIANTE_POR_NIVEL: Record<'baixo' | 'medio' | 'alto', TagVariant> = {
  baixo: 'error',
  medio: 'warning',
  alto: 'success',
}
import { ROTULO_STATUS_MATRICULA } from '../../../utils/labels'
import type { AlunoTurma, SimuladoAlunoResponse } from '../../../types'

type TipoFiltro = 'disciplina' | 'aluno'
type Visao = 'ativos' | 'historico'

/* Confirmado no Figma: os 3 selects + botão Buscar dividem uma linha só,
   sem rótulo separado acima de cada campo (o texto do campo é o rótulo,
   mostrado como placeholder dentro da própria caixa). */
const CamposCabecalho = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`

/* Largura fixa (não flex: 1): o slot de filtros do Header (S.Filtros) é
   width:fit-content — um filho em flex:1 não tem contra o que crescer
   dentro de um pai que só se ajusta ao próprio conteúdo, e os campos
   colapsavam pro min-width. 211px vem do Figma: 830px de linha inteira
   (3 campos + botão) menos os 150px do botão e os 3 gaps de 16px,
   dividido por 3. */
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

/* Confirmado no Figma: 32px de padding ao redor da lista de acordeões e
   16px de gap entre eles — por isso o Card usa semPadding (o padding padrão
   dele é 24px, não bate) e este wrapper aplica os valores certos. */
const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
`

interface FiltroAplicado {
  turmaId: number
  tipo: TipoFiltro
  especificoId: number
}

interface LinhaAcordeao {
  chave: string
  titulo: string
  alunoId: number
  disciplinaId: number
  turmaId: number
}

/**
 * Notas por turma, filtradas por disciplina OU por aluno (o professor
 * escolhe o tipo). O resultado é um acordeão: filtrando por aluno, uma linha
 * por disciplina que o professor leciona nessa turma; filtrando por
 * disciplina, uma linha por aluno matriculado. Cada linha expande pra
 * mostrar os simulados individuais que compõem a nota.
 *
 * Nota é sempre derivada dos simulados concluídos — não há lançamento nem
 * recálculo manual nesta tela. O escopo da nota é a turma (matrícula
 * cíclica não tem período letivo fixo — ver types/index.ts Nota), então
 * cada linha do acordeão já carrega sua própria turma para casar com a nota
 * certa, sem depender de nenhum filtro global de período.
 *
 * Ativos e Histórico são visões separadas (aba), não misturadas na mesma
 * lista — a tela abre em "Ativos" (o caso comum: aluno cursando agora) e o
 * professor troca pra "Histórico" só quando precisa consultar a nota de
 * quem já encerrou a matrícula (concluída/cancelada/transferida) na turma.
 */
export default function Notas() {
  const toast = useToast()
  const { professorId } = useProfessorLogado()

  const [visao, setVisao] = useState<Visao>('ativos')
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
      if (vinculo.turma && vinculo.status !== 'INATIVO') {
        unicas.set(vinculo.turma.id, vinculo.turma.titulo)
      }
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
        .filter((vinculo) => vinculo.turma?.id === turmaId && vinculo.status !== 'INATIVO' && vinculo.disciplina)
        .map((vinculo) => ({ value: vinculo.disciplina!.id, label: vinculo.disciplina?.titulo ?? '—' })),
    [requisicaoVinculos.data, turmaId],
  )

  // Histórico só traz quem já encerrou a matrícula (concluída/cancelada/
  // transferida) — quem está ATIVA pertence à outra aba, não aparece nas duas.
  async function matriculasDaVisao(idTurma: number, visaoAtual: Visao): Promise<AlunoTurma[]> {
    if (visaoAtual === 'ativos') return matriculas.ativosPorTurma(idTurma)

    const todas = await matriculas.historicoPorTurma(idTurma)
    return todas.filter((matricula) => matricula.status !== 'ATIVA')
  }

  const requisicaoMatriculasTurma = useRequisicao(
    () => matriculasDaVisao(turmaId as number, visao),
    [turmaId, visao],
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

  // Trocar de aba invalida a busca aplicada — evita continuar mostrando um
  // resultado de "Ativos" com a aba "Histórico" selecionada (ou vice-versa).
  function trocarVisao(nova: Visao) {
    setVisao(nova)
    setFiltro(null)
    setEspecificoId(null)
  }

  function buscar() {
    if (!turmaId || !tipo || !especificoId) {
      toast.warning('Selecione turma, tipo de filtro e o item específico antes de buscar.')
      return
    }

    setFiltro({ turmaId, tipo, especificoId })
  }

  // A tela só monta os acordeões depois que o professor aplica um filtro
  // (Buscar) — antes disso mostra um empty state pedindo pra filtrar (ver
  // render abaixo). Sem filtro nenhum, a lista completa (todas as
  // turmas/disciplinas/alunos do professor) ficava grande e desorganizada.
  const requisicaoMatriculasResultado = useRequisicao(
    () => matriculasDaVisao(filtro?.turmaId as number, visao),
    [filtro?.turmaId, visao],
    { ativo: filtro?.tipo === 'disciplina' },
  )
  const requisicaoNotas = useRequisicao(() => servicoNotas.listar(), [])
  const requisicaoSimulados = useRequisicao(() => servicoSimulados.listar(), [])

  // Situação da matrícula no título — só aparece no Histórico (na aba
  // Ativos já é redundante, todo mundo ali está com a mesma situação).
  const sufixoSituacao = useCallback(
    (matricula: AlunoTurma) =>
      visao === 'historico' && matricula.status ? ` (${ROTULO_STATUS_MATRICULA[matricula.status]})` : '',
    [visao],
  )

  const linhasAcordeao = useMemo<LinhaAcordeao[]>(() => {
    if (!filtro) return []

    if (filtro.tipo === 'aluno') {
      return disciplinasDaTurma.map((disciplina) => ({
        chave: `disciplina-${disciplina.value}`,
        titulo: disciplina.label,
        alunoId: filtro.especificoId,
        disciplinaId: disciplina.value,
        turmaId: filtro.turmaId,
      }))
    }

    return (requisicaoMatriculasResultado.data ?? []).map((matricula) => ({
      chave: `aluno-${matricula.aluno.id}`,
      titulo: `${matricula.aluno?.pessoa?.nome ?? `Aluno ${matricula.aluno.id}`}${sufixoSituacao(matricula)}`,
      alunoId: matricula.aluno.id,
      disciplinaId: filtro.especificoId,
      turmaId: filtro.turmaId,
    }))
  }, [filtro, disciplinasDaTurma, requisicaoMatriculasResultado.data, sufixoSituacao])

  // Tentativas de simulado de cada aluno envolvido, buscadas uma vez por aluno distinto.
  const alunosEnvolvidos = useMemo(
    () => [...new Set(linhasAcordeao.map((linha) => linha.alunoId))],
    [linhasAcordeao],
  )

  const requisicaoTentativas = useRequisicao(
    async () => {
      const listas = await Promise.all(alunosEnvolvidos.map((id) => simuladoAlunos.listarPorAluno(id)))
      return new Map<number, SimuladoAlunoResponse[]>(alunosEnvolvidos.map((id, indice) => [id, listas[indice]]))
    },
    [alunosEnvolvidos],
    { ativo: alunosEnvolvidos.length > 0 },
  )

  const porSimulado = useMemo(
    () => new Map((requisicaoSimulados.data ?? []).map((simulado) => [simulado.id, simulado])),
    [requisicaoSimulados.data],
  )

  function notaDaLinha(alunoId: number, disciplinaId: number, turmaId: number) {
    return (
      (requisicaoNotas.data ?? []).find(
        (nota) =>
          nota.aluno?.id === alunoId &&
          nota.disciplina?.id === disciplinaId &&
          nota.turma?.id === turmaId,
      ) ?? null
    )
  }

  function tentativasDaLinha(alunoId: number, disciplinaId: number, turmaId: number) {
    const tentativas = requisicaoTentativas.data?.get(alunoId) ?? []

    return tentativas
      .filter((tentativa) => {
        if (tentativa.status !== 'CONCLUIDO') return false
        const simulado = porSimulado.get(tentativa.simuladoId)
        return simulado?.disciplinaId === disciplinaId && simulado?.turmaId === turmaId
      })
      .map((tentativa) => ({ tentativa, simulado: porSimulado.get(tentativa.simuladoId) }))
  }

  function simuladosDaLinha(alunoId: number, disciplinaId: number, turmaId: number) {
    return tentativasDaLinha(alunoId, disciplinaId, turmaId).map(({ tentativa, simulado }) => ({
      label: simulado?.titulo ?? `Simulado ${tentativa.simuladoId}`,
      value: `${formatarNota(tentativa.nota)} / ${formatarNota(simulado?.notaMaxima ?? 10)}`,
    }))
  }

  // Quantos pontos a disciplina já distribuiu pra esse aluno/turma até agora
  // — só os simulados concluídos contam. nota.total é sempre sobre essa
  // base, nunca sobre o total de pontos do curso inteiro (mesma regra da
  // tela de Notas do aluno — ver pontosDistribuidos em pages/aluno/Notas.tsx).
  function pontosDistribuidosDaLinha(alunoId: number, disciplinaId: number, turmaId: number) {
    return tentativasDaLinha(alunoId, disciplinaId, turmaId).reduce(
      (soma, { simulado }) => soma + (simulado?.notaMaxima ?? 0),
      0,
    )
  }

  const carregandoResultado =
    requisicaoMatriculasResultado.loading || requisicaoNotas.loading || requisicaoSimulados.loading

  if (requisicaoVinculos.error) {
    return (
      <Layout>
        <Header titulo="Notas" />
        <ErroCarregamento mensagem={requisicaoVinculos.error} onRetry={requisicaoVinculos.reload} />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo="Notas"
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

      <Tab<Visao>
        rotuloAcessivel="Situação da matrícula"
        value={visao}
        onChange={trocarVisao}
        options={[
          { value: 'ativos', label: 'Ativos' },
          { value: 'historico', label: 'Histórico' },
        ]}
      />

      {carregandoResultado ? (
        <Skeleton $altura="240px" $raio="8px" />
      ) : !filtro ? (
        <Card>
          <EstadoVazio
            titulo="Selecione os filtros para buscar as notas"
            descricao="Escolha a turma e o tipo de busca (por disciplina ou por aluno) acima e clique em Buscar."
            icon={<Search />}
          />
        </Card>
      ) : linhasAcordeao.length === 0 ? (
        <Card>
          <EstadoVazio
            titulo="Nada encontrado"
            descricao="Não há dados para esse filtro."
            icon={<NotebookPen />}
          />
        </Card>
      ) : (
        <Card semPadding>
          <Lista>
            {linhasAcordeao.map((linha, indice) => {
              const nota = notaDaLinha(linha.alunoId, linha.disciplinaId, linha.turmaId)
              const distribuido = pontosDistribuidosDaLinha(linha.alunoId, linha.disciplinaId, linha.turmaId)
              const percentual = distribuido > 0 ? ((nota?.total ?? 0) / distribuido) * 100 : 0

              return (
                <DropDown
                  key={linha.chave}
                  titulo={linha.titulo}
                  resumo={
                    typeof nota?.total === 'number' && distribuido > 0 ? (
                      <Tag variant={VARIANTE_POR_NIVEL[nivelDesempenho(percentual)]}>
                        Nota: {formatarNota(nota.total)}/{formatarNota(distribuido)}
                      </Tag>
                    ) : (
                      <Tag variant="neutral">Sem nota</Tag>
                    )
                  }
                  abertoInicialmente={indice === 0}
                  itens={simuladosDaLinha(linha.alunoId, linha.disciplinaId, linha.turmaId)}
                  emptyText="Nenhum simulado concluído considerado nesta nota."
                />
              )
            })}
          </Lista>
        </Card>
      )}
    </Layout>
  )
}
