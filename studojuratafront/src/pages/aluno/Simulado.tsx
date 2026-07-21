import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlobalStyle } from '../../styles/global'
import { SimuladoHeader } from '../../components/ui/SimuladoHeader'
import { ProgressoSimuladoCard } from '../../components/ui/ProgressoSimuladoCard'
import { EnunciadoSimuladoCard } from '../../components/ui/EnunciadoSimuladoCard/EnunciadoSimuladoCard'
import { AlternativaButton } from '../../components/ui/AlternativaButton/AlternativaButton'
import { Button } from '../../components/ui/Button'
import { formatarTempo } from '../../utils/format'
import type { StatusQuestaoProgresso } from '../../components/ui/ProgressoSimuladoCard/types'

interface QuestaoSimulado {
  enunciado: string
  alternativas: { letra: string; texto: string; correta: boolean }[]
}

const QUESTOES: QuestaoSimulado[] = [
  {
    enunciado: 'Qual é o animal que muge?',
    alternativas: [
      { letra: 'A', texto: 'Vaca', correta: true },
      { letra: 'B', texto: 'Cachorro', correta: false },
      { letra: 'C', texto: 'Gato', correta: false },
    ],
  },
  {
    enunciado: 'Quanto é 2 + 2?',
    alternativas: [
      { letra: 'A', texto: '3', correta: false },
      { letra: 'B', texto: '4', correta: true },
      { letra: 'C', texto: '5', correta: false },
    ],
  },
  {
    enunciado: 'Qual a cor do céu em um dia claro?',
    alternativas: [
      { letra: 'A', texto: 'Verde', correta: false },
      { letra: 'B', texto: 'Azul', correta: true },
      { letra: 'C', texto: 'Vermelho', correta: false },
    ],
  },
]

export default function Simulado() {
  const navigate = useNavigate()

  const [questaoAtual, setQuestaoAtual] = useState(0)
  const [selecionada, setSelecionada] = useState<string | null>(null)
  const [confirmada, setConfirmada] = useState(false)
  const [segundos, setSegundos] = useState(0)
  const [statusQuestoes, setStatusQuestoes] = useState<StatusQuestaoProgresso[]>(
    QUESTOES.map((_, i) => (i === 0 ? 'atual' : 'pendente')),
  )
  const [finalizado, setFinalizado] = useState(false)
  const [acertos, setAcertos] = useState(0)

  useEffect(() => {
    if (finalizado) return
    const intervalo = setInterval(() => setSegundos((s) => s + 1), 1000)
    return () => clearInterval(intervalo)
  }, [finalizado])

  const questao = QUESTOES[questaoAtual]

  function confirmarResposta() {
    if (!selecionada) return

    const alternativa = questao.alternativas.find((a) => a.letra === selecionada)
    const acertou = Boolean(alternativa?.correta)

    if (acertou) setAcertos((a) => a + 1)

    setStatusQuestoes((prev) =>
      prev.map((s, i) => (i === questaoAtual ? (acertou ? 'correta' : 'incorreta') : s)),
    )
    setConfirmada(true)
  }

  function proximaQuestao() {
    if (questaoAtual + 1 >= QUESTOES.length) {
      setFinalizado(true)
      return
    }

    const proximoIndex = questaoAtual + 1
    setStatusQuestoes((prev) => prev.map((s, i) => (i === proximoIndex ? 'atual' : s)))
    setQuestaoAtual(proximoIndex)
    setSelecionada(null)
    setConfirmada(false)
  }

  if (finalizado) {
    return (
      <>
        <GlobalStyle />
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '16px', textAlign: 'center', padding: '24px',
        }}>
          <img src="/images/mascote.png" alt="Mascote" style={{ width: '120px' }} />
          <h1 style={{ fontSize: '22px', color: '#374151' }}>Simulado concluído!</h1>
          <p style={{ fontSize: '16px', color: '#6b7280' }}>
            Você acertou {acertos} de {QUESTOES.length} questões em {formatarTempo(segundos)}.
          </p>
          <Button label="Voltar para Reforço" onClick={() => navigate('/aluno/reforco')} />
        </div>
      </>
    )
  }

  const alternativaCorreta = questao.alternativas.find((a) => a.correta)
  const acertouSelecionada = selecionada
    ? questao.alternativas.find((a) => a.letra === selecionada)?.correta
    : false

  return (
    <>
      <GlobalStyle />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <SimuladoHeader
          titulo="Simulado Português#123"
          tempo={formatarTempo(segundos)}
          onSair={() => navigate('/aluno/reforco')}
        />

        <ProgressoSimuladoCard total={QUESTOES.length} atual={questaoAtual + 1} status={statusQuestoes} />

        <EnunciadoSimuladoCard enunciado={questao.enunciado} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {questao.alternativas.map((alt) => (
            <AlternativaButton
              key={alt.letra}
              letra={alt.letra}
              texto={alt.texto}
              selecionado={selecionada === alt.letra}
              onClick={() => !confirmada && setSelecionada(alt.letra)}
            />
          ))}
        </div>

        {confirmada && (
          <div style={{
            padding: '16px', borderRadius: '12px', textAlign: 'center', fontWeight: 600,
            background: acertouSelecionada ? '#dcfce7' : '#fee2e2',
            color: acertouSelecionada ? '#15803d' : '#b91c1c',
          }}>
            {acertouSelecionada
              ? 'Mandou muito bem! Continue assim! 🎉'
              : `Quase lá! A resposta certa era "${alternativaCorreta?.texto}". Vamos revisar isso em breve!`}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {!confirmada ? (
            <Button label="Confirmar resposta" onClick={confirmarResposta} />
          ) : (
            <Button
              label={questaoAtual + 1 >= QUESTOES.length ? 'Ver resultado' : 'Próxima questão'}
              onClick={proximaQuestao}
            />
          )}
        </div>
      </div>
    </>
  )
}
