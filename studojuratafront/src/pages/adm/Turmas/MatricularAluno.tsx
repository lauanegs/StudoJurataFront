import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Check, Save, UserPlus, Users, UserX } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { CheckBox } from '../../../components/ui/CheckBox'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Header, SubtituloItem } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Stepper } from '../../../components/ui/Stepper'
import { Tab } from '../../../components/ui/Tab'
import { Tag } from '../../../components/ui/Tag'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useToast } from '../../../contexts/toastContexto'
import { useFormulario } from '../../../hooks/useFormulario'
import { useHidratar } from '../../../hooks/useHidratar'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import {
  alunos as servicoAlunos,
  matriculas,
  pessoas as servicoPessoas,
  responsaveis as servicoResponsaveis,
  turmas as servicoTurmas,
  vinculosResponsavel,
} from '../../../services/endpoints'
import { formatarCpf } from '../../../utils/format'
import { OPCOES_PARENTESCO, TEXTO_VERSAO_LGPD } from '../../../utils/labels'
import { intervaloDeDatas } from '../../../utils/validacao'
import type { Parentesco, StatusMatricula } from '../../../types'
import { PessoaCampos } from '../_compartilhado/PessoaCampos'
import { PESSOA_VAZIA, type DadosPessoa } from '../_compartilhado/dadosPessoa'
import { paraPayloadPessoa, validarPessoa } from '../_compartilhado/validarPessoa'

/* Confirmado pelo usuário: por enquanto só estes três status ficam
 * editáveis aqui — TRANSFERIDA continua existindo no domínio (fluxo próprio
 * de transferência entre turmas), mas não é algo que se escolha à mão nesta
 * tela ainda. */
const OPCOES_STATUS_MATRICULA_EDITAVEL: { value: StatusMatricula; label: string }[] = [
  { value: 'ATIVA', label: 'Ativa' },
  { value: 'CONCLUIDA', label: 'Concluída' },
  { value: 'CANCELADA', label: 'Cancelada' },
]

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

const Aviso = styled.p`
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.warningBackground};
  border-radius: ${({ theme }) => theme.radius.md};

  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.warningText};
`

const TextoTermo = styled.p`
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radius.md};

  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const LinhaRodape = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`

type Passo = 'aluno' | 'responsavel' | 'matricula'

/**
 * Fluxo passo a passo pra matricular um aluno numa turma (confirmado pelo
 * usuário): nada é gravado até o "Concluir matrícula" do último passo — só
 * então Pessoa/Aluno (se novo), Pessoa/Responsável + vínculo (se precisar) e
 * a Matrícula em si são criados em sequência. Isso evita registro órfão se o
 * admin abandonar o fluxo no meio (ex.: fechar a aba no passo 2).
 *
 * Editar uma matrícula existente continua sendo o formulário simples de
 * antes — só a criação de uma matrícula nova ganhou os passos, porque é aí
 * que faz sentido "ajudar a cadastrar o aluno se não tiver, um responsável
 * no mínimo, etc.".
 */
export default function MatricularAluno() {
  const { turmaId, matriculaId } = useParams()
  const navegar = useNavigate()
  const toast = useToast()

  const idTurma = Number(turmaId)
  const edicao = Boolean(matriculaId)
  const idMatricula = matriculaId ? Number(matriculaId) : null

  const [passo, setPasso] = useState<Passo>('aluno')

  // --- Passo 1: aluno -------------------------------------------------------
  const [modoAluno, setModoAluno] = useState<'existente' | 'novo'>('existente')
  const [alunoIdExistente, setAlunoIdExistente] = useState<number | null>(null)
  const formularioAluno = useFormulario<DadosPessoa>({
    valoresIniciais: PESSOA_VAZIA,
    validarTudo: validarPessoa,
  })
  const [matriculaCodigo, setMatriculaCodigo] = useState('')

  // --- Passo 2: responsável ---------------------------------------------------
  const [modoResponsavel, setModoResponsavel] = useState<'existente' | 'novo'>('existente')
  const [responsavelIdExistente, setResponsavelIdExistente] = useState<number | null>(null)
  const [parentesco, setParentesco] = useState<Parentesco | null>(null)
  const [aceitouTermos, setAceitouTermos] = useState(false)
  const formularioResponsavel = useFormulario<DadosPessoa>({
    valoresIniciais: PESSOA_VAZIA,
    validarTudo: validarPessoa,
  })

  // --- Passo 3: matrícula ------------------------------------------------------
  const [dataInicio, setDataInicio] = useState(() => new Date().toISOString().slice(0, 10))
  const [dataFim, setDataFim] = useState('')
  const [status, setStatus] = useState<StatusMatricula>('ATIVA')
  const [erros, setErros] = useState<Record<string, string | undefined>>({})

  const requisicaoTurma = useRequisicao(() => servicoTurmas.buscar(idTurma), [idTurma])
  const requisicaoAlunos = useRequisicao(() => servicoAlunos.listar(), [])
  const requisicaoResponsaveis = useRequisicao(() => servicoResponsaveis.listar(), [])
  const requisicaoAtivos = useRequisicao(() => matriculas.ativosPorTurma(idTurma), [idTurma])
  const requisicaoMatricula = useRequisicao(
    () => matriculas.buscar(idMatricula as number),
    [idMatricula],
    { ativo: Boolean(idMatricula) },
  )

  // Responsáveis já vinculados ao aluno EXISTENTE selecionado — se já tem
  // pelo menos um, o passo "Responsável" fica opcional (só informativo).
  const requisicaoVinculosDoAluno = useRequisicao(
    () => vinculosResponsavel.porAluno(alunoIdExistente as number),
    [alunoIdExistente],
    { ativo: Boolean(alunoIdExistente) && modoAluno === 'existente' },
  )

  useHidratar(requisicaoMatricula.data, (matricula) => {
    setAlunoIdExistente(matricula.aluno?.id ?? null)
    setDataInicio(matricula.dataInicio?.slice(0, 10) ?? '')
    setDataFim(matricula.dataFim?.slice(0, 10) ?? '')
    setStatus(matricula.status ?? 'ATIVA')
  })

  const opcoesAlunos = useMemo(() => {
    const jaMatriculados = new Set(
      (requisicaoAtivos.data ?? [])
        .filter((matricula) => matricula.id !== idMatricula)
        .map((matricula) => matricula.aluno?.id),
    )

    return (requisicaoAlunos.data ?? [])
      .filter((aluno) => !jaMatriculados.has(aluno.id))
      .map((aluno) => ({
        value: aluno.id,
        label: aluno.pessoa?.nome ?? `Aluno ${aluno.id}`,
        descricao: formatarCpf(aluno.pessoa?.cpf),
      }))
  }, [requisicaoAlunos.data, requisicaoAtivos.data, idMatricula])

  const opcoesResponsaveis = useMemo(
    () =>
      (requisicaoResponsaveis.data ?? []).map((responsavel) => ({
        value: responsavel.id,
        label: responsavel.pessoa?.nome ?? `Responsável ${responsavel.id}`,
        descricao: responsavel.pessoa?.cpf,
      })),
    [requisicaoResponsaveis.data],
  )

  const turma = requisicaoTurma.data
  const ativos = requisicaoAtivos.data ?? []
  const lotada = Boolean(turma?.capacidadeMaxima && ativos.length >= turma.capacidadeMaxima)

  const responsaveisDoAlunoExistente = requisicaoVinculosDoAluno.data ?? []
  // Passo "Responsável" é obrigatório pra aluno novo (nunca teve nenhum) ou
  // pra aluno existente que ainda não tem nenhum responsável vinculado.
  const responsavelObrigatorio =
    !edicao && (modoAluno === 'novo' || (modoAluno === 'existente' && responsaveisDoAlunoExistente.length === 0))

  const errosAluno = useMemo(() => {
    const visiveis: Partial<Record<keyof DadosPessoa, string>> = {}
    ;(Object.keys(formularioAluno.erros) as (keyof DadosPessoa)[]).forEach((campo) => {
      const erro = formularioAluno.erroDe(campo)
      if (erro) visiveis[campo] = erro
    })
    return visiveis
  }, [formularioAluno])

  const errosResponsavel = useMemo(() => {
    const visiveis: Partial<Record<keyof DadosPessoa, string>> = {}
    ;(Object.keys(formularioResponsavel.erros) as (keyof DadosPessoa)[]).forEach((campo) => {
      const erro = formularioResponsavel.erroDe(campo)
      if (erro) visiveis[campo] = erro
    })
    return visiveis
  }, [formularioResponsavel])

  // aoEnviar() marca tentouEnviar=true (o que faz erroDe() passar a mostrar
  // os erros de validação já calculados) e só chama o callback quando o
  // formulário está válido — reaproveitado aqui só como "valide e avance",
  // sem de fato enviar nada pro back nesse momento.
  async function avancar() {
    if (passo === 'aluno') {
      if (modoAluno === 'existente') {
        if (!alunoIdExistente) {
          toast.warning('Selecione o aluno')
          return
        }
      } else {
        const valido = await formularioAluno.aoEnviar(async () => {})()
        if (!valido) {
          toast.warning('Revise os campos', 'Há informações obrigatórias pendentes.')
          return
        }
      }

      setPasso('responsavel')
      return
    }

    if (passo === 'responsavel') {
      if (responsavelObrigatorio) {
        if (!parentesco) {
          toast.warning('Selecione o parentesco do responsável')
          return
        }

        if (!aceitouTermos) {
          toast.warning('Confirme o aceite dos termos', 'É preciso registrar o aceite do responsável para continuar.')
          return
        }

        if (modoResponsavel === 'existente') {
          if (!responsavelIdExistente) {
            toast.warning('Selecione o responsável')
            return
          }
        } else {
          const valido = await formularioResponsavel.aoEnviar(async () => {})()
          if (!valido) {
            toast.warning('Revise os campos', 'Há informações obrigatórias pendentes.')
            return
          }
        }
      }

      setPasso('matricula')
    }
  }

  function validarMatricula() {
    const encontrados: Record<string, string | undefined> = {}
    if (!dataInicio) encontrados.dataInicio = 'Informe a data de início'
    const erroPeriodo = intervaloDeDatas(dataInicio, dataFim)
    if (erroPeriodo) encontrados.dataFim = erroPeriodo
    setErros(encontrados)
    return Object.keys(encontrados).filter((chave) => encontrados[chave]).length === 0
  }

  const { executar: salvarEdicao, executando: salvandoEdicao } = useAcao(async () => {
    if (!validarMatricula() || !turma) return
    const aluno = (requisicaoAlunos.data ?? []).find((item) => item.id === alunoIdExistente)
    if (!aluno) return

    try {
      await matriculas.atualizar(idMatricula as number, {
        aluno,
        turma,
        dataInicio,
        dataFim: dataFim || undefined,
        status,
      })
      toast.success('Matrícula atualizada', aluno.pessoa?.nome)
      navegar(`/adm/turmas/${idTurma}`)
    } catch (erroSalvar) {
      toast.error('Não foi possível salvar', erroSalvar instanceof ApiError ? erroSalvar.message : undefined)
    }
  })

  const { executar: concluirMatricula, executando: concluindo } = useAcao(async () => {
    if (!validarMatricula() || !turma) return

    try {
      // 1) Aluno — usa o existente ou cria Pessoa + Aluno.
      let alunoFinal = (requisicaoAlunos.data ?? []).find((item) => item.id === alunoIdExistente)

      if (modoAluno === 'novo') {
        const payloadPessoa = paraPayloadPessoa(formularioAluno.valores)
        const pessoaSalva = await servicoPessoas.criar(payloadPessoa)
        alunoFinal = await servicoAlunos.criar({
          pessoa: pessoaSalva,
          matricula: matriculaCodigo.trim() || undefined,
        })
      }

      if (!alunoFinal) {
        toast.error('Aluno não encontrado')
        return
      }

      // 2) Responsável — só quando o passo era obrigatório.
      if (responsavelObrigatorio) {
        let responsavelFinal = (requisicaoResponsaveis.data ?? []).find(
          (item) => item.id === responsavelIdExistente,
        )

        if (modoResponsavel === 'novo') {
          const payloadPessoa = paraPayloadPessoa(formularioResponsavel.valores)
          const pessoaSalva = await servicoPessoas.criar(payloadPessoa)
          responsavelFinal = await servicoResponsaveis.criar({ pessoa: pessoaSalva })
        }

        if (!responsavelFinal) {
          toast.error('Responsável não encontrado')
          return
        }

        const vinculoCriado = await vinculosResponsavel.criar({
          aluno: alunoFinal,
          responsavel: responsavelFinal,
          parentesco: parentesco as Parentesco,
        })

        if (aceitouTermos) {
          await vinculosResponsavel.aceitarTermos(vinculoCriado.id, TEXTO_VERSAO_LGPD)
        }
      }

      // 3) Matrícula.
      await matriculas.matricular({
        aluno: alunoFinal,
        turma,
        dataInicio,
        dataFim: dataFim || undefined,
        status: 'ATIVA',
      })

      toast.success('Aluno matriculado', `${alunoFinal.pessoa?.nome} entrou em ${turma.titulo}.`)
      navegar(`/adm/turmas/${idTurma}`)
    } catch (erroSalvar) {
      toast.error('Não foi possível matricular', erroSalvar instanceof ApiError ? erroSalvar.message : undefined)
    }
  })

  if (requisicaoTurma.error || (edicao && requisicaoMatricula.error)) {
    return (
      <Layout>
        <Header titulo={edicao ? 'Editar matrícula' : 'Matricular aluno'} voltarPara="/adm/turmas" />
        <ErroCarregamento
          mensagem={requisicaoTurma.error ?? requisicaoMatricula.error ?? 'Erro ao carregar'}
          onRetry={requisicaoTurma.reload}
        />
      </Layout>
    )
  }

  const subtitulo = turma && (
    <>
      <SubtituloItem icon={<Users />}>Turma: {turma.titulo}</SubtituloItem>
      {turma.capacidadeMaxima && (
        <SubtituloItem icon={lotada ? <UserX /> : <Users />}>
          Vagas: {ativos.length} / {turma.capacidadeMaxima}
        </SubtituloItem>
      )}
    </>
  )

  // Editar matrícula existente: formulário simples de sempre, sem os passos
  // (o aluno já existe e já tem cadastro — não há o que "auxiliar" aqui).
  if (edicao) {
    return (
      <Layout>
        <Header
          titulo="Editar matrícula"
          subtitulo={subtitulo}
          voltarPara={`/adm/turmas/${idTurma}`}
          rotuloVoltar="Turma"
          actions={
            <Button variant="success" size="large" icon={<Save />} loading={salvandoEdicao} onClick={salvarEdicao}>
              Salvar
            </Button>
          }
        />

        {requisicaoMatricula.loading ? (
          <SkeletonCartao />
        ) : (
          <Card titulo="Dados da matrícula">
            <Coluna>
              <Select<number>
                label="Aluno"
                required
                options={opcoesAlunos}
                value={alunoIdExistente}
                loading={requisicaoAlunos.loading}
                disabled
                onChange={setAlunoIdExistente}
              />

              <Grade>
                <DatePicker
                  label="Início da matrícula"
                  required
                  value={dataInicio}
                  error={erros.dataInicio}
                  onChange={(evento) => setDataInicio(evento.target.value)}
                />

                <DatePicker
                  label="Término previsto"
                  value={dataFim}
                  error={erros.dataFim}
                  hint="Opcional. Deixe em branco para matrícula em aberto."
                  onChange={(evento) => setDataFim(evento.target.value)}
                />
              </Grade>

              <Select<StatusMatricula>
                label="Situação da matrícula"
                options={OPCOES_STATUS_MATRICULA_EDITAVEL}
                value={status}
                onChange={(valor) => valor && setStatus(valor)}
              />
            </Coluna>
          </Card>
        )}
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo="Matricular aluno"
        subtitulo={subtitulo}
        voltarPara={`/adm/turmas/${idTurma}`}
        rotuloVoltar="Turma"
      />

      <Stepper<Passo>
        rotuloAcessivel="Passos da matrícula"
        value={passo}
        onChange={setPasso}
        options={[
          { value: 'aluno', label: 'Aluno', description: 'Quem vai ser matriculado' },
          { value: 'responsavel', label: 'Responsável', description: 'Vínculo e termo' },
          { value: 'matricula', label: 'Matrícula', description: 'Turma e datas' },
        ]}
      />

      {passo === 'aluno' && (
        <>
          <Tab<'existente' | 'novo'>
            rotuloAcessivel="Aluno já cadastrado ou novo"
            value={modoAluno}
            onChange={setModoAluno}
            options={[
              { value: 'existente', label: 'Aluno já cadastrado' },
              { value: 'novo', label: 'Cadastrar novo aluno' },
            ]}
          />

          <Card titulo="Quem vai ser matriculado?">
            <Coluna>
              {lotada && (
                <Aviso role="status">
                  A turma atingiu a capacidade máxima informada. A matrícula ainda é possível, mas
                  confirme com a coordenação antes de prosseguir.
                </Aviso>
              )}

              {modoAluno === 'existente' ? (
                <Select<number>
                  label="Aluno"
                  required
                  options={opcoesAlunos}
                  value={alunoIdExistente}
                  loading={requisicaoAlunos.loading}
                  searchable
                  placeholder="Selecionar aluno..."
                  emptyText="Nenhum aluno disponível — cadastre um novo"
                  onChange={setAlunoIdExistente}
                />
              ) : (
                <>
                  <PessoaCampos
                    valores={formularioAluno.valores}
                    erros={errosAluno}
                    onChange={(campo, value) => formularioAluno.definirCampo(campo, value)}
                    onExit={(campo) => formularioAluno.marcarTocado(campo)}
                    rotuloNome="Nome do aluno"
                  />

                  <Input
                    label="Matrícula"
                    placeholder="Código interno da escola (opcional)"
                    value={matriculaCodigo}
                    maxLength={30}
                    hint="Deixe em branco para a secretaria preencher depois."
                    onChange={(evento) => setMatriculaCodigo(evento.target.value)}
                  />
                </>
              )}
            </Coluna>
          </Card>

          <LinhaRodape>
            <span />
            <Button icon={<UserPlus />} onClick={avancar}>
              Próximo: Responsável
            </Button>
          </LinhaRodape>
        </>
      )}

      {passo === 'responsavel' && (
        <>
          {responsavelObrigatorio && (
            <Tab<'existente' | 'novo'>
              rotuloAcessivel="Responsável já cadastrado ou novo"
              value={modoResponsavel}
              onChange={setModoResponsavel}
              options={[
                { value: 'existente', label: 'Responsável já cadastrado' },
                { value: 'novo', label: 'Cadastrar novo responsável' },
              ]}
            />
          )}

          <Card titulo="Responsável pelo aluno">
            <Coluna>
              {!responsavelObrigatorio ? (
                <>
                  <Aviso role="status">
                    Este aluno já tem {responsaveisDoAlunoExistente.length} responsável(is) vinculado(s) —
                    este passo é opcional aqui. Vincule ou troque responsáveis depois, na ficha do aluno.
                  </Aviso>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {responsaveisDoAlunoExistente.map((vinculo) => (
                      <Tag key={vinculo.id} variant="neutral">
                        {vinculo.responsavel?.pessoa?.nome} ({vinculo.parentesco})
                      </Tag>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {modoResponsavel === 'existente' ? (
                    <Select<number>
                      label="Responsável"
                      required
                      options={opcoesResponsaveis}
                      value={responsavelIdExistente}
                      loading={requisicaoResponsaveis.loading}
                      searchable
                      placeholder="Selecionar responsável..."
                      emptyText="Cadastre um novo responsável"
                      onChange={setResponsavelIdExistente}
                    />
                  ) : (
                    <PessoaCampos
                      valores={formularioResponsavel.valores}
                      erros={errosResponsavel}
                      onChange={(campo, value) => formularioResponsavel.definirCampo(campo, value)}
                      onExit={(campo) => formularioResponsavel.marcarTocado(campo)}
                      rotuloNome="Nome do responsável"
                    />
                  )}

                  <Select<Parentesco>
                    label="Parentesco"
                    required
                    options={OPCOES_PARENTESCO.map((opcao) => ({ value: opcao.value, label: opcao.label }))}
                    value={parentesco}
                    placeholder="Selecione..."
                    onChange={setParentesco}
                  />

                  <TextoTermo>{TEXTO_VERSAO_LGPD}</TextoTermo>

                  <CheckBox
                    label="Confirmo que o responsável leu e aceitou os termos acima"
                    checked={aceitouTermos}
                    onChange={(evento) => setAceitouTermos(evento.target.checked)}
                  />
                </>
              )}
            </Coluna>
          </Card>

          <LinhaRodape>
            <Button variant="secondary" onClick={() => setPasso('aluno')}>
              Voltar
            </Button>
            <Button icon={<Check />} onClick={avancar}>
              Próximo: Matrícula
            </Button>
          </LinhaRodape>
        </>
      )}

      {passo === 'matricula' && (
        <>
          <Card titulo="Dados da matrícula">
            <Coluna>
              <Grade>
                <DatePicker
                  label="Início da matrícula"
                  required
                  value={dataInicio}
                  error={erros.dataInicio}
                  disabled={concluindo}
                  onChange={(evento) => setDataInicio(evento.target.value)}
                />

                <DatePicker
                  label="Término previsto"
                  value={dataFim}
                  error={erros.dataFim}
                  disabled={concluindo}
                  hint="Opcional. Deixe em branco para matrícula em aberto."
                  onChange={(evento) => setDataFim(evento.target.value)}
                />
              </Grade>
            </Coluna>
          </Card>

          <LinhaRodape>
            <Button variant="secondary" onClick={() => setPasso('responsavel')} disabled={concluindo}>
              Voltar
            </Button>
            <Button variant="success" icon={<Save />} loading={concluindo} onClick={concluirMatricula}>
              Concluir matrícula
            </Button>
          </LinhaRodape>
        </>
      )}
    </Layout>
  )
}
