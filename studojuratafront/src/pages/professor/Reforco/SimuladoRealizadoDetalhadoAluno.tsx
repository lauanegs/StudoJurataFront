import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { Card } from '../../../components/ui/Card/Card'

interface QuestaoResposta {
  numero: number
  enunciado: string
  respostaCorreta: string
  respostaAluno: string
  acertou: boolean
}

const QUESTOES: QuestaoResposta[] = [
  { numero: 1, enunciado: 'Qual animal muge?', respostaCorreta: 'Vaca', respostaAluno: 'Cachorro', acertou: false },
  { numero: 2, enunciado: 'Qual animal muge?', respostaCorreta: 'Vaca', respostaAluno: 'Vaca', acertou: true },
]

export default function SimuladoRealizadoDetalhadoAluno() {
  return (
    <Layout perfil="professor">
      <Header titulo="Simulado Português#123" />
      <div style={{ marginTop: '-16px', color: '#6b7280', fontSize: '14px', display: 'flex', gap: '24px' }}>
        <span>Aluno(a): Matheus</span>
        <span>Acertos: 9/10</span>
        <span>Tempo: 00:30:20</span>
      </div>

      {QUESTOES.map((q) => (
        <Card key={q.numero}>
          <strong style={{ display: 'block', marginBottom: '4px' }}>Questão {q.numero}</strong>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>{q.enunciado}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                width: '28px', height: '28px', borderRadius: '6px', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600,
                background: '#1db954',
              }}>A</span>
              <span style={{ flex: 1 }}>{q.respostaCorreta}</span>
              <span style={{ color: '#1db954', fontSize: '13px' }}>Resposta correta</span>
            </div>

            {!q.acertou && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  width: '28px', height: '28px', borderRadius: '6px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600,
                  background: '#e0525c',
                }}>B</span>
                <span style={{ flex: 1 }}>{q.respostaAluno}</span>
                <span style={{ color: '#e0525c', fontSize: '13px' }}>Resposta do aluno</span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </Layout>
  )
}
