import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Sparkles, Target, Trophy } from 'lucide-react'

import { Layout } from '../../components/layout'
import { Banner } from '../../components/ui/Banner'
import { Card } from '../../components/ui/Card'
import { CircularProgress } from '../../components/ui/CircularProgress'
import { SaldoMoedas } from '../../components/ui/SaldoMoedas'
import { SimuladoIniciarCard } from '../../components/ui/SimuladoIniciarCard'
import { ErroCarregamento } from '../../components/feedback/ErroCarregamento'
import { EstadoVazio } from '../../components/feedback/EstadoVazio'
import { Skeleton } from '../../components/feedback/Skeleton'
import { useAuth } from '../../hooks/useAuth'
import { useAlunoLogado, useSkinEquipadaDoAluno } from '../../hooks/usePerfilLogado'
import { useRequisicao } from '../../hooks/useRequisicao'
import {
  disciplinas as servicoDisciplinas,
  gamificacao,
  simuladoAlunos,
  simulados as servicoSimulados,
} from '../../services/endpoints'
import { nomeCurto } from '../../utils/format'

const Medidores = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.lg};
  justify-content: center;
`

const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

export default function AlunoHome() {
  const navegar = useNavigate()
  const { usuario } = useAuth()
  const { alunoId, loading: carregandoAluno, error: erroAluno } = useAlunoLogado()
  const { imagemSkin } = useSkinEquipadaDoAluno(alunoId)

  const requisicaoTentativas = useRequisicao(
    () => simuladoAlunos.listarPorAluno(alunoId as number),
    [alunoId],
    { ativo: Boolean(alunoId) },
  )
  const requisicaoSimulados = useRequisicao(() => servicoSimulados.listar(), [])
  const requisicaoDisciplinas = useRequisicao(() => servicoDisciplinas.listar(), [])
  const requisicaoPontuacao = useRequisicao(
    () => gamificacao.pontuacao(alunoId as number),
    [alunoId],
    { ativo: Boolean(alunoId) },
  )

  const porSimulado = useMemo(
    () => new Map((requisicaoSimulados.data ?? []).map((simulado) => [simulado.id, simulado])),
    [requisicaoSimulados.data],
  )

  const pendentes = useMemo(
    () =>
      (requisicaoTentativas.data ?? [])
        .filter((tentativa) => tentativa.status !== 'CONCLUIDO')
        .slice(0, 4),
    [requisicaoTentativas.data],
  )

  const desempenhos = useMemo(() => {
    const acumulado = new Map<number, { soma: number; quantidade: number }>()

    ;(requisicaoTentativas.data ?? [])
      .filter((tentativa) => tentativa.status === 'CONCLUIDO' && typeof tentativa.nota === 'number')
      .forEach((tentativa) => {
        const simulado = porSimulado.get(tentativa.simuladoId)
        if (!simulado?.disciplinaId) return

        const maxima = simulado.notaMaxima ?? 10
        if (!maxima) return

        const percentual = Math.min(100, ((tentativa.nota as number) / maxima) * 100)
        const atual = acumulado.get(simulado.disciplinaId) ?? { soma: 0, quantidade: 0 }

        acumulado.set(simulado.disciplinaId, {
          soma: atual.soma + percentual,
          quantidade: atual.quantidade + 1,
        })
      })

    return [...acumulado.entries()].map(([disciplinaId, valores]) => ({
      disciplinaId,
      titulo:
        (requisicaoDisciplinas.data ?? []).find((disciplina) => disciplina.id === disciplinaId)
          ?.titulo ?? `Disciplina ${disciplinaId}`,
      percentual: valores.soma / valores.quantidade,
    }))
  }, [requisicaoTentativas.data, porSimulado, requisicaoDisciplinas.data])

  const pontuacao = requisicaoPontuacao.data

  if (erroAluno) {
    return (
      <Layout>
        <ErroCarregamento
          titulo="Cadastro do aluno não encontrado"
          mensagem={erroAluno}
        />
      </Layout>
    )
  }

  return (
    <Layout>
      <Banner
        titulo={`Bem-vindo, ${nomeCurto(usuario?.nomePessoa) ?? 'aluno'}!`}
        subtitulo="Vamos estudar muito juntos, aprender nunca foi tão fácil!"
        mascoteSrc={imagemSkin}
        extra={pontuacao && <SaldoMoedas moedas={pontuacao.moedas} />}
      />

      <Card titulo="Desempenho" icon={<Target />} corpoComFundo>
        {requisicaoTentativas.loading || carregandoAluno ? (
          <Skeleton $altura="120px" $raio="8px" />
        ) : desempenhos.length === 0 ? (
          <EstadoVazio
            titulo="Você ainda não concluiu simulados"
            descricao="Assim que terminar o primeiro, seu desempenho por matéria aparece aqui."
            icon={<Target />}
          />
        ) : (
          <Medidores>
            {desempenhos.map((desempenho) => (
              <CircularProgress
                key={desempenho.disciplinaId}
                value={desempenho.percentual}
                label={desempenho.titulo}
              />
            ))}
          </Medidores>
        )}
      </Card>

      <Card titulo="Simulados" icon={<Sparkles />} corpoComFundo>
        {requisicaoTentativas.loading ? (
          <Skeleton $altura="120px" $raio="8px" />
        ) : requisicaoTentativas.error ? (
          <ErroCarregamento
            mensagem={requisicaoTentativas.error}
            onRetry={requisicaoTentativas.reload}
          />
        ) : pendentes.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum simulado pendente"
            descricao="Quando seu professor lançar um novo simulado, ele aparece aqui."
            icon={<Trophy />}
          />
        ) : (
          <Lista>
            {pendentes.map((tentativa) => {
              const simulado = porSimulado.get(tentativa.simuladoId)

              return (
                <SimuladoIniciarCard
                  key={tentativa.id}
                  disciplina={
                    (requisicaoDisciplinas.data ?? []).find(
                      (disciplina) => disciplina.id === simulado?.disciplinaId,
                    )?.titulo ?? simulado?.titulo ?? `Simulado ${tentativa.simuladoId}`
                  }
                  quantidadeQuestoes={simulado?.quantidadeQuestoes}
                  onStart={() => navegar(`/aluno/simulado/${tentativa.id}`)}
                />
              )
            })}
          </Lista>
        )}
      </Card>
    </Layout>
  )
}
