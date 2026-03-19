import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { DataTable } from '../../../components/ui/DataTable'

import { Flag, FileText } from 'lucide-react'
import { useState } from 'react'
import { Input } from '../../../components/ui/Input/Input'
import { Button } from '../../../components/ui/Button'

interface TurmaDetalhadaData {
    aluno: string
    idade: number
    dataMatricula: string
}

export default function TurmaDetalhada() {
    const [busca, setBusca] = useState('')

    const colunas = [
        { header: 'Aluno', accessor: 'aluno' as const },
        { header: 'Idade', accessor: 'idade' as const },
        { header: 'Data da matrícula', accessor: 'dataMatricula' as const },
    ]

    const dados: TurmaDetalhadaData[] = [
        {
            aluno: 'Cristian Gonzaga Campos',
            idade: 4,
            dataMatricula: '20/02/2026',
        },
        {
            aluno: 'Cristian Gonzaga Campos',
            idade: 4,
            dataMatricula: '20/02/2026',
        },
        {
            aluno: 'Cristian Gonzaga Campos',
            idade: 4,
            dataMatricula: '20/02/2026',
        },
        {
            aluno: 'Cristian Gonzaga Campos',
            idade: 4,
            dataMatricula: '20/02/2026',
        },
        {
            aluno: 'Cristian Gonzaga Campos',
            idade: 4,
            dataMatricula: '20/02/2026',
        },
    ]

    const dadosFiltrados = dados.filter((item) =>
        item.aluno.toLowerCase().includes(busca.toLowerCase())
    )

    return (
        <Layout>
            <Header titulo="Turma Detalhada">
                <Input
                    placeholder="Buscar aluno..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
                <Button
                    label='Registrar aula'
                />
            </Header>

            <DataTable
                columns={colunas}
                data={dadosFiltrados}
                renderActions={() => (
                    <div style={{ display: 'flex', gap: '12px', cursor: 'pointer' }}>
                        <Flag size={18} color="#64748b" />
                        <FileText size={18} color="#64748b" />
                    </div>
                )}
            />
        </Layout>
    )
}