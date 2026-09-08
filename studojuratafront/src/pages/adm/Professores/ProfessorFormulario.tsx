import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, Trash2 } from 'lucide-react'

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
import { useFormulario } from '../../../hooks/useFormulario'
import { useHidratar } from '../../../hooks/useHidratar'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { OPCOES_ATIVO_INATIVO } from '../../../utils/labels'
import type { StatusAtivoInativo } from '../../../types'
import {
  pessoas as servicoPessoas,
  professores as servicoProfessores,
} from '../../../services/endpoints'
import { PessoaCampos } from '../_compartilhado/PessoaCampos'
import { PESSOA_VAZIA, type DadosPessoa } from '../_compartilhado/dadosPessoa'
import { dePessoa, paraPayloadPessoa, validarPessoa } from '../_compartilhado/validarPessoa'

export default function ProfessorFormulario() {
  const { id } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const edicao = Boolean(id)
  const professorId = id ? Number(id) : null

  const [aba, setAba] = useState<'dados' | 'endereco'>('dados')

  const formulario = useFormulario<DadosPessoa>({
    valoresIniciais: PESSOA_VAZIA,
    validarTudo: validarPessoa,
  })
  const [ativo, setAtivo] = useState(true)

  const requisicao = useRequisicao(
    () => servicoProfessores.buscar(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )

  useHidratar(requisicao.data, (professor) => {
    formulario.reiniciar(dePessoa(professor.pessoa))
    setAtivo(professor.status !== 'INATIVO')
  })

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

        const corpo = { pessoa: pessoaSalva, status: ativo ? ('ATIVO' as const) : ('INATIVO' as const) }

        if (edicao) {
          await servicoProfessores.atualizar(professorId as number, corpo)
        } else {
          await servicoProfessores.criar(corpo)
        }

        toast.success(edicao ? 'Professor atualizado' : 'Professor cadastrado', pessoaSalva.nome)
        navegar('/adm/professores')
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
    if (!professorId) return

    await confirmar({
      titulo: 'Excluir professor?',
      descricao: 'As turmas em que ele leciona precisarão de um novo responsável.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoProfessores.excluir(professorId)
          toast.success('Professor excluído')
          navegar('/adm/professores')
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
              valores={formulario.valores}
              erros={errosVisiveis}
              onChange={(campo, valor) => formulario.definirCampo(campo, valor)}
              onExit={(campo) => formulario.marcarTocado(campo)}
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
