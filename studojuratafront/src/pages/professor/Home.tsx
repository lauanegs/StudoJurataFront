import { Layout } from '../../components/layout/Layout'
import { AniversarianteCard } from '../../components/ui/AniversarianteCard'
import { Banner } from '../../components/ui/Banner'
import { SeparadorCard } from '../../components/ui/SeparadorCard/SeparadorCard'

export default function Home() {

    return (
        <Layout>
            <Banner/>
            <SeparadorCard>
                <AniversarianteCard nome={'Cristiano Gonzaga'} data={'26/03/2026'}></AniversarianteCard>
                <AniversarianteCard nome={'Cristiano Gonzaga'} data={'26/03/2026'}></AniversarianteCard>
                <AniversarianteCard nome={'Cristiano Gonzaga'} data={'26/03/2026'}></AniversarianteCard>
            </SeparadorCard>
        </Layout>
    )
}