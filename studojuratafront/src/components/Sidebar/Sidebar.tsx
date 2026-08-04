import { useLocation, useNavigate } from 'react-router-dom'
import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { Avatar } from '../ui/Avatar'
import * as S from './styles'
import type { ItemMenu, SidebarProps } from './types'

/**
 * Navegação lateral persistente (doc §3.1).
 *
 * O item ativo é calculado pelo caminho atual: a rota exata ou qualquer rota
 * filha (`/adm/turmas/nova` mantém "Turmas" ativo).
 */
export function Sidebar({
  usuario,
  cargo,
  itens,
  colapsada,
  onToggleCollapse,
  onExit,
  abertaNoMobile = false,
  onCloseOnMobile,
}: SidebarProps) {
  const navegar = useNavigate()
  const localizacao = useLocation()

  function estaAtivo(item: ItemMenu) {
    const caminhoAtual = localizacao.pathname.replace(/\/$/, '')
    const caminhoItem = item.caminho.replace(/\/$/, '')

    if (caminhoAtual === caminhoItem) return true

    // A Home de cada perfil ("/adm", "/professor", "/aluno") é raiz de todas
    // as outras rotas, então só casa exatamente.
    const ehRaizDoPerfil = caminhoItem.split('/').filter(Boolean).length === 1
    if (ehRaizDoPerfil) return false

    if (caminhoAtual.startsWith(`${caminhoItem}/`)) return true

    return (item.prefixos ?? []).some((prefixo) => caminhoAtual.startsWith(prefixo))
  }

  function irPara(caminho: string) {
    navegar(caminho)
    onCloseOnMobile?.()
  }

  return (
    <>
      {abertaNoMobile && <S.Overlay onClick={onCloseOnMobile} aria-hidden="true" />}

      <S.Container $colapsada={colapsada} $abertaNoMobile={abertaNoMobile}>
        <S.Topo>
          <S.BotaoColapso
            type="button"
            onClick={onToggleCollapse}
            aria-label={colapsada ? 'Expandir menu' : 'Recolher menu'}
            title={colapsada ? 'Expandir menu' : 'Recolher menu'}
          >
            {colapsada ? <PanelLeftOpen /> : <PanelLeftClose />}
          </S.BotaoColapso>

          <S.BlocoUsuario $colapsada={colapsada}>
            <Avatar nome={usuario} size="medium" />

            {!colapsada && (
              <S.DadosUsuario>
                <S.NomeUsuario title={usuario}>{usuario}</S.NomeUsuario>
                <S.CargoUsuario>{cargo}</S.CargoUsuario>
              </S.DadosUsuario>
            )}
          </S.BlocoUsuario>

          <S.Navegacao aria-label="Navegação principal">
            {itens.map((item) => {
              const ativo = estaAtivo(item)

              return (
                <S.ItemNav
                  key={item.caminho}
                  type="button"
                  $ativo={ativo}
                  $colapsada={colapsada}
                  aria-current={ativo ? 'page' : undefined}
                  title={colapsada ? item.label : undefined}
                  onClick={() => irPara(item.caminho)}
                >
                  {item.icon}
                  {!colapsada && <S.RotuloItem>{item.label}</S.RotuloItem>}
                </S.ItemNav>
              )
            })}
          </S.Navegacao>
        </S.Topo>

        <S.Rodape>
          <S.BotaoSair
            type="button"
            $colapsada={colapsada}
            onClick={onExit}
            title={colapsada ? 'Sair' : undefined}
          >
            <LogOut />
            {!colapsada && 'Sair'}
          </S.BotaoSair>

          <S.Marca $colapsada={colapsada}>
            <S.LogoMarca src="/images/logo.png" alt="Studo Jurata" />

            {!colapsada && (
              <S.TextoMarca>
                <strong>Studo Jurata</strong>
                <small>Portal Escolar</small>
              </S.TextoMarca>
            )}
          </S.Marca>
        </S.Rodape>
      </S.Container>
    </>
  )
}
