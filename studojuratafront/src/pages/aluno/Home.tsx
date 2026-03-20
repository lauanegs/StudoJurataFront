import { Layout } from '../../components/layout/Layout'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card/Card'
import { SeparadorCard } from '../../components/ui/SeparadorCard/SeparadorCard'

export default function AlunoHome() {

    return (
        <Layout>
            <Banner/>
            <SeparadorCard>
                <Card>
                    grafico
                </Card>
            </SeparadorCard>
            <SeparadorCard>
                <Card>
                    Realizar simulado 
                    <Button/>
                </Card>
            </SeparadorCard>
        </Layout>
    )
}