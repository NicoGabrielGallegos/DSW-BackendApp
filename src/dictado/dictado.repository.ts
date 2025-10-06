import { Repository } from "../shared/repository.js";
import { Dictado } from "./dictado.entity.js";
import { db } from "../shared/db/connection.js";
import { ObjectId } from "mongodb";

const dictados = db.collection<Dictado>("dictados")

export class DictadoRepository implements Repository<Dictado> {
    
    public async findAll(): Promise<Dictado[] | undefined> {
        return await dictados.find().toArray()
    }

    public async findOne(filter: {id: string}): Promise<Dictado | undefined> {
        const _id = new ObjectId(filter.id)
        return await dictados.findOne({ _id }) || undefined
    }

    public async add(item: Dictado): Promise<Dictado | undefined> {
        item._id = (await dictados.insertOne(item)).insertedId
        return item   
    }

    public async update(filter: {id: string}, item: Dictado): Promise<Dictado | undefined> {
        const _id = new ObjectId(filter.id)
        return (
            await dictados.findOneAndUpdate({_id},
            { $set: item },
            { returnDocument: "after" })
        ) || undefined
    }

    public async delete(filter: {id: string}): Promise<Dictado | undefined> {
        const _id = new ObjectId(filter.id)
        return await dictados.findOneAndDelete({_id}) || undefined
    }

    public async deleteByDocente(filter: {docente: ObjectId}): Promise<void> {
        // TODO
    }

    public async deleteByMateria(filter: {materia: ObjectId}): Promise<void> {
        // TODO
    }
}