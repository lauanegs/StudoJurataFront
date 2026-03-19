import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { DataTable } from '../../../components/ui/DataTable'

import { useState } from 'react'
import { Input } from '../../../components/ui/Input/Input'
import { Button } from '../../../components/ui/Button'

interface TurmaData {
    ordem: string
    titulo: string
    descricao: string
}

export default function PlanoEnsino() {
    const [busca, setBusca] = useState('')

    const colunas = [
        { header: 'Ordem', accessor: 'ordem' as const },
        { header: 'Título', accessor: 'titulo' as const },
        { header: 'Descrição', accessor: 'descricao' as const },
    ]

    const dados: TurmaData[] = [
        {
            ordem: '1',
            titulo: 'Módulo 1',
            descricao: 'Lógica de programação com blocos'
        },
        {
            ordem: '2',
            titulo: 'Módulo 2',
            descricao: 'Introdução ao Scratch'
        },
    ]

    const dadosFiltrados = dados.filter((item) =>
        item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        item.descricao.toLowerCase().includes(busca.toLowerCase())
    )

    return (
        <Layout>
            <Header titulo="Conteúdo do Plano de Ensino">
                <Button label="Adicionar conteúdo" />
                <Input
                    placeholder="Buscar conteúdo..."
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