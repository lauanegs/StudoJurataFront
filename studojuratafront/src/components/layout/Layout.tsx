import { GlobalStyle } from '../../styles/global'
import { Sidebar } from '../Sidebar'
import * as S from './styles'
import type { LayoutProps } from './types'


export function Layout({ children }: LayoutProps) {
  return (
    <>
      <GlobalStyle />

      <S.Container>
        <Sidebar
          usuario="Lauane Gonzaga"
          cargo="Administrador"
        />

        <S.Content>
          {children}
        </S.Content>
      </S.Container>
    </>
  )
}