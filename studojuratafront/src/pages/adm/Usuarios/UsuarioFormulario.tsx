import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Save, Trash2 } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Header } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useEscola } from '../../../hooks/useEscola'
import { useHidratar } from '../../../hooks/useHidratar'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import {
  alunos as servicoAlunos,
  pessoas as servicoPessoas,
  professores as servicoProfessores,
  usuarios as servicoUsuarios,
} from '../../../services/endpoints'
import { OPCOES_ATIVO_INATIVO, OPCOES_TIPO_USUARIO } from '../../../utils/labels'
import type { StatusAtivoInativo, TipoUsuario } from '../../../types'

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`

/**
 * Cadastro de usuário (login) — item 9.8 do documento de regras.
 *
 * Cria um login vinculado a uma Pessoa já cadastrada (Aluno/Professor/
 * Responsável), não um fluxo de pessoa+login do zero: a Pessoa em si é
 * cadastrada nas telas de Alunos/Professores/Responsáveis.
 */
export default function UsuarioFormulario() {
  const { id } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()
  const { escola, loading: carregandoEscola } = useEscola()

  const edicao = Boolean(id)
  const usuarioId = id ? Number(id) : null

  const [pessoaId, setPessoaId] = useState<number | null>(null)
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario | null>(null)
  const [username, setUsername] = useState('')
  const [senha, setSenha] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [erros, setErros] = useState<Record<string, string | undefined>>({})

  const requisicao = useRequisicao(
    () => servicoUsuarios.buscar(usuarioId as number),
    [usuarioId],
    { ativo: Boolean(usuarioId) },
  )
  const requisicaoPessoas = useRequisicao(() => servicoPessoas.listar(), [])
  const requisicaoUsuarios = useRequisicao(() => servicoUsuarios.listar(), [])
  const requisicaoAlunos = useRequisicao(() => servicoAlunos.listar(), [])
  const requisicaoProfessores = useRequisicao(() => servicoProfessores.listar(), [])

  useHidratar(requisicao.data, (usuario) => {
    setPessoaId(usuario.pessoa?.id ?? null)
    setTipoUsuario(usuario.tipoUsuario)
    setUsername(usuario.username ?? '')
    setAtivo(usuario.status !== 'INATIVO')
  })

  // Só pessoas sem login ainda podem ser escolhidas — exceto a que já está
  // vinculada a este usuário (senão ela desapareceria do Select ao editar).
  const opcoesPessoas = useMemo(() => {
    const pessoasComLogin = new Set(
      (requisicaoUsuarios.data ?? [])
        .filter((usuario) => usuario.id !== usuarioId)
        .map((usuario) => usuario.pessoa?.id)
        .filter((idPessoa): idPessoa is number => Boolean(idPessoa)),
    )

    return (requisicaoPessoas.data ?? [])
      .filter((pessoa) => !pessoasComLogin.has(pessoa.id))
      .map((pessoa) => ({ value: pessoa.id, label: pessoa.nome ?? `Pessoa ${pessoa.id}` }))
  }, [requisicaoPessoas.data, requisicaoUsuarios.data, usuarioId])

  function validar() {
    const encontrados: Record<string, string | undefined> = {}

    if (!pessoaId) encontrados.pessoaId = 'Selecione a pessoa'
    if (!tipoUsuario) encontrados.tipoUsuario = 'Selecione o tipo de usuário'
    if (!username.trim()) encontrados.username = 'Informe o usuário'
    if (!edicao && !senha.trim()) encontrados.senha = 'Informe a senha'

    setErros(encontrados)
    return Object.keys(encontrados).filter((chave) => encontrados[chave]).length === 0
  }

  const { executar: salvar, executando: salvando } = useAcao(async () => {
    if (!validar()) return

    if (!escola) {
      toast.error('Escola não encontrada', 'Cadastre uma escola antes de criar usuários.')
      return
    }

    try {
      const pessoaEscolhida = (requisicaoPessoas.data ?? []).find((p) => p.id === pessoaId)

      // Referência explícita ao perfil de negócio do login (item da entidade
      // Usuario no back): busca o Aluno/Professor cujo pessoa.id bate com a
      // pessoa escolhida, quando o tipo selecionado exigir.
      const alunoVinculado =
        tipoUsuario === 'ALUNO'
          ? (requisicaoAlunos.data ?? []).find((a) => a.pessoa?.id === pessoaId)
          : undefined
      const professorVinculado =
        tipoUsuario === 'PROFESSOR'
          ? (requisicaoProfessores.data ?? []).find((p) => p.pessoa?.id === pessoaId)
          : undefined

      const corpo = {
        escola,
        pessoa: pessoaEscolhida,
        username: username.trim(),
        ...(senha.trim() ? { senha: senha.trim() } : {}),
        tipoUsuario: tipoUsuario as TipoUsuario,
        status: ativo ? ('ATIVO' as const) : ('INATIVO' as const),
        aluno: alunoVinculado ?? null,
        professor: professorVinculado ?? null,
      }

      if (edicao) {
        await servicoUsuarios.atualizar(usuarioId as number, corpo)
      } else {
        await servicoUsuarios.criar(corpo)
      }

      toast.success(edicao ? 'Usuário atualizado' : 'Usuário cadastrado', username.trim())
      navegar('/adm/usuarios')
    } catch (erroSalvar) {
      toast.error(
        'Não foi possível salvar',
        erroSalvar instanceof ApiError ? erroSalvar.message : undefined,
      )
    }
  })

  const { executar: excluir, executando: excluindo } = useAcao(async () => {
    if (!usuarioId) return

    await confirmar({
      titulo: 'Excluir usuário?',
      descricao: 'O login será desativado; o histórico de ações continua registrado.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoUsuarios.excluir(usuarioId)
          toast.success('Usuário excluído')
          navegar('/adm/usuarios')
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
        <Header titulo="Usuário" voltarPara="/adm/usuarios" />
        <ErroCarregamento mensagem={requisicao.error} onRetry={requisicao.reload} />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo={edicao ? 'Editar usuário' : 'Novo usuário'}
        voltarPara="/adm/usuarios"
        rotuloVoltar="Usuários"
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
                onClick={() => navegar('/adm/usuarios')}
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
              disabled={carregandoEscola || excluindo}
              onClick={salvar}
            >
              Salvar
            </Button>
          </>
        }
      />

      {edicao && requisicao.loading ? (
        <SkeletonCartao />
      ) : (
        <Card titulo="Dados do usuário">
          <Coluna>
            <Grade>
              <Select<number>
                label="Pessoa"
                required
                options={opcoesPessoas}
                value={pessoaId}
                error={erros.pessoaId}
                loading={requisicaoPessoas.loading || requisicaoUsuarios.loading}
                disabled={salvando}
                searchable
                clearable
                placeholder="Selecionar pessoa..."
                hint="Aluno, professor ou responsável já cadastrado, ainda sem login."
                onChange={setPessoaId}
              />

              <Select<TipoUsuario>
                label="Tipo de usuário"
                required
                options={OPCOES_TIPO_USUARIO}
                value={tipoUsuario}
                error={erros.tipoUsuario}
                disabled={salvando}
                placeholder="Selecionar tipo..."
                onChange={setTipoUsuario}
              />

              <Input
                label="Usuário"
                required
                placeholder="Ex.: joao.silva"
                value={username}
                error={erros.username}
                disabled={salvando}
                maxLength={60}
                onChange={(evento) => setUsername(evento.target.value)}
              />

              <Input
                label="Senha"
                type="password"
                required={!edicao}
                placeholder={edicao ? 'Deixe em branco para manter a atual' : 'Informe a senha'}
                value={senha}
                error={erros.senha}
                disabled={salvando}
                hint={edicao ? 'Deixe vazio para não alterar a senha.' : undefined}
                onChange={(evento) => setSenha(evento.target.value)}
              />
            </Grade>

            <Select<StatusAtivoInativo>
              label="Situação"
              options={OPCOES_ATIVO_INATIVO}
              value={ativo ? 'ATIVO' : 'INATIVO'}
              disabled={salvando}
              onChange={(valor) => setAtivo(valor !== 'INATIVO')}
            />
          </Coluna>
        </Card>
      )}
    </Layout>
  )
}
