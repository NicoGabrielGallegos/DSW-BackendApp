import { Repository } from "../shared/repository.js";
import { Alumno } from "./alumno.entity.js";
import { db } from "../shared/db/connection.js";
import { ObjectId } from "mongodb";

const alumnos = db.collection<Alumno>("alumnos")

export class AlumnoRepository implements Repository<Alumno> {
    
    public async findAll(): Promise<Alumno[] | undefined> {
        return await alumnos.find().toArray()
    }

    public async findOne(filter: {id: string}): Promise<Alumno | undefined> {
        const _id = new ObjectId(filter.id)
        return await alumnos.findOne({ _id }) || undefined
    }

    public async add(item: Alumno): Promise<Alumno | undefined> {
        item._id = (await alumnos.insertOne(item)).insertedId
        return item   
    }

    public async update(filter: {id: string}, item: Alumno): Promise<Alumno | undefined> {
        const _id = new ObjectId(filter.id)
        return (
            await alumnos.findOneAndUpdate({_id},
            { $set: item },
            { returnDocument: "after" })
        ) || undefined
    }

    public async delete(filter: {id: string}): Promise<Alumno | undefined> {
        const _id = new ObjectId(filter.id)
        return await alumnos.findOneAndDelete({_id}) || undefined
    }
}