import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Clock, GraduationCap, Target } from 'lucide-react'

import { Layout } from '@/components/layout'
import { QuestaoCorrigida } from '@/components/simulados/QuestaoCorrigida'
import { Header, SubtituloItem } from '@/components/ui/Header'
import { Stack } from '@/components/ui/Stack'
import { ErroCarregamento } from '@/components/feedback/ErroCarregamento'
import { EstadoVazio } from '@/components/feedback/EstadoVazio'
import { SkeletonCartao } from '@/components/feedback/Skeleton'
import { useRequisicao } from '@/hooks/useRequisicao'
import { alunos as servicoAlunos } from '@/dominios/pessoas/service'
import {
  questaoAlunos,
  simuladoAlunos,
  simulados as servicoSimulados,
} from '@/dominios/simulados/service'
import { formatarTempo } from '@/utils/format'


export default function ResultadoAluno() {
  const { simuladoId, simuladoAlunoId } = useParams()

  const idSimulado = Number(simuladoId)
  const idTentativa = Number(simuladoAlunoId)

  const requisicaoSimulado = useRequisicao(() => servicoSimulados.buscar(idSimulado), [idSimulado])
  const requisicaoTentativa = useRequisicao(() => simuladoAlunos.buscar(idTentativa), [idTentativa])
  const requisicaoRespostas = useRequisicao(
    () => questaoAlunos.listarPorSimuladoAluno(idTentativa),
    [idTentativa],
  )
  // Prova da própria tentativa (questões + gabarito)
  const requisicaoProva = useRequisicao(() => simuladoAlunos.questoesDaTentativa(idTentativa), [idTentativa])
  const requisicaoAlunos = useRequisicao(() => servicoAlunos.listar(), [])

  const tentativa = requisicaoTentativa.data
  const simulado = requisicaoSimulado.data

  const nomeAluno = useMemo(
    () =>
      (requisicaoAlunos.data ?? []).find((aluno) => aluno.id === tentativa?.alunoId)?.pessoa?.nome ??
      (tentativa ? `Aluno ${tentativa.alunoId}` : ''),
    [requisicaoAlunos.data, tentativa],
  )

  const correcao = useMemo(() => {
    const respostas = new Map((requisicaoRespostas.data ?? []).map((resposta) => [resposta.questaoId, resposta]))
    const gabarito = requisicaoProva.data?.gabarito ?? {}

    return (requisicaoProva.data?.questoes ?? []).map((questao) => {
      const resposta = respostas.get(questao.questaoId)
      const ehVF = questao.tipo === 'VERDADEIRO_FALSO'
      const marcadasVerdadeiras = new Set(resposta?.alternativasVerdadeirasIds ?? [])

      // Tentativas antigas têm `respondida` nulo (mesmo fallback de Simulado.tsx)
      const respondida =
        resposta?.respondida ??
        (ehVF ? (resposta?.alternativasVerdadeirasIds?.length ?? 0) > 0 : resposta?.alternativaId != null)

      return {
        questaoId: questao.questaoId,
        enunciado: questao.enunciado,
        acertou: Boolean(resposta?.acertou),
        respondida,
        ehVF,
        marcadasVerdadeiras,
        alternativas: [...questao.alternativas]
          .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
          .map((alternativa) => ({ ...alternativa, correta: gabarito[String(alternativa.id)] === true })),
        alternativaMarcada: resposta?.alternativaId ?? null,
      }
    })
  }, [requisicaoRespostas.data, requisicaoProva.data])

  if (requisicaoTentativa.error) {
    return (
      <Layout>
        <Header
          titulo="Correção"
          voltarPara={`/professor/reforco/simulados/${idSimulado}/resultados`}
        />
        <ErroCarregamento
          mensagem={requisicaoTentativa.error}
          onRetry={requisicaoTentativa.reload}
        />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo={simulado?.titulo ?? 'Correção da tentativa'}
        subtitulo={
          tentativa && (
            <>
              <SubtituloItem icon={<GraduationCap />}>Aluno(a): {nomeAluno}</SubtituloItem>
              <SubtituloItem icon={<Target />}>
                Acertos: {typeof tentativa.quantidadeAcertos === 'number' ? tentativa.quantidadeAcertos : '—'}
                {simulado?.quantidadeQuestoes ? ` / ${simulado.quantidadeQuestoes}` : ''}
              </SubtituloItem>
              <SubtituloItem icon={<Clock />}>Tempo: {formatarTempo(tentativa.tempoGasto)}</SubtituloItem>
            </>
          )
        }
        voltarPara={`/professor/reforco/simulados/${idSimulado}/resultados`}
        rotuloVoltar="Resultados"
      />

      {requisicaoRespostas.loading || requisicaoProva.loading ? (
        <SkeletonCartao />
      ) : correcao.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma resposta registrada"
          descricao="Este aluno ainda não finalizou a tentativa."
          icon={<Target />}
        />
      ) : (
        <Stack gap="md">
          {correcao.map((item, indice) => (
            <QuestaoCorrigida
              key={item.questaoId}
              numero={indice + 1}
              enunciado={item.enunciado}
              ehVF={item.ehVF}
              respondida={item.respondida}
              acertou={item.acertou}
              rotuloAcerto="Acertou"
              rotuloErro="Errou"
              alternativas={item.alternativas}
              marcadasVerdadeiras={item.marcadasVerdadeiras}
              alternativaMarcada={item.alternativaMarcada}
            />
          ))}
        </Stack>
      )}
    </Layout>
  )
}
