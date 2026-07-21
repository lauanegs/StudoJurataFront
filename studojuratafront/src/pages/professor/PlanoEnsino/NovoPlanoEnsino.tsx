import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'

import { Input } from '../../../components/ui/Input/Input'
import { Card } from '../../../components/ui/Card/Card'
import { TextArea } from '../../../components/ui/TextArea/TextArea'
import { Button } from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Select/Select'
import { useState } from 'react'


export default function NovoPlanoEnsino() {
    const [turma, setTurma] = useState<string | number>('')
    const [curso, setCurso] = useState('')
    const [cargaHoraria, setCargaHoraria] = useState('')
    const [disciplina, setDisciplina] = useState<string | number>('')
    const [periodoLetivo, setPeriodoLetivo] = useState<string | number>('')
    const [ementa, setEmenta] = useState('')
    const [objetivoGeral, setObjetivoGeral] = useState('')

    return (
        <Layout perfil="professor">
            <Header titulo="Novo plano de ensino">
                <Button label='Salvar'/>
            </Header>

                <Card>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', marginBottom: '32px' }}>
                        <Select options={[{ value: '1', label: 'Geek Junior' }]} value={turma} onChange={setTurma} placeholder="Turma" />
                        <Input placeholder="Curso" value={curso} onChange={(e) => setCurso(e.target.value)} />
                        <Input placeholder="Carga horária" value={cargaHoraria} onChange={(e) => setCargaHoraria(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', marginBottom: '32px' }}>
                        <Select options={[{ value: '1', label: 'Robótica' }]} value={disciplina} onChange={setDisciplina} placeholder="Disciplina" />
                        <Input placeholder="Período letivo" value={periodoLetivo} onChange={(e) => setPeriodoLetivo(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <TextArea placeholder="Ementa..." value={ementa} onChange={(e) => setEmenta(e.target.value)} />
                        <TextArea placeholder="Objetivo geral..." value={objetivoGeral} onChange={(e) => setObjetivoGeral(e.target.value)} />
                    </div>
                </Card>

        </Layout>
    )
}
