import * as S from './styles'
import type { SidebarProps } from './types'

import {
  Folder,
  ChevronRight
} from 'lucide-react'

export function Sidebar({ usuario, cargo }: SidebarProps) {
  const menus = [
    'Home',
    'Turmas',
    'Alunos',
    'Reforço',
    'Notas',
    'Planos de Ensino',
    'Planos de Aula'
  ]

  return (
    <S.Container>
      <S.TopSection>
        <S.Profile>
          <S.UserName>{usuario}</S.UserName>
          <S.UserRole>{cargo}</S.UserRole>
        </S.Profile>

        <S.Menu>
          {menus.map((item, index) => (
            <S.MenuItem key={index} active={index === 0}>
              <S.MenuLeft>
                <Folder size={18} />
                <span>{item}</span>
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