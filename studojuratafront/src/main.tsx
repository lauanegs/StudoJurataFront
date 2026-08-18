import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { MantineProvider } from '@mantine/core'
import { DatesProvider } from '@mantine/dates'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'

import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'

import { AuthProvider } from './contexts/AuthContext'
import { ConfirmProvider } from './contexts/ConfirmContext'
import { PeriodoLetivoProvider } from './contexts/PeriodoLetivoContext'
import { ToastProvider } from './contexts/ToastContext'
import { AppRoutes } from './routes'
import { GlobalStyle } from './styles/global'
import { mantineTheme } from './styles/mantineTheme'
import { theme } from './styles/theme'

dayjs.locale('pt-br')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={mantineTheme}>
      <DatesProvider settings={{ locale: 'pt-br', firstDayOfWeek: 0 }}>
        <ThemeProvider theme={theme}>
          <GlobalStyle />

          <BrowserRouter>
            <ToastProvider>
              <ConfirmProvider>
                <AuthProvider>
                  <PeriodoLetivoProvider>
                    <AppRoutes />
                  </PeriodoLetivoProvider>
                </AuthProvider>
              </ConfirmProvider>
            </ToastProvider>
          </BrowserRouter>
        </ThemeProvider>
      </DatesProvider>
    </MantineProvider>
  </StrictMode>,
)
