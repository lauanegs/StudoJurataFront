import { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Award, Coins, Shirt } from 'lucide-react'

import { Layout } from '../../components/layout'
import { Card } from '../../components/ui/Card'
import { ConquistaCard } from '../../components/ui/ConquistaCard'
import { Header } from '../../components/ui/Header'
import { SkinCard, type SkinState } from '../../components/ui/SkinCard'
import { XPBar } from '../../components/ui/XPBar'
import { calcularNivel } from '../../components/ui/XPBar/calcularNivel'
import { ErroCarregamento } from '../../components/feedback/ErroCarregamento'
import { EstadoVazio } from '../../components/feedback/EstadoVazio'
import { Skeleton } from '../../components/feedback/Skeleton'
import { useToast } from '../../contexts/toastContexto'
import { useAuth } from '../../hooks/useAuth'
import { useAlunoLogado } from '../../hooks/usePerfilLogado'
import { useRequisicao } from '../../hooks/useRequisicao'
import { ApiError } from '../../services/api'
import { gamificacao, simuladoAlunos } from '../../services/endpoints'
import { formatarMoedas } from '../../utils/format'
import { resolverImagemSkin } from '../../utils/skins'

const Cabecalho = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;

  width: 100%;
  padding: ${({ theme }) => theme.spacing.xl};

  background: ${({ theme }) => theme.gradients.banner};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.card};
  color: ${({ theme }) => theme.colors.white};
`

const Identidade = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  min-width: 0;
`

const Personagem = styled.img`
  width: 110px;
  height: 110px;
  object-fit: contain;
`

const Nome = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

const Progresso = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 220px;
`

const Saldo = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};

  background: rgba(255, 255, 255, 0.2);
  border-radius: ${({ theme }) => theme.radius.pill};

  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

interface Conquista {
  id: string
  titulo: string
  descricao: string
  conquistada: boolean
  progresso?: string
}

/**
 * Perfil gamificado do aluno.
 *
 * Moedas, XP e skins vêm de /gamificacao. As conquistas não existem como
 * entidade no back — são derivadas aqui do histórico de tentativas, e o
 * critério de cada uma está explícito no código.
 */
export default function Perfil() {
  const toast = useToast()
  const { usuario } = useAuth()
  const { alunoId, loading: carregandoAluno, error: erroAluno } = useAlunoLogado()

  const [processando, setProcessando] = useState<number | null>(null)

  const requisicaoPontuacao = useRequisicao(
    () => gamificacao.pontuacao(alunoId as number),
    [alunoId],
    { ativo: Boolean(alunoId) },
  )
  const requisicaoSkins = useRequisicao(() => gamificacao.skinsDisponiveis(), [])
  const requisicaoMinhasSkins = useRequisicao(
    () => gamificacao.skinsDoAluno(alunoId as number),
    [alunoId],
    { ativo: Boolean(alunoId) },
  )
  const requisicaoTentativas = useRequisicao(
    () => simuladoAlunos.listarPorAluno(alunoId as number),
    [alunoId],
    { ativo: Boolean(alunoId) },
  )

  const minhasSkins = useMemo(() => requisicaoMinhasSkins.data ?? [], [requisicaoMinhasSkins.data])

  const skinEquipada = useMemo(
    () => minhasSkins.find((item) => item.ativa)?.skin ?? null,
    [minhasSkins],
  )

  const skins = useMemo(() => {
    const possuidas = new Map(minhasSkins.map((item) => [item.skin?.id, item]))

    return (requisicaoSkins.data ?? []).map((skin) => {
      const possuida = possuidas.get(skin.id)

      const state: SkinState = !possuida ? 'locked' : possuida.ativa ? 'equipped' : 'owned'

      return { skin, state }
    })
  }, [requisicaoSkins.data, minhasSkins])

  const conquistas = useMemo<Conquista[]>(() => {
    const concluidas = (requisicaoTentativas.data ?? []).filter(
      (tentativa) => tentativa.status === 'CONCLUIDO',
    )

    const notasMaximas = concluidas.filter(
      (tentativa) => typeof tentativa.nota === 'number' && tentativa.nota > 0,
    )

    return [
      {
        id: 'primeiro',
        titulo: 'Primeiro passo',
        descricao: 'Conclua seu primeiro simulado',
        conquistada: concluidas.length >= 1,
        progresso: `${Math.min(concluidas.length, 1)} de 1`,
      },
      {
        id: 'dedicado',
        titulo: 'Dedicado',
        descricao: 'Conclua 5 simulados',
        conquistada: concluidas.length >= 5,
        progresso: `${Math.min(concluidas.length, 5)} de 5`,
      },
      {
        id: 'maratonista',
        titulo: 'Maratonista',
        descricao: 'Conclua 10 simulados',
        conquistada: concluidas.length >= 10,
        progresso: `${Math.min(concluidas.length, 10)} de 10`,
      },
      {
        id: 'estudante',
        titulo: 'Estudante máximo',
        descricao: 'Some pontos em 3 simulados diferentes',
        conquistada: notasMaximas.length >= 3,
        progresso: `${Math.min(notasMaximas.length, 3)} de 3`,
      },
    ]
  }, [requisicaoTentativas.data])

  async function comprar(skinId: number, custo: number) {
    if ((requisicaoPontuacao.data?.moedas ?? 0) < custo) {
      toast.warning('Moedas insuficientes', 'Conclua mais simulados para ganhar moedas.')
      return
    }

    setProcessando(skinId)

    try {
      await gamificacao.comprar(alunoId as number, skinId)
      toast.success('Skin comprada!', 'Agora é só equipar.')
      await Promise.all([requisicaoPontuacao.reload(), requisicaoMinhasSkins.reload()])
    } catch (erroComprar) {
      toast.error(
        'Não foi possível comprar',
        erroComprar instanceof ApiError ? erroComprar.message : undefined,
      )
    } finally {
      setProcessando(null)
    }
  }

  async function equipar(skinId: number) {
    setProcessando(skinId)

    try {
      await gamificacao.equipar(alunoId as number, skinId)
      toast.success('Skin equipada!')
      await requisicaoMinhasSkins.reload()
    } catch (erroEquipar) {
      toast.error(
        'Não foi possível equipar',
        erroEquipar instanceof ApiError ? erroEquipar.message : undefined,
      )
    } finally {
      setProcessando(null)
    }
  }

  if (erroAluno) {
    return (
      <Layout>
        <Header titulo="Meu perfil" />
        <ErroCarregamento titulo="Cadastro do aluno não encontrado" mensagem={erroAluno} />
      </Layout>
    )
  }

  const pontuacao = requisicaoPontuacao.data
  const nivel = pontuacao ? calcularNivel(pontuacao.xpTotal).nivel : null

  return (
    <Layout>
      <Cabecalho>
        <Identidade>
          <Personagem
            src={resolverImagemSkin(skinEquipada?.urlAsset)}
            alt={skinEquipada?.nome ?? 'Personagem padrão'}
          />

          <div>
            <Nome>{usuario?.nomePessoa ?? 'Meu perfil'}</Nome>
            <span style={{ opacity: 0.9 }}>
              {nivel ? `Nível ${nivel}` : 'Carregando progresso...'}
              {skinEquipada ? ` · ${skinEquipada.nome}` : ''}
            </span>
          </div>
        </Identidade>

        {pontuacao && (
          <Progresso>
            <Saldo>
              <Coins size={20} aria-hidden="true" />
              {formatarMoedas(pontuacao.moedas)} moedas
            </Saldo>
            <XPBar xpTotal={pontuacao.xpTotal} />
          </Progresso>
        )}
      </Cabecalho>

      <Card
        titulo="Conquistas"
        icon={<Award />}
        actions={
          <span style={{ fontSize: '12px', color: '#737373' }}>
            {conquistas.filter((item) => item.conquistada).length} de {conquistas.length} desbloqueadas
          </span>
        }
      >
        {requisicaoTentativas.loading || carregandoAluno ? (
          <Skeleton $altura="140px" $raio="8px" />
        ) : (
          <Grade>
            {conquistas.map((conquista) => (
              <ConquistaCard
                key={conquista.id}
                titulo={conquista.titulo}
                descricao={conquista.descricao}
                conquistada={conquista.conquistada}
                progresso={conquista.conquistada ? undefined : conquista.progresso}
              />
            ))}
          </Grade>
        )}
      </Card>

      <Card titulo="Skins" icon={<Shirt />}>
        {requisicaoSkins.loading ? (
          <Skeleton $altura="180px" $raio="8px" />
        ) : requisicaoSkins.error ? (
          <ErroCarregamento
            mensagem={requisicaoSkins.error}
            onRetry={requisicaoSkins.reload}
          />
        ) : skins.length === 0 ? (
          <EstadoVazio
            titulo="Nenhuma skin disponível"
            descricao="A escola ainda não cadastrou skins na loja."
            icon={<Shirt />}
          />
        ) : (
          <Grade>
            {skins.map(({ skin, state }) => (
              <SkinCard
                key={skin.id}
                nome={skin.nome}
                imagem={resolverImagemSkin(skin.urlAsset)}
                custoMoedas={skin.custoMoedas}
                state={state}
                moedasDisponiveis={pontuacao?.moedas ?? 0}
                processando={processando === skin.id}
                onBuy={() => comprar(skin.id, skin.custoMoedas)}
                onEquip={() => equipar(skin.id)}
              />
            ))}
          </Grade>
        )}
      </Card>
    </Layout>
  )
}
