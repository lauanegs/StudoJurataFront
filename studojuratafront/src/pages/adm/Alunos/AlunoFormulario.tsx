import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Plus, Save, Trash2, UserRound } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Header } from '../../../components/ui/Header'
import { IconButton } from '../../../components/ui/IconButton'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useHidratar } from '../../../hooks/useHidratar'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import {
  alunos as servicoAlunos,
  pessoas as servicoPessoas,
  responsaveis as servicoResponsaveis,
  vinculosResponsavel,
} from '../../../services/endpoints'
import { OPCOES_PARENTESCO } from '../../../utils/labels'
import type { Parentesco } from '../../../types'
import { PessoaCampos } from '../_compartilhado/PessoaCampos'
import { PESSOA_VAZIA, type DadosPessoa } from '../_compartilhado/dadosPessoa'
import { dePessoa, paraPayloadPessoa, validarPessoa } from '../_compartilhado/validarPessoa'

const LinhaResponsavel = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  align-items: end;
  gap: ${({ theme }) => theme.spacing.sm};

  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-of-type {
    border-bottom: none;
    padding-bottom: 0;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`

const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
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

  const [pessoa, setPessoa] = useState<DadosPessoa>(PESSOA_VAZIA)
  const [matricula, setMatricula] = useState('')
  const [vinculos, setVinculos] = useState<VinculoForm[]>([])
  const [tocados, setTocados] = useState<Partial<Record<keyof DadosPessoa, boolean>>>({})
  const [tentouSalvar, setTentouSalvar] = useState(false)
  const [salvando, setSalvando] = useState(false)

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
    setPessoa(dePessoa(aluno.pessoa))
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

  const errosPessoa = useMemo(() => validarPessoa(pessoa), [pessoa])

  const errosVisiveis = useMemo(() => {
    const visiveis: Partial<Record<keyof DadosPessoa, string>> = {}

    ;(Object.keys(errosPessoa) as (keyof DadosPessoa)[]).forEach((campo) => {
      if (tocados[campo] || tentouSalvar) visiveis[campo] = errosPessoa[campo]
    })

    return visiveis
  }, [errosPessoa, tocados, tentouSalvar])

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

  async function salvar() {
    setTentouSalvar(true)

    if (Object.keys(errosPessoa).length > 0) {
      toast.warning('Revise os campos', 'Há informações obrigatórias pendentes.')
      return
    }

    if (!validarVinculos()) return

    setSalvando(true)

    try {
      const payloadPessoa = paraPayloadPessoa(pessoa)

      // Aluno e Pessoa são entidades separadas no back (@OneToOne), então a
      // Pessoa é gravada primeiro e o Aluno referencia o id retornado.
      const pessoaSalva = edicao
        ? await servicoPessoas.atualizar(requisicaoAluno.data!.pessoa.id, payloadPessoa)
        : await servicoPessoas.criar(payloadPessoa)

      const alunoSalvo = edicao
        ? await servicoAlunos.atualizar(alunoId as number, {
            pessoa: pessoaSalva,
            matricula: matricula.trim() || undefined,
          })
        : await servicoAlunos.criar({
            pessoa: pessoaSalva,
            matricula: matricula.trim() || undefined,
          })

      await sincronizarVinculos(alunoSalvo.id)

      toast.success(
        edicao ? 'Aluno atualizado' : 'Aluno cadastrado',
        `${pessoaSalva.nome} foi salvo com sucesso.`,
      )

      navegar('/adm/alunos')
    } catch (erroSalvar) {
      toast.error(
        'Não foi possível salvar',
        erroSalvar instanceof ApiError ? erroSalvar.message : undefined,
      )
    } finally {
      setSalvando(false)
    }
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

  async function excluirAluno() {
    if (!alunoId) return

    const confirmado = await confirmar({
      titulo: 'Excluir aluno?',
      descricao: 'O aluno deixará de aparecer nas listagens, mas o histórico é preservado.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
    })

    if (!confirmado) return

    try {
      await servicoAlunos.excluir(alunoId)
      toast.success('Aluno excluído')
      navegar('/adm/alunos')
    } catch (erroExclusao) {
      toast.error(
        'Não foi possível excluir',
        erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
      )
    }
  }

  if (edicao && requisicaoAluno.error) {
    return (
      <Layout>
        <Header titulo="Aluno" voltarPara="/adm/alunos" rotuloVoltar="Voltar para alunos" />
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
        rotuloVoltar="Voltar para alunos"
        actions={
          <>
            {edicao && (
              <Button variant="danger" icon={<Trash2 />} onClick={excluirAluno} disabled={salvando}>
                Excluir
              </Button>
            )}
            <Button variant="danger" onClick={() => navegar('/adm/alunos')} disabled={salvando}>
              Cancelar
            </Button>
            <Button variant="success" icon={<Save />} loading={salvando} onClick={salvar}>
              Salvar
            </Button>
          </>
        }
      />

      {carregandoTela ? (
        <SkeletonCartao />
      ) : (
        <>
          <Card titulo="Dados do aluno">
            <Lista>
              <PessoaCampos
                valores={pessoa}
                erros={errosVisiveis}
                onChange={(campo, value) => setPessoa((atual) => ({ ...atual, [campo]: value }))}
                onExit={(campo) => setTocados((atual) => ({ ...atual, [campo]: true }))}
                disabled={salvando}
                rotuloNome="Nome do aluno"
              />

              <Input
                label="Matrícula"
                placeholder="Código interno da escola (opcional)"
                value={matricula}
                disabled={salvando}
                maxLength={30}
                hint="Deixe em branco para a secretaria preencher depois."
                onChange={(evento) => setMatricula(evento.target.value)}
              />
            </Lista>
          </Card>

          <Card
            titulo="Responsáveis"
            actions={
              <Button
                variant="secondary"
                size="small"
                icon={<Plus />}
                disabled={salvando}
                onClick={() => setVinculos((atuais) => [...atuais, novoVinculo()])}
              >
                Vincular responsável
              </Button>
            }
          >
            {vinculos.length === 0 ? (
              <EstadoVazio
                titulo="Nenhum responsável vinculado"
                descricao="Vincule ao menos um responsável legal para o acompanhamento do aluno."
                icon={<UserRound />}
              />
            ) : (
              <Lista>
                {vinculos.map((vinculo) => (
                  <LinhaResponsavel key={vinculo.chave}>
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
                  </LinhaResponsavel>
                ))}
              </Lista>
            )}
          </Card>
        </>
      )}
    </Layout>
  )
}
