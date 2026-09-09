import { Download, Plus, Trash2 } from 'lucide-react'

import { Button } from '../Button'
import { Card } from '../Card'
import { IconButton } from '../IconButton'
import { Input } from '../Input'
import { Select } from '../Select'
import { Tag } from '../Tag'
import { TextArea } from '../TextArea'
import { letraAlternativa } from '../../../utils/format'
import {
  OPCOES_NIVEL_DIFICULDADE,
  ROTULO_STATUS_QUESTAO,
  STATUS_QUESTAO_VARIANT,
} from '../../../utils/labels'
import type { NivelDificuldade } from '../../../types'
import * as S from './styles'
import {
  MAXIMO_ALTERNATIVAS,
  MINIMO_ALTERNATIVAS,
  afirmacoesVerdadeiroFalso,
  type AlternativaEditavel,
  type QuestaoEditorProps,
} from './types'

/**
 * Editor de uma questão de simulado. É o mesmo componente usado na criação
 * (professor monta o simulado) e na revisão (professor aprova/edita questões
 * geradas pela IA) — muda apenas `somenteLeitura` e o slot `actions`.
 *
 * Confirmado no Figma ("novo simulado — tipo questão v/f"): uma questão V/F
 * tem a MESMA estrutura de Alternativas (um enunciado + uma lista de
 * afirmações) — só que cada afirmação é julgada Verdadeira/Falsa de forma
 * independente, em vez de "só uma é a correta". Por isso as duas variantes
 * dividem quase todo o layout aqui; o que muda é só o controle de
 * correção de cada linha (um botão de letra vs. um par V/F) e os textos.
 */
export function QuestaoEditor({
  questao,
  onChange,
  indice,
  total,
  somenteLeitura = false,
  erros = {},
  onRemove,
  onImport,
  actions,
  navegador,
  conteudo,
}: QuestaoEditorProps) {
  const verdadeiroFalso = questao.tipo === 'VERDADEIRO_FALSO'

  function atualizar(parcial: Partial<typeof questao>) {
    onChange({ ...questao, ...parcial })
  }

  function trocarTipo(tipo: typeof questao.tipo) {
    if (tipo === questao.tipo) return

    atualizar({
      tipo,
      alternativas:
        tipo === 'VERDADEIRO_FALSO'
          ? afirmacoesVerdadeiroFalso()
          : [
              { texto: '', correta: true },
              { texto: '', correta: false },
              { texto: '', correta: false },
            ],
    })
  }

  function atualizarAlternativa(posicao: number, parcial: Partial<AlternativaEditavel>) {
    atualizar({
      alternativas: questao.alternativas.map((alternativa, i) =>
        i === posicao ? { ...alternativa, ...parcial } : alternativa,
      ),
    })
  }

  /** Alternativas: só uma pode ser a correta — marcar uma desmarca as outras. */
  function marcarCorreta(posicao: number) {
    atualizar({
      alternativas: questao.alternativas.map((alternativa, i) => ({
        ...alternativa,
        correta: i === posicao,
      })),
    })
  }

  /** V/F: cada afirmação julgada à parte — não mexe nas outras linhas. */
  function julgarAfirmacao(posicao: number, valor: boolean) {
    atualizarAlternativa(posicao, { correta: valor })
  }

  function adicionarAlternativa() {
    if (questao.alternativas.length >= MAXIMO_ALTERNATIVAS) return
    atualizar({ alternativas: [...questao.alternativas, { texto: '', correta: false }] })
  }

  function removerAlternativa(posicao: number) {
    if (questao.alternativas.length <= MINIMO_ALTERNATIVAS) return

    const restantes = questao.alternativas.filter((_, i) => i !== posicao)

    // Alternativas precisa de uma correta sobrando; V/F não (cada uma julga
    // sua própria afirmação, "nenhuma verdadeira" é um estado válido).
    if (!verdadeiroFalso && !restantes.some((alternativa) => alternativa.correta)) {
      restantes[0].correta = true
    }

    atualizar({ alternativas: restantes })
  }

  const rotuloLista = verdadeiroFalso ? 'Afirmações' : 'Alternativas'
  const rotuloBotaoAdicionar = verdadeiroFalso ? 'Adicionar afirmação' : 'Adicionar alternativa'
  const rotuloPlaceholder = (posicao: number) =>
    verdadeiroFalso
      ? `Digite a afirmação ${letraAlternativa(posicao)}...`
      : `Digite a alternativa ${letraAlternativa(posicao)}...`

  return (
    <Card>
      <S.Cabecalho>
        <S.Identificacao>
          <S.Numero>
            Questão {indice + 1}
            <span style={{ opacity: 0.5, fontSize: '0.7em' }}> / {total}</span>
          </S.Numero>

          {questao.status && (
            <Tag variant={STATUS_QUESTAO_VARIANT[questao.status]} size="small">
              {ROTULO_STATUS_QUESTAO[questao.status]}
            </Tag>
          )}
        </S.Identificacao>

        <S.Acoes>
          {actions}

          {onImport && !somenteLeitura && (
            <Button variant="secondary" size="small" icon={<Download />} onClick={onImport}>
              Importar questão
            </Button>
          )}

          {onRemove && !somenteLeitura && total > 1 && (
            <IconButton
              label="Remover questão"
              icon={<Trash2 />}
              variant="danger"
              onClick={onRemove}
            />
          )}
        </S.Acoes>
      </S.Cabecalho>

      <S.Grade>
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#656565',
              marginBottom: '8px',
            }}
          >
            Tipo de questão
          </div>

          <S.SeletorTipo role="group" aria-label="Tipo de questão">
            <S.OpcaoTipo
              type="button"
              $ativa={!verdadeiroFalso}
              disabled={somenteLeitura}
              aria-pressed={!verdadeiroFalso}
              onClick={() => trocarTipo('ALTERNATIVAS')}
            >
              Alternativas
            </S.OpcaoTipo>

            <S.OpcaoTipo
              type="button"
              $ativa={verdadeiroFalso}
              disabled={somenteLeitura}
              aria-pressed={verdadeiroFalso}
              onClick={() => trocarTipo('VERDADEIRO_FALSO')}
            >
              Verdadeiro / Falso
            </S.OpcaoTipo>
          </S.SeletorTipo>
        </div>

        <Select<NivelDificuldade>
          label="Nível de dificuldade"
          options={OPCOES_NIVEL_DIFICULDADE.map((opcao) => ({
            value: opcao.value,
            label: opcao.label,
          }))}
          value={questao.nivelDificuldade ?? null}
          onChange={(value) => atualizar({ nivelDificuldade: value })}
          disabled={somenteLeitura}
          placeholder="Selecionar nível..."
          clearable
        />
      </S.Grade>

      <TextArea
        label="Enunciado"
        required
        placeholder="Digite o enunciado..."
        value={questao.enunciado}
        disabled={somenteLeitura}
        error={erros.enunciado}
        maxLength={1000}
        rows={3}
        autoAltura
        onChange={(evento) => atualizar({ enunciado: evento.target.value })}
      />

      <div style={{ marginTop: '16px' }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#656565',
            marginBottom: '8px',
          }}
        >
          {rotuloLista} <span style={{ color: '#FF383C' }}>*</span>
        </div>

        <S.ListaAlternativas>
          {questao.alternativas.map((alternativa, posicao) => (
            <S.LinhaAlternativa key={posicao} $correta={!verdadeiroFalso && alternativa.correta}>
              {verdadeiroFalso ? (
                <S.GrupoVF role="group" aria-label={`Afirmação ${letraAlternativa(posicao)}`}>
                  <S.BotaoCorreta
                    type="button"
                    $correta={alternativa.correta}
                    disabled={somenteLeitura}
                    aria-pressed={alternativa.correta}
                    title="Marcar esta afirmação como Verdadeira"
                    onClick={() => julgarAfirmacao(posicao, true)}
                  >
                    V
                  </S.BotaoCorreta>
                  <S.BotaoCorreta
                    type="button"
                    $correta={!alternativa.correta}
                    disabled={somenteLeitura}
                    aria-pressed={!alternativa.correta}
                    title="Marcar esta afirmação como Falsa"
                    onClick={() => julgarAfirmacao(posicao, false)}
                  >
                    F
                  </S.BotaoCorreta>
                </S.GrupoVF>
              ) : (
                <S.BotaoCorreta
                  type="button"
                  $correta={alternativa.correta}
                  disabled={somenteLeitura}
                  aria-pressed={alternativa.correta}
                  title={
                    alternativa.correta
                      ? 'Esta é a alternativa correta'
                      : 'Marcar como alternativa correta'
                  }
                  onClick={() => marcarCorreta(posicao)}
                >
                  {letraAlternativa(posicao)}
                </S.BotaoCorreta>
              )}

              <S.CampoAlternativa>
                <Input
                  placeholder={rotuloPlaceholder(posicao)}
                  value={alternativa.texto}
                  disabled={somenteLeitura}
                  maxLength={500}
                  mostrarContador={false}
                  aria-label={`Texto da alternativa ${letraAlternativa(posicao)}`}
                  onChange={(evento) =>
                    atualizarAlternativa(posicao, { texto: evento.target.value })
                  }
                />
              </S.CampoAlternativa>

              {!somenteLeitura && questao.alternativas.length > MINIMO_ALTERNATIVAS && (
                <IconButton
                  label={`Remover alternativa ${letraAlternativa(posicao)}`}
                  icon={<Trash2 />}
                  variant="danger"
                  size="small"
                  onClick={() => removerAlternativa(posicao)}
                />
              )}
            </S.LinhaAlternativa>
          ))}
        </S.ListaAlternativas>

        {erros.alternativas && <S.MensagemErro role="alert">{erros.alternativas}</S.MensagemErro>}
      </div>

      <S.Rodape>
        <S.Dica>
          {verdadeiroFalso
            ? 'Clique em V ou F em cada linha para julgar a afirmação.'
            : 'Clique na letra para definir a alternativa correta.'}
        </S.Dica>

        {!somenteLeitura && (
          <Button
            variant="subtle"
            size="small"
            icon={<Plus />}
            disabled={questao.alternativas.length >= MAXIMO_ALTERNATIVAS}
            onClick={adicionarAlternativa}
          >
            {rotuloBotaoAdicionar}
          </Button>
        )}
      </S.Rodape>

      {conteudo}

      {navegador && (
        <S.SecaoNavegador role="group" aria-label="Navegação entre questões">
          {navegador}
        </S.SecaoNavegador>
      )}
    </Card>
  )
}
