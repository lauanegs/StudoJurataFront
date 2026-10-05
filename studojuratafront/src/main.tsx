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
import '@mantine/charts/styles.css'

import { AuthProvider } from '@/contexts/auth/AuthProvider'
import { ConfirmProvider } from '@/contexts/confirm/ConfirmProvider'
import { ToastProvider } from '@/contexts/toast/ToastProvider'
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
                  <AppRoutes />
                </AuthProvider>
              </ConfirmProvider>
            </ToastProvider>
          </BrowserRouter>
        </ThemeProvider>
      </DatesProvider>
    </MantineProvider>
  </StrictMode>,
)
