import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, Trash2 } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { Tag } from '../../../components/ui/Tag'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useHidratar } from '../../../hooks/useHidratar'
import { useRequisicao } from '../../../hooks/useRequisicao'
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

  const [pessoa, setPessoa] = useState<DadosPessoa>(PESSOA_VAZIA)
  const [tocados, setTocados] = useState<Partial<Record<keyof DadosPessoa, boolean>>>({})
  const [tentouSalvar, setTentouSalvar] = useState(false)
  const [salvando, setSalvando] = useState(false)

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

  useHidratar(requisicao.data, (responsavel) => setPessoa(dePessoa(responsavel.pessoa)))

  const erros = useMemo(() => validarPessoa(pessoa), [pessoa])

  const errosVisiveis = useMemo(() => {
    const visiveis: Partial<Record<keyof DadosPessoa, string>> = {}

    ;(Object.keys(erros) as (keyof DadosPessoa)[]).forEach((campo) => {
      if (tocados[campo] || tentouSalvar) visiveis[campo] = erros[campo]
    })

    return visiveis
  }, [erros, tocados, tentouSalvar])

  async function salvar() {
    setTentouSalvar(true)

    if (Object.keys(erros).length > 0) {
      toast.warning('Revise os campos', 'Há informações obrigatórias pendentes.')
      return
    }

    setSalvando(true)

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
    } finally {
      setSalvando(false)
    }
  }

  async function excluir() {
    if (!responsavelId) return

    const confirmado = await confirmar({
      titulo: 'Excluir responsável?',
      descricao: 'Os vínculos com os alunos serão removidos.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
    })

    if (!confirmado) return

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
  }

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
        rotuloVoltar="Voltar para responsáveis"
        actions={
          <>
            {edicao && (
              <Button variant="danger" icon={<Trash2 />} onClick={excluir} disabled={salvando}>
                Excluir
              </Button>
            )}
            <Button
              variant="danger"
              onClick={() => navegar('/adm/responsaveis')}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button variant="success" icon={<Save />} loading={salvando} onClick={salvar}>
              Salvar
            </Button>
          </>
        }
      />

      {edicao && requisicao.loading ? (
        <SkeletonCartao />
      ) : (
        <Card titulo="Dados do responsável">
          <PessoaCampos
            valores={pessoa}
            erros={errosVisiveis}
            onChange={(campo, valor) => setPessoa((atual) => ({ ...atual, [campo]: valor }))}
            onExit={(campo) => setTocados((atual) => ({ ...atual, [campo]: true }))}
            disabled={salvando}
            rotuloNome="Nome do responsável"
          />
        </Card>
      )}

      {edicao && (
        <Card titulo="Alunos vinculados" semPadding>
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
            onRowClick={(vinculo) => navegar(`/adm/alunos/${vinculo.aluno?.id}`)}
            empty={{
              titulo: 'Nenhum aluno vinculado',
              descricao: 'O vínculo é criado na tela de cadastro do aluno.',
            }}
          />
        </Card>
      )}
    </Layout>
  )
}
