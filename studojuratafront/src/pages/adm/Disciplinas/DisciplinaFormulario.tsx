import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Archive, ArchiveRestore, Save } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Header } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Stack } from '../../../components/ui/Stack'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useEscola } from '../../../hooks/useEscola'
import { useHidratar } from '../../../hooks/useHidratar'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { disciplinas as servicoDisciplinas } from '../../../services/curriculo'
import { useFormularioDisciplina } from '../../../formularios/curriculo'
import { OPCOES_ATIVA_INATIVA } from '../../../utils/labels'
import type { StatusAtivoInativo } from '../../../types/comum'

const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`

export default function DisciplinaFormulario() {
  const { id } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()
  const { escola, loading: carregandoEscola } = useEscola()

  const edicao = Boolean(id)
  const disciplinaId = id ? Number(id) : null

  const form = useFormularioDisciplina()

  const requisicao = useRequisicao(
    () => servicoDisciplinas.buscar(disciplinaId as number),
    [disciplinaId],
    { ativo: Boolean(disciplinaId) },
  )

  useHidratar(requisicao.data, (disciplina) => {
    form.setValues({ titulo: disciplina.titulo ?? '', ativa: disciplina.status !== 'INATIVO' })
    form.resetDirty()
  })

  const { executar: salvar, executando: salvando } = useAcao(async () => {
    if ((await form.validate()).hasErrors) return
    const { titulo, ativa } = form.getValues()

    if (!escola) {
      toast.error('Escola não encontrada', 'Cadastre uma escola antes de criar disciplinas.')
      return
    }

    try {
      const corpo = {
        escola,
        titulo: titulo.trim(),
        status: ativa ? ('ATIVO' as const) : ('INATIVO' as const),
      }

      if (edicao) {
        await servicoDisciplinas.atualizar(disciplinaId as number, corpo)
      } else {
        await servicoDisciplinas.criar(corpo)
      }

      toast.success(edicao ? 'Disciplina atualizada' : 'Disciplina cadastrada', titulo.trim())
      navegar('/adm/disciplinas')
    } catch (erroSalvar) {
      toast.error(
        'Não foi possível salvar',
        erroSalvar instanceof ApiError ? erroSalvar.message : undefined,
      )
    }
  })

  const { executar: excluir, executando: excluindo } = useAcao(async () => {
    if (!disciplinaId) return

    await confirmar({
      titulo: 'Inativar disciplina?',
      descricao: 'Notas e simulados já lançados continuam existindo.',
      rotuloConfirmar: 'Inativar',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoDisciplinas.excluir(disciplinaId)
          toast.success('Disciplina inativada')
          navegar('/adm/disciplinas')
        } catch (erroExclusao) {
          toast.error(
            'Não foi possível inativar',
            erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
          )
        }
      },
    })
  })

  const { executar: ativar, executando: ativando } = useAcao(async () => {
    if (!disciplinaId) return

    await confirmar({
      titulo: 'Ativar disciplina?',
      descricao: 'A disciplina voltará a ficar ativa.',
      rotuloConfirmar: 'Ativar',
      aoConfirmar: async () => {
        try {
          await servicoDisciplinas.ativar(disciplinaId)
          toast.success('Disciplina ativada')
          await requisicao.reload()
        } catch (erroAtivacao) {
          toast.error(
            'Não foi possível ativar',
            erroAtivacao instanceof ApiError ? erroAtivacao.message : undefined,
          )
        }
      },
    })
  })

  if (edicao && requisicao.error) {
    return (
      <Layout>
        <Header titulo="Disciplina" voltarPara="/adm/disciplinas" />
        <ErroCarregamento mensagem={requisicao.error} onRetry={requisicao.reload} />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo={edicao ? 'Editar disciplina' : 'Nova disciplina'}
        voltarPara="/adm/disciplinas"
        rotuloVoltar="Disciplinas"
        actions={
          <>
            {edicao && requisicao.data?.status === 'INATIVO' ? (
              <Button
                variant="success"
                size="large"
                icon={<ArchiveRestore />}
                loading={ativando}
                onClick={ativar}
                disabled={salvando}
              >
                Ativar
              </Button>
            ) : edicao ? (
              <Button
                variant="danger"
                size="large"
                icon={<Archive />}
                loading={excluindo}
                onClick={excluir}
                disabled={salvando}
              >
                Inativar
              </Button>
            ) : (
              <Button
                variant="danger"
                size="large"
                onClick={() => navegar('/adm/disciplinas')}
                disabled={salvando}
              >
                Cancelar
              </Button>
            )}
            <Button
              variant="success"
              size="large"
              icon={<Save />}
              loading={salvando}
              disabled={carregandoEscola || excluindo}
              onClick={salvar}
            >
              Salvar
            </Button>
          </>
        }
      />

      {edicao && requisicao.loading ? (
        <SkeletonCartao />
      ) : (
        <Card titulo="Dados da disciplina">
          <Stack gap="md">
            <Grade>
              <Input
                label="Nome da disciplina"
                required
                placeholder="Ex.: Robótica"
                {...form.getInputProps('titulo')}
                disabled={salvando}
                maxLength={120}
              />

              <Select<StatusAtivoInativo>
                label="Situação"
                options={OPCOES_ATIVA_INATIVA}
                value={form.values.ativa ? 'ATIVO' : 'INATIVO'}
                disabled={salvando}
                onChange={(valor) => form.setFieldValue('ativa', valor !== 'INATIVO')}
              />
            </Grade>
          </Stack>
        </Card>
      )}
    </Layout>
  )
}
