import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { DataTable } from '../../../components/ui/DataTable'

import { useState } from 'react'
import { CheckBox } from '../../../components/ui/CheckBox/CheckBox'
import { Tab } from '../../../components/ui/Tab/Tab'
import { Input } from '../../../components/ui/Input/Input'
import { Card } from '../../../components/ui/Card/Card'
import { TextArea } from '../../../components/ui/TextArea/TextArea'
import { Button } from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Select/Select'

interface AlunoData {
    aluno: string
    cargaHoraria: number
}

export default function RegistrarAula() {
    const [busca, setBusca] = useState('')
    const [tabAtiva, setTabAtiva] = useState('chamada')

    const colunas = [
        { header: 'Ações', accessor: 'actions' as const, width: '120px' },
        { header: 'Aluno', accessor: 'aluno' as const },
        { header: 'Carga horária', accessor: 'cargaHoraria' as const },
    ]

    const dados: AlunoData[] = [
        { aluno: 'Cristian Gonzaga Campos', cargaHoraria: 4 },
        { aluno: 'Ana Souza', cargaHoraria: 3 },
        { aluno: 'Pedro Lima', cargaHoraria: 5 },
    ]

    const dadosFiltrados = dados.filter((item) =>
        item.aluno.toLowerCase().includes(busca.toLowerCase())
    )

    return (
        <Layout>
            <Header titulo="Registrar aula">
                <Button label='Salvar'/>
                <Select options={[]}/>
                <Select options={[]}/>
            </Header>

            <Tab
                options={[
                    { label: 'Realizar chamada', value: 'chamada' },
                    { label: 'Registrar conteúdo', value: 'conteudo' },
                ]}
                value={tabAtiva}
                onChange={setTabAtiva}
            />

            {tabAtiva === 'chamada' && (
                <DataTable
                    columns={colunas}
                    data={dadosFiltrados}
                    renderActions={(row) => (
                        <CheckBox />
                    )}
                />
            )}

            {tabAtiva === 'conteudo' && (
                <Card>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Input placeholder="Título da aula" />
                        <TextArea placeholder="Descreva o conteúdo ministrado..." />
                    </div>
                </Card>
            )}
        </Layout>
    )
}