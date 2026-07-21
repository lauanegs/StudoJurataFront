import { useNavigate, useLocation } from 'react-router-dom'
import * as S from './styles'
import type { SidebarProps } from './types'

import {
  Folder,
  ChevronRight
} from 'lucide-react'

export function Sidebar({ usuario, cargo, menus }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  function isActive(path: string) {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  return (
    <S.Container>
      <S.TopSection>
        <S.Profile>
          <S.UserName>{usuario}</S.UserName>
          <S.UserRole>{cargo}</S.UserRole>
        </S.Profile>

        <S.Menu>
          {menus.map((item) => (
            <S.MenuItem
              key={item.path}
              active={isActive(item.path)}
              onClick={() => navigate(item.path)}
            >
              <S.MenuLeft>
                <Folder size={18} />
                <span>{item.label}</span>
              </S.MenuLeft>

              <ChevronRight size={18} />
            </S.MenuItem>
          ))}
        </S.Menu>
      </S.TopSection>

      <S.Footer>
        <S.FooterLogo src="/images/logo.png" />

        <S.FooterText>
          <span>Studo Jurata</span>
          <small>Portal Escolar</small>
        </S.FooterText>
      </S.Footer>
    </S.Container>
  )
}
