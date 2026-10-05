import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Archive, ArchiveRestore, Save } from 'lucide-react'

import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'
import { Tab } from '@/components/ui/Tab'
import { ErroCarregamento } from '@/components/feedback/ErroCarregamento'
import { SkeletonCartao } from '@/components/feedback/Skeleton'
import { useConfirm } from '@/contexts/confirm/confirmContexto'
import { useToast } from '@/contexts/toast/toastContexto'
import { useHidratar } from '@/hooks/useHidratar'
import { useAcao, useRequisicao } from '@/hooks/useRequisicao'
import { ApiError } from '@/services/api'
import {
  alunos as servicoAlunos,
  pessoas as servicoPessoas,
  responsaveis as servicoResponsaveis,
  vinculosResponsavel,
} from '@/services/pessoas'
import type { Parentesco } from '@/types/pessoas'
import { VinculoResponsavelAluno } from '@/components/pessoas/VinculoResponsavelAluno'
import { PessoaCampos } from '@/components/pessoas/PessoaCampos'
import { abaDoCampoPessoa, dePessoa, paraPayloadPessoa, useFormularioPessoa } from '@/formularios/pessoas'

export default function ResponsavelFormulario() {
  const { id } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const edicao = Boolean(id)
  const responsavelId = id ? Number(id) : null

  const [aba, setAba] = useState<'dados' | 'endereco' | 'alunos'>('dados')

  const form = useFormularioPessoa()

  const requisicao = useRequisicao(
    () => servicoResponsaveis.buscar(responsavelId as number),
    [responsavelId],
    { ativo: Boolean(responsavelId) },
  )

  const requisicaoVinculos = useRequisicao(
    () => vinculosResponsavel.porResponsavel(responsavelId as number),
    [responsavelId],
    { ativo: Boolean(responsavelId) },
  )

  const requisicaoAlunos = useRequisicao(() => servicoAlunos.listar(), [], { ativo: edicao })

  const opcoesAlunos = useMemo(() => {
    const jaVinculados = new Set((requisicaoVinculos.data ?? []).map((vinculo) => vinculo.aluno?.id))

    return (requisicaoAlunos.data ?? [])
      .filter((aluno) => !jaVinculados.has(aluno.id))
      .map((aluno) => ({
        value: aluno.id,
        label: aluno.pessoa?.nome ?? `Aluno ${aluno.id}`,
        descricao: aluno.matricula,
      }))
  }, [requisicaoAlunos.data, requisicaoVinculos.data])

  const itensVinculos = useMemo(
    () =>
      (requisicaoVinculos.data ?? []).map((vinculo) => ({
        chave: String(vinculo.id),
        nome: vinculo.aluno?.pessoa?.nome ?? '—',
        parentesco: vinculo.parentesco,
      })),
    [requisicaoVinculos.data],
  )

  async function vincularAluno(alunoId: number, parentesco: Parentesco) {
    const aluno = (requisicaoAlunos.data ?? []).find((item) => item.id === alunoId)
    if (!aluno || !requisicao.data) return

    try {
      await vinculosResponsavel.criar({ aluno, responsavel: requisicao.data, parentesco })
      toast.success('Aluno vinculado', aluno.pessoa?.nome)
      await requisicaoVinculos.reload()
    } catch (erroVincular) {
      toast.error('Não foi possível vincular', erroVincular instanceof ApiError ? erroVincular.message : undefined)
    }
  }

  async function desvincularAluno(item: { chave: string; nome: string }) {
    await confirmar({
      titulo: 'Desvincular aluno?',
      descricao: `${item.nome} deixa de ser vinculado a este responsável.`,
      rotuloConfirmar: 'Desvincular',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await vinculosResponsavel.excluir(Number(item.chave))
          toast.success('Aluno desvinculado')
          await requisicaoVinculos.reload()
        } catch (erroDesvincular) {
          toast.error('Não foi possível desvincular', erroDesvincular instanceof ApiError ? erroDesvincular.message : undefined)
        }
      },
    })
  }

  useHidratar(requisicao.data, (responsavel) => {
    form.setValues(dePessoa(responsavel.pessoa))
    form.resetDirty()
  })

  const { executar: salvar, executando: salvando } = useAcao(async () => {
    const validacao = await form.validate()
    if (validacao.hasErrors) {
      setAba(abaDoCampoPessoa(Object.keys(validacao.errors)[0]))
      toast.warning('Revise os campos', 'Há informações obrigatórias pendentes.')
      return
    }

    try {
      const payloadPessoa = paraPayloadPessoa(form.getValues())

      const pessoaSalva = edicao
        ? await servicoPessoas.atualizar(requisicao.data!.pessoa.id, payloadPessoa)
        : await servicoPessoas.criar(payloadPessoa)

      if (edicao) {
        await servicoResponsaveis.atualizar(responsavelId as number, { pessoa: pessoaSalva })
        toast.success('Responsável atualizado', pessoaSalva.nome)
        // Permanece na tela: só recarrega o que o back gravou.
        await requisicao.reload()
      } else {
        const criado = await servicoResponsaveis.criar({ pessoa: pessoaSalva })
        toast.success('Responsável cadastrado', pessoaSalva.nome)
        // Continua no formulário, agora em modo de edição.
        navegar(`/adm/responsaveis/${criado.id}`, { replace: true })
      }
    } catch (erroSalvar) {
      toast.error(
        'Não foi possível salvar',
        erroSalvar instanceof ApiError ? erroSalvar.message : undefined,
      )
    }
  })

  const { executar: excluir, executando: excluindo } = useAcao(async () => {
    if (!responsavelId) return

    await confirmar({
      titulo: 'Inativar responsável?',
      descricao: 'Os vínculos com os alunos são preservados.',
      rotuloConfirmar: 'Inativar',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoResponsaveis.excluir(responsavelId)
          toast.success('Responsável inativado')
          navegar('/adm/responsaveis')
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
    if (!responsavelId) return

    await confirmar({
      titulo: 'Ativar responsável?',
      descricao: 'O responsável voltará a ficar ativo.',
      rotuloConfirmar: 'Ativar',
      aoConfirmar: async () => {
        try {
          await servicoResponsaveis.ativar(responsavelId)
          toast.success('Responsável ativado')
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
        <Header titulo="Responsável" voltarPara="/adm/responsaveis" />
        <ErroCarregamento mensagem={requisicao.error} onRetry={requisicao.reload} />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo={edicao ? 'Editar responsável' : 'Novo responsável'}
        voltarPara="/adm/responsaveis"
        rotuloVoltar="Responsáveis"
        actions={
          <>
            {edicao && requisicao.data?.pessoa?.status === 'INATIVO' ? (
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
                onClick={() => navegar('/adm/responsaveis')}
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
              disabled={excluindo}
              onClick={salvar}
            >
              Salvar
            </Button>
          </>
        }
      />

      <Tab<'dados' | 'endereco' | 'alunos'>
        rotuloAcessivel="Seções do responsável"
        value={aba}
        onChange={setAba}
        options={[
          { value: 'dados', label: 'Dados do responsável' },
          { value: 'endereco', label: 'Endereço' },
          ...(edicao
            ? [
                {
                  value: 'alunos' as const,
                  label: 'Alunos vinculados',
                  contador: requisicaoVinculos.data?.length,
                },
              ]
            : []),
        ]}
      />

      {edicao && requisicao.loading ? (
        <SkeletonCartao />
      ) : (
        <>
          {(aba === 'dados' || aba === 'endereco') && (
            <Card titulo={aba === 'dados' ? 'Dados do responsável' : 'Endereço'}>
              <PessoaCampos
                secao={aba}
                form={form}
                disabled={salvando}
                rotuloNome="Nome do responsável"
              />
            </Card>
          )}

          {edicao && aba === 'alunos' && (
            <VinculoResponsavelAluno
              titulo="Alunos vinculados"
              rotuloCampo="Aluno"
              opcoes={opcoesAlunos}
              carregandoOpcoes={requisicaoAlunos.loading}
              itens={itensVinculos}
              carregandoItens={requisicaoVinculos.loading}
              erroItens={requisicaoVinculos.error}
              onRecarregar={requisicaoVinculos.reload}
              aoVincular={vincularAluno}
              aoRemover={desvincularAluno}
              aoVer={(item) => {
                const vinculo = (requisicaoVinculos.data ?? []).find((v) => String(v.id) === item.chave)
                navegar(`/adm/alunos/${vinculo?.aluno?.id}`)
              }}
            />
          )}
        </>
      )}
    </Layout>
  )
}
