import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * O front roda em http://localhost:5173 e a API em http://localhost:8080 —
 * origens diferentes. Como o Spring usa cookie de sessão, o navegador exigiria
 * CORS com `allowCredentials` e origem explícita.
 *
 * O proxy abaixo evita esse problema no desenvolvimento: o navegador enxerga
 * tudo como mesma origem (`/api/...`) e o Vite encaminha para o back. Em
 * produção, aponte `VITE_API_BASE_URL` para a URL real da API — aí o CORS
 * precisa estar habilitado no back (ver `config/CorsConfig.java`).
 */
const ALVO_API = process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:8080'

const proxy = {
  '/api': {
    target: ALVO_API,
    changeOrigin: true,
    // O back não usa prefixo /api: /api/alunos -> /alunos
    rewrite: (caminho: string) => caminho.replace(/^\/api/, ''),
  },
}

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy },
  preview: { port: 4173, proxy },
  optimizeDeps: {
    include: ['@mantine/core', '@mantine/hooks', '@mantine/dates', 'dayjs'],
  },
})
