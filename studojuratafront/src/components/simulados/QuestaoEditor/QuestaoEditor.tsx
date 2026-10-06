import { Download, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { SeletorOpcoes } from '@/components/ui/SeletorOpcoes'
import { Tag } from '@/components/ui/Tag'
import { TextArea } from '@/components/ui/TextArea'
import { letraAlternativa } from '@/utils/format'
import {
  OPCOES_NIVEL_DIFICULDADE,
  ROTULO_STATUS_QUESTAO,
  STATUS_QUESTAO_VARIANT,
} from '@/utils/labels'
import type { NivelDificuldade, TipoQuestao } from '@/dominios/simulados/types'
import * as S from './styles'
import {
  MAXIMO_ALTERNATIVAS,
  MINIMO_ALTERNATIVAS,
  afirmacoesVerdadeiroFalso,
  type AlternativaEditavel,
  type QuestaoEditorProps,
} from './types'

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

  function marcarCorreta(posicao: number) {
    atualizar({
      alternativas: questao.alternativas.map((alternativa, i) => ({
        ...alternativa,
        correta: i === posicao,
      })),
    })
  }

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
            <S.Total> / {total}</S.Total>
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
          <S.RotuloCampo>Tipo de questão</S.RotuloCampo>

          <SeletorOpcoes<TipoQuestao>
            rotuloAcessivel="Tipo de questão"
            value={questao.tipo === 'VERDADEIRO_FALSO' ? 'VERDADEIRO_FALSO' : 'ALTERNATIVAS'}
            disabled={somenteLeitura}
            options={[
              { value: 'ALTERNATIVAS', label: 'Alternativas' },
              { value: 'VERDADEIRO_FALSO', label: 'Verdadeiro / Falso' },
            ]}
            onChange={trocarTipo}
          />
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

      <S.SecaoAlternativas>
        <S.RotuloCampo>
          {rotuloLista} <S.Obrigatorio>*</S.Obrigatorio>
        </S.RotuloCampo>

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
      </S.SecaoAlternativas>

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
      {erros.conteudo && <S.MensagemErro role="alert">{erros.conteudo}</S.MensagemErro>}

      {navegador && (
        <S.SecaoNavegador role="group" aria-label="Navegação entre questões">
          {navegador}
        </S.SecaoNavegador>
      )}
    </Card>
  )
}
