import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Archive, ArchiveRestore, Save } from 'lucide-react'

import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'
import { Input } from '@/components/ui/Input'
import { Tab } from '@/components/ui/Tab'
import { Stack } from '@/components/ui/Stack'
import { ErroCarregamento } from '@/components/feedback/ErroCarregamento'
import { SkeletonCartao } from '@/components/feedback/Skeleton'
import { useConfirm } from '@/contexts/confirmContexto'
import { useToast } from '@/contexts/toastContexto'
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

interface VinculoForm {
  /** Id do ResponsavelAluno quando o vínculo já existe no back. */
  id?: number
  chave: string
  responsavelId: number
  parentesco: Parentesco
}

export default function AlunoFormulario() {
  const { id } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const edicao = Boolean(id)
  const alunoId = id ? Number(id) : null

  const [aba, setAba] = useState<'dados' | 'endereco' | 'responsaveis'>('dados')

  // Aluno exige data de nascimento: é ela que define a exigência de responsável.
  const form = useFormularioPessoa({ exigirDataNascimento: true })
  const [matricula, setMatricula] = useState('')
  const [vinculos, setVinculos] = useState<VinculoForm[]>([])

  const requisicaoAluno = useRequisicao(
    () => servicoAlunos.buscar(alunoId as number),
    [alunoId],
    { ativo: Boolean(alunoId) },
  )

  const requisicaoVinculos = useRequisicao(
    () => vinculosResponsavel.porAluno(alunoId as number),
    [alunoId],
    { ativo: Boolean(alunoId) },
  )

  const requisicaoResponsaveis = useRequisicao(() => servicoResponsaveis.listar(), [])

  useHidratar(requisicaoAluno.data, (aluno) => {
    form.setValues(dePessoa(aluno.pessoa))
    form.resetDirty()
    setMatricula(aluno.matricula ?? '')
  })

  useHidratar(requisicaoVinculos.data, (lista) => {
    setVinculos(
      lista.map((vinculo) => ({
        id: vinculo.id,
        chave: String(vinculo.id),
        responsavelId: vinculo.responsavel?.id as number,
        parentesco: vinculo.parentesco as Parentesco,
      })),
    )
  })

  const opcoesResponsaveis = useMemo(
    () =>
      (requisicaoResponsaveis.data ?? []).map((responsavel) => ({
        value: responsavel.id,
        label: responsavel.pessoa?.nome ?? `Responsável ${responsavel.id}`,
        descricao: responsavel.pessoa?.cpf,
      })),
    [requisicaoResponsaveis.data],
  )

  const opcoesDisponiveis = useMemo(() => {
    const jaVinculados = new Set(vinculos.map((vinculo) => vinculo.responsavelId))
    return opcoesResponsaveis.filter((opcao) => !jaVinculados.has(opcao.value))
  }, [opcoesResponsaveis, vinculos])

  const itensVinculos = useMemo(
    () =>
      vinculos.map((vinculo) => ({
        // O id do responsável vira a chave para o botão "Ver" e para remover.
        chave: String(vinculo.responsavelId),
        nome: opcoesResponsaveis.find((opcao) => opcao.value === vinculo.responsavelId)?.label ?? `Responsável ${vinculo.responsavelId}`,
        parentesco: vinculo.parentesco,
      })),
    [vinculos, opcoesResponsaveis],
  )

  // Os vínculos ficam na tela e só vão para o back ao salvar o aluno.
  function vincularResponsavel(responsavelId: number, parentesco: Parentesco) {
    setVinculos((atuais) => [...atuais, { chave: crypto.randomUUID(), responsavelId, parentesco }])
  }

  async function removerResponsavel(item: { chave: string; nome: string }) {
    await confirmar({
      titulo: 'Remover responsável?',
      descricao: `${item.nome} deixa de ser responsável por este aluno quando você salvar.`,
      rotuloConfirmar: 'Remover',
      tone: 'danger',
      aoConfirmar: async () => {
        setVinculos((atuais) => atuais.filter((vinculo) => String(vinculo.responsavelId) !== item.chave))
      },
    })
  }

  async function sincronizarVinculos(idDoAluno: number) {
    const originais = requisicaoVinculos.data ?? []

    const removidos = originais.filter(
      (original) => !vinculos.some((vinculo) => vinculo.id === original.id),
    )

    await Promise.all(removidos.map((vinculo) => vinculosResponsavel.excluir(vinculo.id)))

    await Promise.all(
      vinculos.map((vinculo) => {
        const corpo = {
          aluno: { id: idDoAluno } as never,
          responsavel: { id: vinculo.responsavelId as number } as never,
          parentesco: vinculo.parentesco as Parentesco,
        }

        return vinculo.id
          ? vinculosResponsavel.atualizar(vinculo.id, corpo)
          : vinculosResponsavel.criar(corpo)
      }),
    )
  }

  const { executar: salvar, executando: salvando } = useAcao(async () => {
    const validacao = await form.validate()
    if (validacao.hasErrors) {
      setAba(abaDoCampoPessoa(Object.keys(validacao.errors)[0]))
      toast.warning('Revise os campos', 'Há informações obrigatórias pendentes.')
      return
    }

    try {
      const payloadPessoa = paraPayloadPessoa(form.getValues())

      // Aluno e Pessoa são entidades separadas no back (@OneToOne), então a
      // Pessoa é gravada primeiro e o Aluno referencia o id retornado.
      const pessoaSalva = edicao
        ? await servicoPessoas.atualizar(requisicaoAluno.data!.pessoa.id, payloadPessoa)
        : await servicoPessoas.criar(payloadPessoa)

      const alunoSalvo = edicao
        ? await servicoAlunos.atualizar(alunoId as number, {
            pessoa: pessoaSalva,
          })
        : await servicoAlunos.criar({
            pessoa: pessoaSalva,
          })

      await sincronizarVinculos(alunoSalvo.id)

      if (edicao) {
        toast.success('Aluno atualizado', `${pessoaSalva.nome} foi salvo com sucesso.`)
        // Permanece na tela: só recarrega o que o back gravou.
        await requisicaoAluno.reload()
      } else {
        toast.success('Aluno cadastrado', `${pessoaSalva.nome} foi salvo com sucesso.`)
        // Continua no formulário, agora em modo de edição (com matrícula gerada).
        navegar(`/adm/alunos/${alunoSalvo.id}`, { replace: true })
      }
    } catch (erroSalvar) {
      toast.error(
        'Não foi possível salvar',
        erroSalvar instanceof ApiError ? erroSalvar.message : undefined,
      )
    }
  })

  const { executar: excluirAluno, executando: excluindo } = useAcao(async () => {
    if (!alunoId) return

    await confirmar({
      titulo: 'Inativar aluno?',
      descricao: 'O aluno deixará de aparecer nas listagens. Só funciona se ele nunca teve matrícula em turma — matrícula ativa ou histórico impede.',
      rotuloConfirmar: 'Inativar',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoAlunos.excluir(alunoId)
          toast.success('Aluno inativado')
          navegar('/adm/alunos')
        } catch (erroExclusao) {
          toast.error(
            'Não foi possível inativar',
            erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
          )
        }
      },
    })
  })

  const { executar: ativarAluno, executando: ativando } = useAcao(async () => {
    if (!alunoId) return

    await confirmar({
      titulo: 'Ativar aluno?',
      descricao: 'O aluno voltará a ficar ativo.',
      rotuloConfirmar: 'Ativar',
      aoConfirmar: async () => {
        try {
          await servicoAlunos.ativar(alunoId)
          toast.success('Aluno ativado')
          await requisicaoAluno.reload()
        } catch (erroAtivacao) {
          toast.error(
            'Não foi possível ativar',
            erroAtivacao instanceof ApiError ? erroAtivacao.message : undefined,
          )
        }
      },
    })
  })

  if (edicao && requisicaoAluno.error) {
    return (
      <Layout>
        <Header titulo="Aluno" voltarPara="/adm/alunos" rotuloVoltar="Alunos" />
        <ErroCarregamento mensagem={requisicaoAluno.error} onRetry={requisicaoAluno.reload} />
      </Layout>
    )
  }

  const carregandoTela = edicao && requisicaoAluno.loading

  return (
    <Layout>
      <Header
        titulo={edicao ? 'Editar aluno' : 'Novo aluno'}
        voltarPara="/adm/alunos"
        rotuloVoltar="Alunos"
        actions={
          <>
            {edicao && requisicaoAluno.data?.pessoa?.status === 'INATIVO' ? (
              <Button
                variant="success"
                size="large"
                icon={<ArchiveRestore />}
                loading={ativando}
                onClick={ativarAluno}
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
                onClick={excluirAluno}
                disabled={salvando}
              >
                Inativar
              </Button>
            ) : (
              <Button
                variant="danger"
                size="large"
                onClick={() => navegar('/adm/alunos')}
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

      <Tab<'dados' | 'endereco' | 'responsaveis'>
        rotuloAcessivel="Seções do aluno"
        value={aba}
        onChange={setAba}
        options={[
          { value: 'dados', label: 'Dados do aluno' },
          { value: 'endereco', label: 'Endereço' },
          { value: 'responsaveis', label: 'Responsáveis', contador: vinculos.length },
        ]}
      />

      {carregandoTela ? (
        <SkeletonCartao />
      ) : (
        <>
          {(aba === 'dados' || aba === 'endereco') && (
            <Card titulo={aba === 'dados' ? 'Dados do aluno' : 'Endereço'}>
              <Stack gap="md">
                <PessoaCampos
                  secao={aba}
                  form={form}
                  disabled={salvando}
                  rotuloNome="Nome do aluno"
                  exigirDataNascimento
                />

                {aba === 'dados' && (
                  <Input
                    label="Matrícula"
                    value={edicao ? matricula : 'Gerada automaticamente ao salvar'}
                    disabled
                    hint="Código do aluno gerado pelo sistema (ano + sequência) — não é editável."
                  />
                )}
              </Stack>
            </Card>
          )}

          {aba === 'responsaveis' && (
            <VinculoResponsavelAluno
              titulo="Responsáveis do aluno"
              rotuloCampo="Responsável"
              opcoes={opcoesDisponiveis}
              carregandoOpcoes={requisicaoResponsaveis.loading}
              itens={itensVinculos}
              desabilitado={salvando}
              aoVincular={vincularResponsavel}
              aoRemover={removerResponsavel}
              aoVer={(item) => navegar(`/adm/responsaveis/${item.chave}`)}
            />
          )}
        </>
      )}
    </Layout>
  )
}
