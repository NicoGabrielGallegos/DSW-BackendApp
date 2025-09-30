import { Repository } from "../shared/repository.js";
import { Alumno } from "./alumno.entity.js";

const alumnos: Alumno[] = [
    new Alumno("bcff2a7b-b199-4f3b-9a92-fcbd1d250ee1", "Nicolás", "Gallegos", "ngabriel@gmail.com"),
    new Alumno("ab93d5c7-dfa6-41f4-b3f9-72156df20ff8", "Victoria", "Bay", "victoriabayutn@gmail.com"),
]

export class AlumnoRepository implements Repository<Alumno> {
    
    public findAll(): Alumno[] | undefined {
        return alumnos
    }

    public findOne(item: {id: string}): Alumno | undefined {
        return alumnos.find((alu) => alu.legajo === item.id)
    }

    public add(item: Alumno): Alumno | undefined {
        alumnos.push(item)
        return item   
    }

    public update(item: Alumno): Alumno | undefined {
        const aluIdx = alumnos.findIndex((alu => alu.legajo === item.legajo))
        
        if (aluIdx === -1) {
            return undefined
        }

        alumnos[aluIdx] = {...alumnos[aluIdx], ...item}
        // Alt // Object.assign(alumnos[aluIdx], item)
        return alumnos[aluIdx]
    }

    public delete(item: {id: string}): Alumno | undefined {
        const aluIdx = alumnos.findIndex((alu => alu.legajo === item.id))

        if (aluIdx === -1) {
            return undefined
        }

        const deletedAlu = alumnos.splice(aluIdx, 1)
        return deletedAlu[0]
    }
}