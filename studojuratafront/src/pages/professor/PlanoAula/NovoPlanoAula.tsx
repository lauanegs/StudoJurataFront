import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'

import { Input } from '../../../components/ui/Input/Input'
import { Card } from '../../../components/ui/Card/Card'
import { Button } from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Select/Select'


export default function NovoPlanoEnsino() {

    return (
        <Layout>
            <Header titulo="Novo plano de aula">
                <Button label='Salvar'/>
            </Header>

                <Card>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', marginBottom: '32px' }}>
                        <Select options={[]}/>
                        <Select options={[]}/>
                        <Input placeholder="Carga horária" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', marginBottom: '32px' }}>
                        <Select options={[]}/>
                        <Select options={[]}/>
                        <Select options={[]}/>
                    </div>
                </Card>

        </Layout>
    )
}