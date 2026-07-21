import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'

import { Input } from '../../../components/ui/Input/Input'
import { Card } from '../../../components/ui/Card/Card'
import { Button } from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Select/Select'
import { useState } from 'react'


export default function NovoPlanoAula() {
    const [turma, setTurma] = useState<string | number>('')
    const [curso, setCurso] = useState('')
    const [cargaHoraria, setCargaHoraria] = useState('')
    const [disciplina, setDisciplina] = useState<string | number>('')
    const [planoEnsino, setPlanoEnsino] = useState<string | number>('')
    const [periodoLetivo, setPeriodoLetivo] = useState('')

    return (
        <Layout perfil="professor">
            <Header titulo="Novo plano de aula">
                <Button label='Salvar'/>
            </Header>

                <Card>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', marginBottom: '32px' }}>
                        <Select options={[{ value: '1', label: 'Geek Junior' }]} value={turma} onChange={setTurma} placeholder="Turma" />
                        <Input placeholder="Curso" value={curso} onChange={(e) => setCurso(e.target.value)} />
                        <Input placeholder="Carga horária total" value={cargaHoraria} onChange={(e) => setCargaHoraria(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', marginBottom: '32px' }}>
                        <Select options={[{ value: '1', label: 'Robótica' }]} value={disciplina} onChange={setDisciplina} placeholder="Disciplina" />
                        <Select options={[{ value: '1', label: 'Plano de Ensino 1' }]} value={planoEnsino} onChange={setPlanoEnsino} placeholder="Plano de Ensino" />
                        <Input placeholder="Período letivo" value={periodoLetivo} onChange={(e) => setPeriodoLetivo(e.target.value)} />
                    </div>
                </Card>

        </Layout>
    )
}
