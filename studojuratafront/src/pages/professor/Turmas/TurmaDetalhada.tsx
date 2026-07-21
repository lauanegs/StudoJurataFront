import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { DataTable } from '../../../components/ui/DataTable'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../../../components/ui/Input/Input'
import { Button } from '../../../components/ui/Button'

interface TurmaDetalhadaData {
    aluno: string
    idade: number
    dataMatricula: string
}

export default function TurmaDetalhada() {
    const [busca, setBusca] = useState('')
    const navigate = useNavigate()

    const colunas = [
        { header: 'Aluno', accessor: 'aluno' as const },
        { header: 'Idade', accessor: 'idade' as const },
        { header: 'Data da matrícula', accessor: 'dataMatricula' as const },
    ]

    const dados: TurmaDetalhadaData[] = Array.from({ length: 5 }).map(() => ({
        aluno: 'Cristian Gonzaga Campos',
        idade: 4,
        dataMatricula: '20/02/2026',
    }))

    const dadosFiltrados = dados.filter((item) =>
        item.aluno.toLowerCase().includes(busca.toLowerCase())
    )

    return (
        <Layout perfil="professor">
            <Header titulo="Geek Júnior">
                <Button
                    label='Registrar aula'
                    onClick={() => navigate('/professor/turmas/registrar-aula')}
                />
                <Input
                    placeholder="Buscar aluno..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
            </Header>

            <DataTable
                columns={colunas}
                data={dadosFiltrados}
            />
        </Layout>
    )
}
