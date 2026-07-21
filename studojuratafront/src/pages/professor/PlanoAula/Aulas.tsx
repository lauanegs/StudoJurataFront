import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { DataTable } from '../../../components/ui/DataTable'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../../../components/ui/Input/Input'
import { Button } from '../../../components/ui/Button'
import { SeparadorCard } from '../../../components/ui/SeparadorCard/SeparadorCard'
import { Card } from '../../../components/ui/Card/Card'
import { BarChart3 } from 'lucide-react'

interface AulaData {
    id: string
    numero: string
    dataAula: string
    horarios: string
    conteudo: string
    titulo: string
    dataPublicacao: string
}

export default function Aulas() {
    const [busca, setBusca] = useState('')
    const navigate = useNavigate()

    const colunas = [
        { header: 'Numero', accessor: 'numero' as const },
        { header: 'Data da aula', accessor: 'dataAula' as const },
        { header: 'Qtd. horários', accessor: 'horarios' as const },
        { header: 'Conteudo', accessor: 'conteudo' as const },
        { header: 'Título', accessor: 'titulo' as const },
        { header: 'Data da publicação', accessor: 'dataPublicacao' as const },
    ]

    const dados: AulaData[] = Array.from({ length: 4 }).map((_, i) => ({
        id: String(i + 1),
        numero: '1',
        dataAula: '01/02/2026',
        horarios: '02',
        conteudo: 'Conteúdo 1; Conteúdo 2',
        titulo: 'Aula 1',
        dataPublicacao: '01/02/2026',
    }))

    const dadosFiltrados = dados.filter((item) =>
        item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        item.numero.toLowerCase().includes(busca.toLowerCase())
    )

    return (
        <Layout perfil="professor">
            <Header titulo="Aulas">
                <Button label="Adicionar aula" onClick={() => navigate('/professor/planoAula/nova-aula')} />
                <Input
                    placeholder="Buscar aula..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
            </Header>

            <SeparadorCard title="Estatísticas" icon={<BarChart3 size={16} />}>
                <Card>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Aulas realizadas</span>
                    <strong style={{ fontSize: '24px' }}>26/56</strong>
                </Card>
                <Card>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Carga horária realizada</span>
                    <strong style={{ fontSize: '24px' }}>246hrs</strong>
                </Card>
            </SeparadorCard>

            <DataTable
                columns={colunas}
                data={dadosFiltrados}
                onRowClick={(row) => navigate(`/professor/planoAula/nova-aula?id=${row.id}`)}
            />
        </Layout>
    )
}
