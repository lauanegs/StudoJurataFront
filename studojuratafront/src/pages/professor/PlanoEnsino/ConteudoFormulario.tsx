import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Save } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Header } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { TextArea } from '../../../components/ui/TextArea'
import { Stack } from '../../../components/ui/Stack'
import { GradeAutoAjuste } from '../../../components/ui/GradeAutoAjuste'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useToast } from '../../../contexts/toastContexto'
import { useHidratar } from '../../../hooks/useHidratar'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { conteudosPlano, planosEnsino } from '../../../services/planejamento'
import { theme as tokens } from '../../../styles/theme'
import { useFormularioConteudo } from '../../../formularios/planejamento'

const Ajuda = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
`

/**
 * A qualidade da descrição importa: é a partir dela que a IA gera as questões
 * dos simulados de reforço.
 */
export default function ConteudoFormulario() {
  const { planoId, conteudoId } = useParams()
  const navegar = useNavigate()
  const toast = useToast()

  const idPlano = Number(planoId)
  const edicao = Boolean(conteudoId)
  const idConteudo = conteudoId ? Number(conteudoId) : null

  const form = useFormularioConteudo()

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
    form.setValues({
      ordem: conteudo.ordem?.toString() ?? '',
      titulo: conteudo.titulo ?? '',
      descricao: conteudo.descricao ?? '',
    })
    form.resetDirty()
  })

  // useHidratar aplica uma vez por resposta, sem sobrescrever o que foi digitado.
  useHidratar(!edicao ? requisicaoConteudos.data : null, () => {
    if (!form.getValues().ordem) form.setFieldValue('ordem', String(proximaOrdem))
  })

  const { executar: salvar, executando: salvando } = useAcao(async () => {
    if ((await form.validate()).hasErrors || !requisicaoPlano.data) return
    const { ordem, titulo, descricao } = form.getValues()

    try {
      const corpo = {
        planoEnsino: requisicaoPlano.data,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        ordem: ordem ? Number(ordem) : undefined,
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
        rotuloVoltar="Conteúdos"
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
          <Stack gap="md">
            <GradeAutoAjuste $larguraMinima="200px">
              <Input
                label="Ordem"
                type="number"
                min={1}
                {...form.getInputProps('ordem')}
                disabled={salvando}
                hint="Define a sequência das unidades."
              />

              <Input
                label="Título"
                required
                placeholder="Ex.: Unidade 1 — Introdução à lógica"
                {...form.getInputProps('titulo')}
                disabled={salvando}
                maxLength={150}
              />
            </GradeAutoAjuste>

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
              {...form.getInputProps('descricao')}
              disabled={salvando}
              maxLength={2000}
              rows={8}
              autoAltura
            />
          </Stack>
        </Card>
      )}
    </Layout>
  )
}
