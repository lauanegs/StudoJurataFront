import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Eye, Save, Trash2 } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { IconButton } from '../../../components/ui/IconButton'
import { Tab } from '../../../components/ui/Tab'
import { Tag } from '../../../components/ui/Tag'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useFormulario } from '../../../hooks/useFormulario'
import { useHidratar } from '../../../hooks/useHidratar'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import {
  pessoas as servicoPessoas,
  responsaveis as servicoResponsaveis,
  vinculosResponsavel,
} from '../../../services/endpoints'
import { formatarData } from '../../../utils/format'
import { ROTULO_PARENTESCO } from '../../../utils/labels'
import type { ResponsavelAluno } from '../../../types'
import { PessoaCampos } from '../_compartilhado/PessoaCampos'
import { PESSOA_VAZIA, type DadosPessoa } from '../_compartilhado/dadosPessoa'
import { dePessoa, paraPayloadPessoa, validarPessoa } from '../_compartilhado/validarPessoa'

export default function ResponsavelFormulario() {
  const { id } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const edicao = Boolean(id)
  const responsavelId = id ? Number(id) : null

  const [aba, setAba] = useState<'dados' | 'endereco' | 'alunos'>('dados')

  const formulario = useFormulario<DadosPessoa>({
    valoresIniciais: PESSOA_VAZIA,
    validarTudo: validarPessoa,
  })

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

  useHidratar(requisicao.data, (responsavel) => formulario.reiniciar(dePessoa(responsavel.pessoa)))

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

  const { executar: salvar, executando: salvando } = useAcao(async () => {
    const enviado = await formulario.aoEnviar(async (pessoa) => {
      try {
        const payloadPessoa = paraPayloadPessoa(pessoa)

        const pessoaSalva = edicao
          ? await servicoPessoas.atualizar(requisicao.data!.pessoa.id, payloadPessoa)
          : await servicoPessoas.criar(payloadPessoa)

        if (edicao) {
          await servicoResponsaveis.atualizar(responsavelId as number, { pessoa: pessoaSalva })
        } else {
          await servicoResponsaveis.criar({ pessoa: pessoaSalva })
        }

        toast.success(edicao ? 'Responsável atualizado' : 'Responsável cadastrado', pessoaSalva.nome)
        navegar('/adm/responsaveis')
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

  const { executar: excluir, executando: excluindo } = useAcao(async () => {
    if (!responsavelId) return

    await confirmar({
      titulo: 'Excluir responsável?',
      descricao: 'Os vínculos com os alunos serão removidos.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoResponsaveis.excluir(responsavelId)
          toast.success('Responsável excluído')
          navegar('/adm/responsaveis')
        } catch (erroExclusao) {
          toast.error(
            'Não foi possível excluir',
            erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
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
            {edicao ? (
              <Button
                variant="danger"
                size="large"
                icon={<Trash2 />}
                loading={excluindo}
                onClick={excluir}
                disabled={salvando}
              >
                Excluir
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
                valores={formulario.valores}
                erros={errosVisiveis}
                onChange={(campo, valor) => formulario.definirCampo(campo, valor)}
                onExit={(campo) => formulario.marcarTocado(campo)}
                disabled={salvando}
                rotuloNome="Nome do responsável"
              />
            </Card>
          )}

          {edicao && aba === 'alunos' && (
            <DataTable<ResponsavelAluno>
              descricao="Alunos vinculados a este responsável"
              columns={[
                {
                  key: 'aluno',
                  cabecalho: 'Aluno',
                  render: (vinculo) => vinculo.aluno?.pessoa?.nome ?? '—',
                },
                {
                  key: 'parentesco',
                  cabecalho: 'Parentesco',
                  render: (vinculo) =>
                    vinculo.parentesco ? ROTULO_PARENTESCO[vinculo.parentesco] : '—',
                },
                {
                  key: 'termos',
                  cabecalho: 'Aceite de termos',
                  render: (vinculo) =>
                    vinculo.aceitouTermos ? (
                      <Tag variant="success">Aceito em {formatarData(vinculo.dataAceite)}</Tag>
                    ) : (
                      <Tag variant="warning">Pendente</Tag>
                    ),
                },
              ]}
              data={requisicaoVinculos.data ?? []}
              rowKey={(vinculo) => vinculo.id}
              loading={requisicaoVinculos.loading}
              error={requisicaoVinculos.error}
              onReload={requisicaoVinculos.reload}
              empty={{
                titulo: 'Nenhum aluno vinculado',
                descricao: 'O vínculo é criado na tela de cadastro do aluno.',
              }}
              actions={(vinculo) => (
                <IconButton
                  label={`Ver ${vinculo.aluno?.pessoa?.nome ?? 'aluno'}`}
                  icon={<Eye />}
                  onClick={() => navegar(`/adm/alunos/${vinculo.aluno?.id}`)}
                />
              )}
            />
          )}
        </>
      )}
    </Layout>
  )
}
