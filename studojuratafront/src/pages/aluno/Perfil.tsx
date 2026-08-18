import { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Award, Shirt } from 'lucide-react'

import { Layout } from '../../components/layout'
import { Banner } from '../../components/ui/Banner'
import { Card } from '../../components/ui/Card'
import { ConquistaCard } from '../../components/ui/ConquistaCard'
import { Header } from '../../components/ui/Header'
import { SaldoMoedas } from '../../components/ui/SaldoMoedas'
import { SkinCard, type SkinState } from '../../components/ui/SkinCard'
import { ErroCarregamento } from '../../components/feedback/ErroCarregamento'
import { EstadoVazio } from '../../components/feedback/EstadoVazio'
import { Skeleton } from '../../components/feedback/Skeleton'
import { useToast } from '../../contexts/toastContexto'
import { useAuth } from '../../hooks/useAuth'
import { useAlunoLogado } from '../../hooks/usePerfilLogado'
import { useRequisicao } from '../../hooks/useRequisicao'
import { ApiError } from '../../services/api'
import { gamificacao, simuladoAlunos } from '../../services/endpoints'
import { resolverImagemSkin } from '../../utils/skins'

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

  return (
    <Layout>
      <Banner
        titulo={usuario?.nomePessoa ?? 'Meu perfil'}
        subtitulo={skinEquipada?.nome ?? 'Continue evoluindo e desbloqueando conquistas!'}
        mascoteSrc={resolverImagemSkin(skinEquipada?.urlAsset)}
        extra={pontuacao && <SaldoMoedas moedas={pontuacao.moedas} />}
      />

      <Card titulo="Conquistas" icon={<Award />} corpoComFundo>
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

      <Card titulo="Skins" icon={<Shirt />} corpoComFundo>
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
