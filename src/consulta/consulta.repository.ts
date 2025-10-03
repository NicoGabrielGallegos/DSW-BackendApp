import { Repository } from "../shared/repository.js";
import { Consulta } from "./consulta.entity.js";
import { db } from "../shared/db/connection.js";
import { ObjectId } from "mongodb";

const consultas = db.collection<Consulta>("consultas")

export class ConsultaRepository implements Repository<Consulta> {
    
    public async findAll(): Promise<Consulta[] | undefined> {
        return await consultas.find().toArray()
    }

    public async findOne(filter: {id: string}): Promise<Consulta | undefined> {
        const _id = new ObjectId(filter.id)
        return await consultas.findOne({ _id }) || undefined
    }

    public async add(item: Consulta): Promise<Consulta | undefined> {
        item._id = (await consultas.insertOne(item)).insertedId
        return item   
    }

    public async update(filter: {id: string}, item: Consulta): Promise<Consulta | undefined> {
        const _id = new ObjectId(filter.id)
        return (
            await consultas.findOneAndUpdate({_id},
            { $set: item },
            { returnDocument: "after" })
        ) || undefined
    }

    public async delete(filter: {id: string}): Promise<Consulta | undefined> {
        const _id = new ObjectId(filter.id)
        return await consultas.findOneAndDelete({_id}) || undefined
    }
}