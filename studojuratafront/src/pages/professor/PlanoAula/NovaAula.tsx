import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'

import { Input } from '../../../components/ui/Input/Input'
import { Card } from '../../../components/ui/Card/Card'
import { TextArea } from '../../../components/ui/TextArea/TextArea'
import { Button } from '../../../components/ui/Button'


export default function NovaAula() {

    return (
        <Layout>
            <Header titulo="Nova aula">
                <Button label='Salvar' />
            </Header>

            <Card>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                    <Input placeholder="Carga horária" />
                    <Input placeholder="Carga horária" />
                    <Input placeholder="Carga horária" />
                    <Input placeholder="Carga horária" />
                    <TextArea placeholder="Descreva o conteúdo ministrado..." />
                </div>
            </Card>

        </Layout>
    )
}