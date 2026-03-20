import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { DataTable } from '../../../components/ui/DataTable'

import { useState } from 'react'
import { Input } from '../../../components/ui/Input/Input'
import { Button } from '../../../components/ui/Button'
import { SeparadorCard } from '../../../components/ui/SeparadorCard/SeparadorCard'
import { Card } from '../../../components/ui/Card/Card'

interface TurmaData {
    numero: string
    dataAula: string
    horarios: string
    conteudo: string
    titulo: string
    dataPublicacao: string
}

export default function Aulas() {
    const [busca, setBusca] = useState('')

    const colunas = [
        { header: 'Numero', accessor: 'numero' as const },
        { header: 'Data da aula', accessor: 'dataAula' as const },
        { header: 'Qtd. horários', accessor: 'horarios' as const },
        { header: 'Conteudo', accessor: 'conteudo' as const },
        { header: 'Título', accessor: 'titulo' as const },
        { header: 'Data da publicação', accessor: 'dataPublicacao' as const },
    ]

    const dados: TurmaData[] = [
        {
            numero: '1',
            dataAula: 'Módulo 1',
            horarios: 'Lógica de programação com blocos',
            conteudo: 'blabvla',
            titulo: 'blabla',
            dataPublicacao: 'blabla'

        },
        {
            numero: '1',
            dataAula: 'Módulo 1',
            horarios: 'Lógica de programação com blocos',
            conteudo: 'blabvla',
            titulo: 'blabla',
            dataPublicacao: 'blabla'

        },
        {
            numero: '1',
            dataAula: 'Módulo 1',
            horarios: 'Lógica de programação com blocos',
            conteudo: 'blabvla',
            titulo: 'blabla',
            dataPublicacao: 'blabla'

        },
    ]

    const dadosFiltrados = dados.filter((item) =>
        item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        item.numero.toLowerCase().includes(busca.toLowerCase())
    )

    return (
        <Layout>
            <Header titulo="Aulas">
                <Button label="Adicionar aula" />
                <Input
                    placeholder="Buscar aula..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
            </Header>

            <SeparadorCard>
                <Card>
                    Titulo
                </Card>
                <Card>
                    Titulo
                </Card>
            </SeparadorCard>

            <DataTable
                columns={colunas}
                data={dadosFiltrados}
            />
        </Layout>
    )
}