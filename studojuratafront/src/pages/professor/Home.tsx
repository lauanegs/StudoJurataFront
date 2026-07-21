import { Layout } from '../../components/layout/Layout'
import { AniversarianteCard } from '../../components/ui/AniversarianteCard'
import { Banner } from '../../components/ui/Banner'
import { SeparadorCard } from '../../components/ui/SeparadorCard/SeparadorCard'
import { Card } from '../../components/ui/Card/Card'

const EVENTOS = [
    { titulo: 'Aula demonstrativa', data: '16/03/2025 11:00am', descricao: 'Aula demonstrativa para Miguel Gomes, pai Eduardo (34) 99999-9999' },
    { titulo: 'Aula demonstrativa', data: '16/03/2025 11:00am', descricao: 'Aula demonstrativa para Miguel Gomes, pai Eduardo (34) 99999-9999' },
    { titulo: 'Aula demonstrativa', data: '16/03/2025 11:00am', descricao: 'Aula demonstrativa para Miguel Gomes, pai Eduardo (34) 99999-9999' },
]

export default function Home() {

    return (
        <Layout perfil="professor">
            <Banner/>
            <SeparadorCard title="Aniversariantes da semana">
                <AniversarianteCard nome={'Cristiano Gonzaga'} data={'26/03/2026'}></AniversarianteCard>
                <AniversarianteCard nome={'Cristiano Gonzaga'} data={'26/03/2026'}></AniversarianteCard>
                <AniversarianteCard nome={'Cristiano Gonzaga'} data={'26/03/2026'}></AniversarianteCard>
            </SeparadorCard>

            <Card>
                <strong style={{ display: 'block', marginBottom: '16px' }}>Eventos</strong>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {EVENTOS.map((evento, index) => (
                        <div key={index} style={{
                            minWidth: '220px', padding: '16px', background: '#fff',
                            border: '1px solid #f1f5f9', borderRadius: '12px',
                        }}>
                            <strong style={{ display: 'block', marginBottom: '6px' }}>{evento.titulo}</strong>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>{evento.data}</span>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>{evento.descricao}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </Layout>
    )
}
