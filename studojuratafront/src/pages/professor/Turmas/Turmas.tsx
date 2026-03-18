import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { DataTable } from '../../../components/ui/DataTable'

import { Flag, FileText } from 'lucide-react'
import { useState } from 'react'

interface TurmaData {
    turma: string
    alunos: number
}

export default function Turmas() {
    const [busca, setBusca] = useState('')

    const colunas = [
        { header: 'Turma', accessor: 'turma' as const },
        { header: 'Alunos', accessor: 'alunos' as const },
        { header: 'Ações', accessor: 'actions' as const, width: '120px' }
    ]

    const dados: TurmaData[] = [
        { turma: 'Geek Junior - quarta - 8:00', alunos: 4 },
        { turma: 'Geek Junior - quarta - 8:00', alunos: 4 },
        { turma: 'Geek Junior - quarta - 8:00', alunos: 4 },
        { turma: 'Geek Junior - quarta - 8:00', alunos: 4 },
        { turma: 'Geek Junior - quarta - 8:00', alunos: 4 },
        { turma: 'Geek Junior - quarta - 8:00', alunos: 4 },
    ]

    const dadosFiltrados = dados.filter((item) =>
        item.turma.toLowerCase().includes(busca.toLowerCase())
    )

    return (
        <Layout>
            <Header titulo="Turmas" />

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