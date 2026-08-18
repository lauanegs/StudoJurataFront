import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Save, Trash2 } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Header } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { Toggle } from '../../../components/ui/Toggle'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useEscola } from '../../../hooks/useEscola'
import { useHidratar } from '../../../hooks/useHidratar'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { disciplinas as servicoDisciplinas } from '../../../services/endpoints'

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

export default function DisciplinaFormulario() {
  const { id } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()
  const { escola, loading: carregandoEscola } = useEscola()

  const edicao = Boolean(id)
  const disciplinaId = id ? Number(id) : null

  const [titulo, setTitulo] = useState('')
  const [ativa, setAtiva] = useState(true)
  const [erros, setErros] = useState<{ titulo?: string }>({})

  const requisicao = useRequisicao(
    () => servicoDisciplinas.buscar(disciplinaId as number),
    [disciplinaId],
    { ativo: Boolean(disciplinaId) },
  )

  useHidratar(requisicao.data, (disciplina) => {
    setTitulo(disciplina.titulo ?? '')
    setAtiva(disciplina.status !== 'INATIVO')
  })

  function validar() {
    const encontrados: typeof erros = {}

    if (!titulo.trim()) encontrados.titulo = 'Informe o nome da disciplina'

    setErros(encontrados)
    return Object.keys(encontrados).length === 0
  }

  const { executar: salvar, executando: salvando } = useAcao(async () => {
    if (!validar()) return

    if (!escola) {
      toast.error('Escola não encontrada', 'Cadastre uma escola antes de criar disciplinas.')
      return
    }

    try {
      const corpo = {
        escola,
        titulo: titulo.trim(),
        status: ativa ? ('ATIVO' as const) : ('INATIVO' as const),
      }

      if (edicao) {
        await servicoDisciplinas.atualizar(disciplinaId as number, corpo)
      } else {
        await servicoDisciplinas.criar(corpo)
      }

      toast.success(edicao ? 'Disciplina atualizada' : 'Disciplina cadastrada', titulo.trim())
      navegar('/adm/disciplinas')
    } catch (erroSalvar) {
      toast.error(
        'Não foi possível salvar',
        erroSalvar instanceof ApiError ? erroSalvar.message : undefined,
      )
    }
  })

  const { executar: excluir, executando: excluindo } = useAcao(async () => {
    if (!disciplinaId) return

    await confirmar({
      titulo: 'Excluir disciplina?',
      descricao: 'Notas e simulados já lançados continuam existindo.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoDisciplinas.excluir(disciplinaId)
          toast.success('Disciplina excluída')
          navegar('/adm/disciplinas')
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
        <Header titulo="Disciplina" voltarPara="/adm/disciplinas" />
        <ErroCarregamento mensagem={requisicao.error} onRetry={requisicao.reload} />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo={edicao ? 'Editar disciplina' : 'Nova disciplina'}
        voltarPara="/adm/disciplinas"
        rotuloVoltar="Voltar para disciplinas"
        actions={
          <>
            {edicao && (
              <Button
                variant="danger"
                icon={<Trash2 />}
                loading={excluindo}
                onClick={excluir}
                disabled={salvando}
              >
                Excluir
              </Button>
            )}
            <Button
              variant="danger"
              onClick={() => navegar('/adm/disciplinas')}
              disabled={salvando || excluindo}
            >
              Cancelar
            </Button>
            <Button
              variant="success"
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
        <Card titulo="Dados da disciplina">
          <Coluna>
            <Input
              label="Nome da disciplina"
              required
              placeholder="Ex.: Robótica"
              value={titulo}
              error={erros.titulo}
              disabled={salvando}
              maxLength={120}
              onChange={(evento) => setTitulo(evento.target.value)}
            />

            <Toggle
              ligado={ativa}
              onChange={setAtiva}
              label="Situação"
              textoLigado="Ativa"
              textoDesligado="Inativa"
              disabled={salvando}
            />
          </Coluna>
        </Card>
      )}
    </Layout>
  )
}
