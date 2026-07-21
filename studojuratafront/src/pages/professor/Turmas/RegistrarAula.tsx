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
    const [tabAtiva, setTabAtiva] = useState('chamada')
    const [data, setData] = useState('')
    const [disciplina, setDisciplina] = useState<string | number>('')
    const [titulo, setTitulo] = useState('')
    const [observacoes, setObservacoes] = useState('')

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

    return (
        <Layout perfil="professor">
            <Header titulo="Geek Júnior">
                <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
                <Select options={[{ value: '1', label: 'Robótica' }]} value={disciplina} onChange={setDisciplina} placeholder="Disciplina" />
                <Button label='Salvar'/>
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
                    data={dados}
                    renderActions={() => (
                        <CheckBox />
                    )}
                />
            )}

            {tabAtiva === 'conteudo' && (
                <Card>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Input placeholder="Título da aula" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                        <Button label="Vincular conteúdo do plano de ensino" />
                        <TextArea
                            placeholder="Observações..."
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                        />
                    </div>
                </Card>
            )}
        </Layout>
    )
}
