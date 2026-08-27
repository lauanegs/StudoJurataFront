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
import { Tab } from '../../../components/ui/Tab'
import { Tag } from '../../../components/ui/Tag'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useFormulario } from '../../../hooks/useFormulario'
import { useHidratar } from '../../../hooks/useHidratar'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import {
  alunos as servicoAlunos,
  pessoas as servicoPessoas,
  responsaveis as servicoResponsaveis,
  vinculosResponsavel,
} from '../../../services/endpoints'
import { formatarData } from '../../../utils/format'
import { OPCOES_PARENTESCO, TEXTO_VERSAO_LGPD } from '../../../utils/labels'
import type { Parentesco } from '../../../types'
import { PessoaCampos } from '../_compartilhado/PessoaCampos'
import { PESSOA_VAZIA, type DadosPessoa } from '../_compartilhado/dadosPessoa'
import { dePessoa, paraPayloadPessoa, validarPessoa } from '../_compartilhado/validarPessoa'

/* Confirmado pelo usuário: mesmo padrão da aba "Alunos ativos" de Turmas —
   ação de destaque flutuante, alinhada à direita, acima do conteúdo (não
   mais dentro do slot actions do Card). */
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

const LinhaTermos = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
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
  /** Item 10.3 (LGPD) — só existem depois que o vínculo já foi salvo (tem id). */
  aceitouTermos?: boolean
  dataAceite?: string
  textoVersao?: string
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

  const formulario = useFormulario<DadosPessoa>({
    valoresIniciais: PESSOA_VAZIA,
    validarTudo: validarPessoa,
  })
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
    formulario.reiniciar(dePessoa(aluno.pessoa))
    setMatricula(aluno.matricula ?? '')
  })

  useHidratar(requisicaoVinculos.data, (lista) => {
    setVinculos(
      lista.map((vinculo) => ({
        id: vinculo.id,
        chave: String(vinculo.id),
        responsavelId: vinculo.responsavel?.id ?? null,
        parentesco: vinculo.parentesco ?? null,
        aceitouTermos: vinculo.aceitouTermos ?? false,
        dataAceite: vinculo.dataAceite,
        textoVersao: vinculo.textoVersao,
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

  // PessoaCampos espera um objeto de erros "só os visíveis" (campo tocado ou
  // já tentou enviar) — useFormulario expõe isso por campo via erroDe().
  const errosVisiveis = useMemo(() => {
    const visiveis: Partial<Record<keyof DadosPessoa, string>> = {}

    ;(Object.keys(formulario.erros) as (keyof DadosPessoa)[]).forEach((campo) => {
      const erro = formulario.erroDe(campo)
      if (erro) visiveis[campo] = erro
    })

    return visiveis
  }, [formulario])

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
    const enviado = await formulario.aoEnviar(async (pessoa) => {
      if (!validarVinculos()) return

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
      }
    })()

    if (!enviado) {
      toast.warning('Revise os campos', 'Há informações obrigatórias pendentes.')
    }
  })

  /** Item 10.3 — checkbox de aceite dos termos LGPD, só disponível para vínculo já salvo. */
  async function registrarAceite(vinculo: VinculoForm) {
    if (!vinculo.id) return

    try {
      const atualizado = await vinculosResponsavel.aceitarTermos(vinculo.id, TEXTO_VERSAO_LGPD)

      setVinculos((atuais) =>
        atuais.map((item) =>
          item.chave === vinculo.chave
            ? {
                ...item,
                aceitouTermos: atualizado.aceitouTermos,
                dataAceite: atualizado.dataAceite,
                textoVersao: atualizado.textoVersao,
              }
            : item,
        ),
      )

      toast.success('Aceite registrado')
    } catch (erroAceite) {
      toast.error(
        'Não foi possível registrar o aceite',
        erroAceite instanceof ApiError ? erroAceite.message : undefined,
      )
    }
  }

  const { executar: excluirAluno, executando: excluindo } = useAcao(async () => {
    if (!alunoId) return

    await confirmar({
      titulo: 'Excluir aluno?',
      descricao: 'O aluno deixará de aparecer nas listagens, mas o histórico é preservado.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
      aoConfirmar: async () => {
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
      },
    })
  })

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
            {edicao ? (
              <Button
                variant="danger"
                size="large"
                icon={<Trash2 />}
                loading={excluindo}
                onClick={excluirAluno}
                disabled={salvando}
              >
                Excluir
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
              <Lista>
                <PessoaCampos
                  secao={aba}
                  valores={formulario.valores}
                  erros={errosVisiveis}
                  onChange={(campo, value) => formulario.definirCampo(campo, value)}
                  onExit={(campo) => formulario.marcarTocado(campo)}
                  disabled={salvando}
                  rotuloNome="Nome do aluno"
                />

                {aba === 'dados' && (
                  <Input
                    label="Matrícula"
                    placeholder="Código interno da escola (opcional)"
                    value={matricula}
                    disabled={salvando}
                    maxLength={30}
                    hint="Deixe em branco para a secretaria preencher depois."
                    onChange={(evento) => setMatricula(evento.target.value)}
                  />
                )}
              </Lista>
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
                <Lista>
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

                      <LinhaTermos>
                        <Tag variant={vinculo.aceitouTermos ? 'success' : 'warning'}>
                          {vinculo.aceitouTermos
                            ? `Termos aceitos em ${formatarData(vinculo.dataAceite)}`
                            : 'Termos pendentes'}
                        </Tag>

                        <Button
                          variant="secondary"
                          size="small"
                          disabled={!vinculo.id || vinculo.aceitouTermos || salvando}
                          onClick={() => registrarAceite(vinculo)}
                        >
                          Registrar aceite
                        </Button>
                      </LinhaTermos>
                    </LinhaResponsavel>
                  ))}
                </Lista>
              )}
              </Card>
            </>
          )}
        </>
      )}
    </Layout>
  )
}
