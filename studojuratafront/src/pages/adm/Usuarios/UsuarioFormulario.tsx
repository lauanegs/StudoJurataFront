import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Archive, ArchiveRestore, Save } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Header } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Stack } from '../../../components/ui/Stack'
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
} from '../../../services/pessoas'
import { useFormularioUsuario } from '../../../formularios/pessoas'
import { OPCOES_ATIVO_INATIVO, OPCOES_TIPO_USUARIO } from '../../../utils/labels'
import type { StatusAtivoInativo, TipoUsuario } from '../../../types/comum'

const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`

/**
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

  const form = useFormularioUsuario(edicao)

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
    form.setValues({
      pessoaId: usuario.pessoa?.id ?? null,
      tipoUsuario: usuario.tipoUsuario,
      username: usuario.username ?? '',
      ativo: usuario.status !== 'INATIVO',
    })
    form.resetDirty()
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

  const { executar: salvar, executando: salvando } = useAcao(async () => {
    if ((await form.validate()).hasErrors) return
    const { pessoaId, tipoUsuario, username, senha, ativo } = form.getValues()

    if (!escola) {
      toast.error('Escola não encontrada', 'Cadastre uma escola antes de criar usuários.')
      return
    }

    try {
      const pessoaEscolhida = (requisicaoPessoas.data ?? []).find((p) => p.id === pessoaId)

      // Usuario referencia o Aluno/Professor da pessoa escolhida, quando o tipo exigir.
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
        toast.success('Usuário atualizado', username.trim())
        // Permanece na tela: só recarrega o que o back gravou.
        await requisicao.reload()
      } else {
        const criado = await servicoUsuarios.criar(corpo)
        toast.success('Usuário cadastrado', username.trim())
        // Continua no formulário, agora em modo de edição.
        navegar(`/adm/usuarios/${criado.id}`, { replace: true })
      }
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
      titulo: 'Inativar usuário?',
      descricao: 'O login será inativado; o histórico de ações continua registrado.',
      rotuloConfirmar: 'Inativar',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoUsuarios.excluir(usuarioId)
          toast.success('Usuário inativado')
          navegar('/adm/usuarios')
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
    if (!usuarioId) return

    await confirmar({
      titulo: 'Ativar usuário?',
      descricao: 'O login voltará a ficar ativo.',
      rotuloConfirmar: 'Ativar',
      aoConfirmar: async () => {
        try {
          await servicoUsuarios.ativar(usuarioId)
          toast.success('Usuário ativado')
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
          <Stack gap="md">
            <Grade>
              <Select<number>
                label="Pessoa"
                required
                options={opcoesPessoas}
                value={form.values.pessoaId}
                error={form.errors.pessoaId as string | undefined}
                loading={requisicaoPessoas.loading || requisicaoUsuarios.loading}
                disabled={salvando}
                searchable
                clearable
                placeholder="Selecionar pessoa..."
                hint="Aluno, professor ou responsável já cadastrado, ainda sem login."
                onChange={(valor) => form.setFieldValue('pessoaId', valor)}
              />

              <Select<TipoUsuario>
                label="Tipo de usuário"
                required
                options={OPCOES_TIPO_USUARIO}
                value={form.values.tipoUsuario}
                error={form.errors.tipoUsuario as string | undefined}
                disabled={salvando}
                placeholder="Selecionar tipo..."
                onChange={(valor) => form.setFieldValue('tipoUsuario', valor)}
              />

              <Input
                label="Usuário"
                required
                placeholder="Ex.: joao.silva"
                {...form.getInputProps('username')}
                disabled={salvando}
                maxLength={60}
              />

              <Input
                label="Senha"
                type="password"
                required={!edicao}
                placeholder={edicao ? 'Deixe em branco para manter a atual' : 'Informe a senha'}
                {...form.getInputProps('senha')}
                disabled={salvando}
                hint={edicao ? 'Deixe vazio para não alterar a senha.' : undefined}
              />
            </Grade>

            <Select<StatusAtivoInativo>
              label="Situação"
              options={OPCOES_ATIVO_INATIVO}
              value={form.values.ativo ? 'ATIVO' : 'INATIVO'}
              disabled={salvando}
              onChange={(valor) => form.setFieldValue('ativo', valor !== 'INATIVO')}
            />
          </Stack>
        </Card>
      )}
    </Layout>
  )
}
