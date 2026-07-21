import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'

import { Input } from '../../../components/ui/Input/Input'
import { Card } from '../../../components/ui/Card/Card'
import { TextArea } from '../../../components/ui/TextArea/TextArea'
import { Button } from '../../../components/ui/Button'
import { useState } from 'react'


export default function NovoConteudoPlanoEnsino() {
    const [ordem, setOrdem] = useState('')
    const [titulo, setTitulo] = useState('')
    const [conteudoDetalhado, setConteudoDetalhado] = useState('')

    return (
        <Layout perfil="professor">
            <Header titulo="Novo conteúdo plano de ensino">
                <Button label='Salvar' />
            </Header>

            <Card>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', marginBottom: '32px' }}>
                    <Input placeholder="Digite a ordem..." value={ordem} onChange={(e) => setOrdem(e.target.value)} />
                    <Input placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <TextArea
                        placeholder="É importante que o conteúdo seja detalhadamente explicado, a fim de que o portal elabore questões bem alinhadas ao conteúdo desenvolvido durante o curso."
                        value={conteudoDetalhado}
                        onChange={(e) => setConteudoDetalhado(e.target.value)}
                        style={{ minHeight: '160px' }}
                    />
                </div>
            </Card>

        </Layout>
    )
}
