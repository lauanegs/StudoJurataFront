import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Archive, ArchiveRestore, Save } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Header } from '../../../components/ui/Header'
import { Select } from '../../../components/ui/Select'
import { Tab } from '../../../components/ui/Tab'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useHidratar } from '../../../hooks/useHidratar'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { OPCOES_ATIVO_INATIVO } from '../../../utils/labels'
import type { StatusAtivoInativo } from '../../../types/comum'
import { pessoas as servicoPessoas, professores as servicoProfessores } from '../../../services/pessoas'
import { PessoaCampos } from '../../../components/pessoas/PessoaCampos'
import { abaDoCampoPessoa, dePessoa, paraPayloadPessoa, useFormularioPessoa } from '../../../formularios/pessoas'

export default function ProfessorFormulario() {
  const { id } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const edicao = Boolean(id)
  const professorId = id ? Number(id) : null

  const [aba, setAba] = useState<'dados' | 'endereco'>('dados')

  const form = useFormularioPessoa()
  const [ativo, setAtivo] = useState(true)

  const requisicao = useRequisicao(
    () => servicoProfessores.buscar(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )

  useHidratar(requisicao.data, (professor) => {
    form.setValues(dePessoa(professor.pessoa))
    form.resetDirty()
    setAtivo(professor.status !== 'INATIVO')
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

      const corpo = { pessoa: pessoaSalva, status: ativo ? ('ATIVO' as const) : ('INATIVO' as const) }

      if (edicao) {
        await servicoProfessores.atualizar(professorId as number, corpo)
        toast.success('Professor atualizado', pessoaSalva.nome)
        // Permanece na tela: só recarrega o que o back gravou.
        await requisicao.reload()
      } else {
        const criado = await servicoProfessores.criar(corpo)
        toast.success('Professor cadastrado', pessoaSalva.nome)
        // Continua no formulário, agora em modo de edição.
        navegar(`/adm/professores/${criado.id}`, { replace: true })
      }
    } catch (erroSalvar) {
      toast.error(
        'Não foi possível salvar',
        erroSalvar instanceof ApiError ? erroSalvar.message : undefined,
      )
    }
  })

  const { executar: excluir, executando: excluindo } = useAcao(async () => {
    if (!professorId) return

    await confirmar({
      titulo: 'Inativar professor?',
      descricao: 'As turmas em que ele leciona precisarão de um novo responsável.',
      rotuloConfirmar: 'Inativar',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoProfessores.excluir(professorId)
          toast.success('Professor inativado')
          navegar('/adm/professores')
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
    if (!professorId) return

    await confirmar({
      titulo: 'Ativar professor?',
      descricao: 'O professor voltará a ficar ativo.',
      rotuloConfirmar: 'Ativar',
      aoConfirmar: async () => {
        try {
          await servicoProfessores.ativar(professorId)
          toast.success('Professor ativado')
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
        <Header titulo="Professor" voltarPara="/adm/professores" />
        <ErroCarregamento mensagem={requisicao.error} onRetry={requisicao.reload} />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo={edicao ? 'Editar professor' : 'Novo professor'}
        voltarPara="/adm/professores"
        rotuloVoltar="Professores"
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
                onClick={() => navegar('/adm/professores')}
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

      <Tab<'dados' | 'endereco'>
        rotuloAcessivel="Seções do professor"
        value={aba}
        onChange={setAba}
        options={[
          { value: 'dados', label: 'Dados do professor' },
          { value: 'endereco', label: 'Endereço' },
        ]}
      />

      {edicao && requisicao.loading ? (
        <SkeletonCartao />
      ) : (
        <Card titulo={aba === 'dados' ? 'Dados do professor' : 'Endereço'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <PessoaCampos
              secao={aba}
              form={form}
              disabled={salvando}
              rotuloNome="Nome do professor"
            />

            {aba === 'dados' && (
              <Select<StatusAtivoInativo>
                label="Situação"
                options={OPCOES_ATIVO_INATIVO}
                value={ativo ? 'ATIVO' : 'INATIVO'}
                hint="Professores inativos não podem ser vinculados a novas turmas."
                disabled={salvando}
                onChange={(valor) => setAtivo(valor !== 'INATIVO')}
              />
            )}
          </div>
        </Card>
      )}
    </Layout>
  )
}
