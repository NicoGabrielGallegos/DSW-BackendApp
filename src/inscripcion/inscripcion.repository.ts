import { Repository } from "../shared/repository.js";
import { Inscripcion } from "./inscripcion.entity.js";
import { db } from "../shared/db/connection.js";
import { ObjectId } from "mongodb";

const inscripciones = db.collection<Inscripcion>("inscripciones")

export class InscripcionRepository implements Repository<Inscripcion> {
    
    public async findAll(): Promise<Inscripcion[] | undefined> {
        return await inscripciones.find().toArray()
    }

    public async findOne(filter: {id: string}): Promise<Inscripcion | undefined> {
        const _id = new ObjectId(filter.id)
        return await inscripciones.findOne({ _id }) || undefined
    }

    public async add(item: Inscripcion): Promise<Inscripcion | undefined> {
        item._id = (await inscripciones.insertOne(item)).insertedId
        return item   
    }

    public async update(filter: {id: string}, item: Inscripcion): Promise<Inscripcion | undefined> {
        const _id = new ObjectId(filter.id)
        return (
            await inscripciones.findOneAndUpdate({_id},
            { $set: item },
            { returnDocument: "after" })
        ) || undefined
    }

    public async delete(filter: {id: string}): Promise<Inscripcion | undefined> {
        const _id = new ObjectId(filter.id)
        return await inscripciones.findOneAndDelete({_id}) || undefined
    }
}