import { Repository } from "../shared/repository.js";
import { Dictado } from "./dictado.entity.js";
import { db } from "../shared/db/connection.js";
import { ObjectId } from "mongodb";

const dictados = db.collection<Dictado>("dictados")

export class DictadoRepository implements Repository<Dictado> {

    public async findAll(options: { page: number, limit: number } = { page: 1, limit: 0 }): Promise<Dictado[]> {
        return await dictados.find().sort({ legajo: 1 }).skip((options.page - 1) * options.limit).limit(options.limit).toArray()
    }

    public async findOne(filter: { id: string }): Promise<Dictado | undefined> {
        const _id = new ObjectId(filter.id)
        return await dictados.findOne({ _id }) || undefined
    }

    public async add(item: Dictado): Promise<Dictado | undefined> {
        item._id = (await dictados.insertOne(item)).insertedId
        return item
    }

    public async update(filter: { id: string }, item: Dictado): Promise<Dictado | undefined> {
        const _id = new ObjectId(filter.id)
        return (
            await dictados.findOneAndUpdate({ _id },
                { $set: item },
                { returnDocument: "after" })
        ) || undefined
    }

    public async delete(filter: { id: string }): Promise<Dictado | undefined> {
        const _id = new ObjectId(filter.id)
        return await dictados.findOneAndDelete({ _id }) || undefined
    }

    public async findOneByFilter(filter: { docente?: ObjectId, materia?: ObjectId }): Promise<Dictado | undefined> {
        return await dictados.findOne(filter) || undefined
    }

    public async findAllByFilter(filter: { docente?: ObjectId, materia?: ObjectId }, options: { page: number, limit: number } = { page: 1, limit: 0 }): Promise<Dictado[]> {
        return await dictados.find(filter).sort({ legajo: 1 }).skip((options.page - 1) * options.limit).limit(options.limit).toArray() || undefined
    }

    public async deleteByDocente(filter: { docente: ObjectId }): Promise<void> {
        await dictados.deleteMany(filter)
    }

    public async deleteByMateria(filter: { materia: ObjectId }): Promise<void> {
        await dictados.deleteMany(filter)
    }

    public async count(): Promise<number> {
        return await dictados.countDocuments()
    }

    public async countByFilter(filter: { docente?: ObjectId, materia?: ObjectId }): Promise<number> {
        return await dictados.countDocuments(filter)
    }
}