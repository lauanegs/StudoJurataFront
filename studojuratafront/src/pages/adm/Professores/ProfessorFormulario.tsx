import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, Trash2 } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Header } from '../../../components/ui/Header'
import { Toggle } from '../../../components/ui/Toggle'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useHidratar } from '../../../hooks/useHidratar'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
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

  const [pessoa, setPessoa] = useState<DadosPessoa>(PESSOA_VAZIA)
  const [ativo, setAtivo] = useState(true)
  const [tocados, setTocados] = useState<Partial<Record<keyof DadosPessoa, boolean>>>({})
  const [tentouSalvar, setTentouSalvar] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const requisicao = useRequisicao(
    () => servicoProfessores.buscar(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )

  useHidratar(requisicao.data, (professor) => {
    setPessoa(dePessoa(professor.pessoa))
    setAtivo(professor.status !== 'INATIVO')
  })

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
    } finally {
      setSalvando(false)
    }
  }

  async function excluir() {
    if (!professorId) return

    const confirmado = await confirmar({
      titulo: 'Excluir professor?',
      descricao: 'As turmas em que ele leciona precisarão de um novo responsável.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
    })

    if (!confirmado) return

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
  }

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
        rotuloVoltar="Voltar para professores"
        actions={
          <>
            {edicao && (
              <Button variant="danger" icon={<Trash2 />} onClick={excluir} disabled={salvando}>
                Excluir
              </Button>
            )}
            <Button variant="danger" onClick={() => navegar('/adm/professores')} disabled={salvando}>
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
        <Card titulo="Dados do professor">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <PessoaCampos
              valores={pessoa}
              erros={errosVisiveis}
              onChange={(campo, valor) => setPessoa((atual) => ({ ...atual, [campo]: valor }))}
              onExit={(campo) => setTocados((atual) => ({ ...atual, [campo]: true }))}
              disabled={salvando}
              rotuloNome="Nome do professor"
            />

            <Toggle
              ligado={ativo}
              onChange={setAtivo}
              label="Situação"
              textoLigado="Ativo"
              textoDesligado="Inativo"
              descricao="Professores inativos não podem ser vinculados a novas turmas."
              disabled={salvando}
            />
          </div>
        </Card>
      )}
    </Layout>
  )
}
