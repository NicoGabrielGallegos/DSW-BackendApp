import { Repository } from "../shared/repository.js";
import { Alumno } from "./alumno.entity.js";

const alumnos: Alumno[] = [
    new Alumno("51367", "Nicolás", "Gallegos", "ngabriel@gmail.com", "bcff2a7b-b199-4f3b-9a92-fcbd1d250ee1"),
    new Alumno("50306", "Victoria", "Bay", "victoriabayutn@gmail.com", "ab93d5c7-dfa6-41f4-b3f9-72156df20ff8"),
]

export class AlumnoRepository implements Repository<Alumno> {
    
    public async findAll(): Promise<Alumno[] | undefined> {
        return await alumnos
    }

    public async findOne(item: {id: string}): Promise<Alumno | undefined> {
        return await alumnos.find((alu) => alu.id === item.id)
    }

    public async add(item: Alumno): Promise<Alumno | undefined> {
        await alumnos.push(item)
        return item   
    }

    public async update(item: Alumno): Promise<Alumno | undefined> {
        const aluIdx = await alumnos.findIndex((alu => alu.id === item.id))
        
        if (aluIdx === -1) {
            return undefined
        }

        alumnos[aluIdx] = {...alumnos[aluIdx], ...item}
        // Alt // Object.assign(alumnos[aluIdx], item)
        return alumnos[aluIdx]
    }

    public async delete(item: {id: string}): Promise<Alumno | undefined> {
        const aluIdx = await alumnos.findIndex((alu => alu.id === item.id))

        if (aluIdx === -1) {
            return undefined
        }

        const deletedAlu = alumnos.splice(aluIdx, 1)
        return deletedAlu[0]
    }
}