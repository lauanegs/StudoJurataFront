import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { DataTable } from '../../../components/ui/DataTable'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../../../components/ui/Input/Input'
import { Button } from '../../../components/ui/Button'

interface TurmaData {
    id: string
    ordem: string
    titulo: string
    descricao: string
}

export default function ConteudoPlanoEnsino() {
    const [busca, setBusca] = useState('')
    const navigate = useNavigate()

    const colunas = [
        { header: 'Ordem', accessor: 'ordem' as const },
        { header: 'Título', accessor: 'titulo' as const },
        { header: 'Descrição', accessor: 'descricao' as const },
    ]

    const dados: TurmaData[] = [
        { id: '1', ordem: '1', titulo: 'Unidade 1', descricao: 'Introdução à lógica de programação com Kodu' },
        { id: '2', ordem: '2', titulo: 'Unidade 2', descricao: 'Programação em blocos com Scratch' },
        { id: '3', ordem: '3', titulo: 'Unidade 3', descricao: 'Criação do primeiro jogo de plataforma com Construct 3' },
        { id: '4', ordem: '4', titulo: 'Unidade 4', descricao: 'Introdução à programação com códigos na plataforma Godot' },
    ]

    const dadosFiltrados = dados.filter((item) =>
        item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        item.descricao.toLowerCase().includes(busca.toLowerCase())
    )

    return (
        <Layout perfil="professor">
            <Header titulo="Conteúdo do Plano de Ensino">
                <Button label="Adicionar conteúdo" onClick={() => navigate('/professor/planoEnsino/novo-conteudo-plano-ensino')} />
                <Input
                    placeholder="Buscar conteúdo..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
            </Header>

            <DataTable
                columns={colunas}
                data={dadosFiltrados}
                onRowClick={(row) => navigate(`/professor/planoEnsino/novo-conteudo-plano-ensino?id=${row.id}`)}
            />
        </Layout>
    )
}
