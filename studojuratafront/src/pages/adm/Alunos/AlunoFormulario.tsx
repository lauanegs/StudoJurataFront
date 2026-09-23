import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Archive, ArchiveRestore, Plus, Save, Trash2, UserRound } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Header } from '../../../components/ui/Header'
import { IconButton } from '../../../components/ui/IconButton'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Tab } from '../../../components/ui/Tab'
import { Stack } from '../../../components/ui/Stack'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useHidratar } from '../../../hooks/useHidratar'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import {
  alunos as servicoAlunos,
  pessoas as servicoPessoas,
  responsaveis as servicoResponsaveis,
  vinculosResponsavel,
} from '../../../services/pessoas'
import { OPCOES_PARENTESCO } from '../../../utils/labels'
import type { Parentesco } from '../../../types/pessoas'
import { PessoaCampos } from '../../../components/pessoas/PessoaCampos'
import { abaDoCampoPessoa, dePessoa, paraPayloadPessoa, useFormularioPessoa } from '../../../formularios/pessoas'

/* Ação de destaque acima do conteúdo, à direita, como na aba "Alunos ativos" de Turmas. */
const LinhaAcaoFlutuante = styled.div`
  display: flex;
  justify-content: flex-end;
`

const LinhaResponsavel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-of-type {
    border-bottom: none;
    padding-bottom: 0;
  }
`

const CamposResponsavel = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  align-items: end;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`

interface VinculoForm {
  /** Id do ResponsavelAluno quando o vínculo já existe no back. */
  id?: number
  chave: string
  responsavelId: number | null
  parentesco: Parentesco | null
  erroResponsavel?: string
  erroParentesco?: string
}

function novoVinculo(): VinculoForm {
  return { chave: crypto.randomUUID(), responsavelId: null, parentesco: null }
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
        responsavelId: vinculo.responsavel?.id ?? null,
        parentesco: vinculo.parentesco ?? null,
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

  function validarVinculos(): boolean {
    let valido = true

    setVinculos((atuais) =>
      atuais.map((vinculo) => {
        const erroResponsavel = vinculo.responsavelId ? undefined : 'Selecione o responsável'
        const erroParentesco = vinculo.parentesco ? undefined : 'Selecione o parentesco'

        if (erroResponsavel || erroParentesco) valido = false

        return { ...vinculo, erroResponsavel, erroParentesco }
      }),
    )

    // Responsável duplicado quebraria a unique constraint (responsavel_id, aluno_id).
    const ids = vinculos.map((vinculo) => vinculo.responsavelId).filter(Boolean)
    if (new Set(ids).size !== ids.length) {
      toast.warning('Responsável repetido', 'Cada responsável só pode ser vinculado uma vez.')
      valido = false
    }

    return valido
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

    if (!validarVinculos()) {
      setAba('responsaveis')
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
            <>
              <LinhaAcaoFlutuante>
                <Button
                  size="large"
                  icon={<Plus />}
                  disabled={salvando}
                  onClick={() => setVinculos((atuais) => [...atuais, novoVinculo()])}
                >
                  Vincular responsável
                </Button>
              </LinhaAcaoFlutuante>

              <Card titulo="Responsáveis">
              {vinculos.length === 0 ? (
                <EstadoVazio
                  titulo="Nenhum responsável vinculado"
                  descricao="Vincule ao menos um responsável legal para o acompanhamento do aluno."
                  icon={<UserRound />}
                />
              ) : (
                <Stack gap="md">
                  {vinculos.map((vinculo) => (
                    <LinhaResponsavel key={vinculo.chave}>
                      <CamposResponsavel>
                        <Select<number>
                          label="Responsável"
                          required
                          options={opcoesResponsaveis}
                          value={vinculo.responsavelId}
                          loading={requisicaoResponsaveis.loading}
                          error={vinculo.erroResponsavel}
                          searchable
                          placeholder="Selecione o responsável..."
                          emptyText="Cadastre um responsável primeiro"
                          onChange={(value) =>
                            setVinculos((atuais) =>
                              atuais.map((item) =>
                                item.chave === vinculo.chave
                                  ? { ...item, responsavelId: value, erroResponsavel: undefined }
                                  : item,
                              ),
                            )
                          }
                        />

                        <Select<Parentesco>
                          label="Parentesco"
                          required
                          options={OPCOES_PARENTESCO.map((opcao) => ({
                            value: opcao.value,
                            label: opcao.label,
                          }))}
                          value={vinculo.parentesco}
                          error={vinculo.erroParentesco}
                          placeholder="Selecione..."
                          onChange={(value) =>
                            setVinculos((atuais) =>
                              atuais.map((item) =>
                                item.chave === vinculo.chave
                                  ? { ...item, parentesco: value, erroParentesco: undefined }
                                  : item,
                              ),
                            )
                          }
                        />

                        <IconButton
                          label="Remover responsável"
                          icon={<Trash2 />}
                          variant="danger"
                          onClick={() =>
                            setVinculos((atuais) => atuais.filter((item) => item.chave !== vinculo.chave))
                          }
                        />
                      </CamposResponsavel>
                    </LinhaResponsavel>
                  ))}
                </Stack>
              )}
              </Card>
            </>
          )}
        </>
      )}
    </Layout>
  )
}
