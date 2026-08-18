import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Save } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Header } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { TextArea } from '../../../components/ui/TextArea'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useToast } from '../../../contexts/toastContexto'
import { useHidratar } from '../../../hooks/useHidratar'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { conteudosPlano, planosEnsino } from '../../../services/endpoints'
import { theme as tokens } from '../../../styles/theme'

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

/* Confirmado no Figma: Ordem e Título dividem a primeira linha. Carga
   horária não aparece no mockup, mas o campo existe no back — mantido como
   3ª coluna, sem quebrar a leitura visual das outras duas. */
const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

const Ajuda = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
`

/**
 * Novo/editar conteúdo de um plano de ensino — página própria (não modal,
 * confirmado no Figma). A qualidade da descrição importa: é a partir dela
 * que o módulo de IA gera as questões dos simulados de reforço
 * (ia/service/GeracaoQuestaoIAService).
 */
export default function ConteudoFormulario() {
  const { planoId, conteudoId } = useParams()
  const navegar = useNavigate()
  const toast = useToast()

  const idPlano = Number(planoId)
  const edicao = Boolean(conteudoId)
  const idConteudo = conteudoId ? Number(conteudoId) : null

  const [ordem, setOrdem] = useState('')
  const [titulo, setTitulo] = useState('')
  const [cargaHoraria, setCargaHoraria] = useState('')
  const [descricao, setDescricao] = useState('')
  const [erros, setErros] = useState<Record<string, string | undefined>>({})

  const requisicaoPlano = useRequisicao(() => planosEnsino.buscar(idPlano), [idPlano])
  const requisicaoConteudos = useRequisicao(() => conteudosPlano.listar(), [])

  const conteudos = useMemo(
    () => (requisicaoConteudos.data ?? []).filter((item) => item.planoEnsino?.id === idPlano),
    [requisicaoConteudos.data, idPlano],
  )

  const proximaOrdem = useMemo(
    () => (conteudos.length === 0 ? 1 : Math.max(...conteudos.map((c) => c.ordem ?? 0)) + 1),
    [conteudos],
  )

  const requisicaoConteudo = useRequisicao(() => conteudosPlano.buscar(idConteudo as number), [idConteudo], {
    ativo: Boolean(idConteudo),
  })

  useHidratar(requisicaoConteudo.data, (conteudo) => {
    setOrdem(conteudo.ordem?.toString() ?? '')
    setTitulo(conteudo.titulo ?? '')
    setCargaHoraria(conteudo.cargaHoraria?.toString() ?? '')
    setDescricao(conteudo.descricao ?? '')
  })

  // Só sugere a próxima ordem em modo de criação, depois que a lista de
  // conteúdos carregou — useHidratar aplica uma única vez por resposta
  // (por referência), então não sobrescreve o que o usuário já digitou.
  useHidratar(!edicao ? requisicaoConteudos.data : null, () => {
    setOrdem((atual) => atual || String(proximaOrdem))
  })

  function validar() {
    const encontrados: Record<string, string | undefined> = {}

    if (!titulo.trim()) encontrados.titulo = 'Informe o título do conteúdo'

    if (!descricao.trim()) {
      encontrados.descricao = 'Descreva o conteúdo — a IA usa este texto para gerar as questões'
    } else if (descricao.trim().length < 30) {
      encontrados.descricao = 'Descreva com mais detalhe (mínimo de 30 caracteres)'
    }

    if (ordem && (!Number.isInteger(Number(ordem)) || Number(ordem) <= 0)) {
      encontrados.ordem = 'A ordem deve ser um número inteiro positivo'
    }

    if (cargaHoraria && (!Number.isFinite(Number(cargaHoraria)) || Number(cargaHoraria) <= 0)) {
      encontrados.cargaHoraria = 'Informe um número de horas maior que zero'
    }

    setErros(encontrados)
    return Object.keys(encontrados).filter((chave) => encontrados[chave]).length === 0
  }

  const { executar: salvar, executando: salvando } = useAcao(async () => {
    if (!validar() || !requisicaoPlano.data) return

    try {
      const corpo = {
        planoEnsino: requisicaoPlano.data,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        ordem: ordem ? Number(ordem) : undefined,
        cargaHoraria: cargaHoraria ? Number(cargaHoraria) : undefined,
        status: 'ATIVO' as const,
      }

      if (edicao) {
        await conteudosPlano.atualizar(idConteudo as number, corpo)
        toast.success('Conteúdo atualizado', corpo.titulo)
      } else {
        await conteudosPlano.criar(corpo)
        toast.success('Conteúdo adicionado', corpo.titulo)
      }

      navegar(`/professor/plano-ensino/${idPlano}/conteudos`)
    } catch (erroSalvar) {
      toast.error(
        'Não foi possível salvar',
        erroSalvar instanceof ApiError ? erroSalvar.message : undefined,
      )
    }
  })

  if (requisicaoPlano.error || requisicaoConteudo.error) {
    return (
      <Layout>
        <Header
          titulo="Conteúdo"
          voltarPara={`/professor/plano-ensino/${idPlano}/conteudos`}
        />
        <ErroCarregamento
          mensagem={requisicaoPlano.error ?? requisicaoConteudo.error ?? 'Não foi possível carregar.'}
          onRetry={requisicaoPlano.error ? requisicaoPlano.reload : requisicaoConteudo.reload}
        />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo={edicao ? 'Editar conteúdo' : 'Novo conteúdo'}
        voltarPara={`/professor/plano-ensino/${idPlano}/conteudos`}
        rotuloVoltar="Voltar para conteúdos"
        actions={
          <>
            <Button
              size="large"
              variant="danger"
              onClick={() => navegar(`/professor/plano-ensino/${idPlano}/conteudos`)}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button size="large" variant="success" icon={<Save />} loading={salvando} onClick={salvar}>
              Salvar
            </Button>
          </>
        }
      />

      {(edicao && requisicaoConteudo.loading) || requisicaoPlano.loading ? (
        <SkeletonCartao />
      ) : (
        <Card>
          <Coluna>
            <Grade>
              <Input
                label="Ordem"
                type="number"
                min={1}
                value={ordem}
                error={erros.ordem}
                disabled={salvando}
                hint="Define a sequência das unidades."
                onChange={(evento) => setOrdem(evento.target.value)}
              />

              <Input
                label="Título"
                required
                placeholder="Ex.: Unidade 1 — Introdução à lógica"
                value={titulo}
                error={erros.titulo}
                disabled={salvando}
                maxLength={150}
                onChange={(evento) => setTitulo(evento.target.value)}
              />

              <Input
                label="Carga horária"
                type="number"
                min={1}
                placeholder="Ex.: 8"
                value={cargaHoraria}
                error={erros.cargaHoraria}
                disabled={salvando}
                hint="Em horas."
                onChange={(evento) => setCargaHoraria(evento.target.value)}
              />
            </Grade>

            <Ajuda>
              <strong style={{ fontSize: tokens.typography.sizes.sm, color: tokens.colors.textStrong }}>
                Conteúdo detalhado:
              </strong>
              <span style={{ fontSize: tokens.typography.sizes.sm, color: tokens.colors.textSecondary }}>
                É importante que o conteúdo seja detalhadamente explicado, a fim de que o portal elabore
                questões bem alinhadas ao conteúdo desenvolvido durante o curso.
              </span>
            </Ajuda>

            <TextArea
              label="Conteúdo"
              required
              placeholder="Descreva os tópicos trabalhados, exemplos e o nível esperado..."
              value={descricao}
              error={erros.descricao}
              disabled={salvando}
              maxLength={2000}
              rows={8}
              autoAltura
              onChange={(evento) => setDescricao(evento.target.value)}
            />
          </Coluna>
        </Card>
      )}
    </Layout>
  )
}
