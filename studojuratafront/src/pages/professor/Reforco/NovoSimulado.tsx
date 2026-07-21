import { useState } from 'react'
import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { Card } from '../../../components/ui/Card/Card'
import { TextArea } from '../../../components/ui/TextArea/TextArea'
import { Button } from '../../../components/ui/Button'
import { ImportarQuestaoDialog } from './ImportarQuestaoDialog'
import type { TipoQuestao } from '../../../types'

interface AlternativaForm {
  letra: string
  texto: string
  correta: boolean
}

interface QuestaoForm {
  tipo: TipoQuestao
  pergunta: string
  alternativas: AlternativaForm[]
}

function novaQuestao(): QuestaoForm {
  return {
    tipo: 'ALTERNATIVAS',
    pergunta: '',
    alternativas: [
      { letra: 'A', texto: '', correta: false },
      { letra: 'B', texto: '', correta: false },
      { letra: 'C', texto: '', correta: false },
    ],
  }
}

export default function NovoSimulado() {
  const [questoes, setQuestoes] = useState<QuestaoForm[]>([novaQuestao()])
  const [questaoAtiva, setQuestaoAtiva] = useState(0)
  const [modalImportar, setModalImportar] = useState(false)

  const questao = questoes[questaoAtiva]

  function atualizarQuestao(parcial: Partial<QuestaoForm>) {
    setQuestoes((prev) => prev.map((q, i) => (i === questaoAtiva ? { ...q, ...parcial } : q)))
  }

  function atualizarAlternativa(index: number, parcial: Partial<AlternativaForm>) {
    atualizarQuestao({
      alternativas: questao.alternativas.map((a, i) => (i === index ? { ...a, ...parcial } : a)),
    })
  }

  function marcarCorreta(index: number) {
    atualizarQuestao({
      alternativas: questao.alternativas.map((a, i) => ({ ...a, correta: i === index })),
    })
  }

  function adicionarQuestao() {
    setQuestoes((prev) => [...prev, novaQuestao()])
    setQuestaoAtiva(questoes.length)
  }

  return (
    <Layout perfil="professor">
      <Header titulo="Novo simulado">
        <Button label="Salvar" style={{ background: '#1db954' }} />
      </Header>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <strong>Questão {questaoAtiva + 1}</strong>
          <Button label="Importar questão" onClick={() => setModalImportar(true)} />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <Button
            label="Alternativas"
            onClick={() => atualizarQuestao({ tipo: 'ALTERNATIVAS' })}
            style={{ background: questao.tipo === 'ALTERNATIVAS' ? '#8b5cf6' : '#c4b5fd' }}
          />
          <Button
            label="Verdadeiro / Falso"
            onClick={() => atualizarQuestao({ tipo: 'VERDADEIRO_FALSO' })}
            style={{ background: questao.tipo === 'VERDADEIRO_FALSO' ? '#8b5cf6' : '#c4b5fd' }}
          />
        </div>

        <TextArea
          placeholder="Digite a pergunta..."
          value={questao.pergunta}
          onChange={(e) => atualizarQuestao({ pergunta: e.target.value })}
          style={{ minHeight: '100px', marginBottom: '16px' }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {questao.alternativas.map((alt, index) => (
            <div key={alt.letra} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {questao.tipo === 'ALTERNATIVAS' ? (
                <button
                  onClick={() => marcarCorreta(index)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '6px', border: 'none',
                    background: alt.correta ? '#1db954' : '#8b5cf6', color: '#fff', fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {alt.letra}
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => atualizarAlternativa(index, { correta: true })}
                    style={{
                      width: '28px', height: '32px', borderRadius: '6px', border: 'none',
                      background: alt.correta ? '#1db954' : '#e5e7eb', color: alt.correta ? '#fff' : '#374151',
                      cursor: 'pointer', fontWeight: 600,
                    }}
                  >V</button>
                  <button
                    onClick={() => atualizarAlternativa(index, { correta: false })}
                    style={{
                      width: '28px', height: '32px', borderRadius: '6px', border: 'none',
                      background: !alt.correta ? '#e0525c' : '#e5e7eb', color: !alt.correta ? '#fff' : '#374151',
                      cursor: 'pointer', fontWeight: 600,
                    }}
                  >F</button>
                </div>
              )}

              <input
                placeholder="Digite a alternativa..."
                value={alt.texto}
                onChange={(e) => atualizarAlternativa(index, { texto: e.target.value })}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: '8px', border: '2px solid #d1d5db',
                  outline: 'none', fontSize: '14px',
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '20px' }}>
          {questoes.map((_, index) => (
            <button
              key={index}
              onClick={() => setQuestaoAtiva(index)}
              style={{
                width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                background: index === questaoAtiva ? '#8b5cf6' : '#f1f5f9',
                color: index === questaoAtiva ? '#fff' : '#374151',
                cursor: 'pointer', fontWeight: 600,
              }}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={adicionarQuestao}
            style={{
              width: '32px', height: '32px', borderRadius: '8px', border: '1px dashed #c4b5fd',
              background: 'transparent', color: '#8b5cf6', cursor: 'pointer', fontWeight: 700,
            }}
          >
            +
          </button>
        </div>
      </Card>

      <ImportarQuestaoDialog
        isOpen={modalImportar}
        onClose={() => setModalImportar(false)}
        onImportar={(importadas) => {
          if (importadas.length === 0) return
          atualizarQuestao({ pergunta: importadas[0].enunciado })
        }}
      />
    </Layout>
  )
}
