import { Repository } from "../shared/repository.js";
import { Docente } from "./docente.entity.js";
import { db } from "../shared/db/connection.js";
import { ObjectId } from "mongodb";

const docentes = db.collection<Docente>("docentes")

export class DocenteRepository implements Repository<Docente> {

    public async findAll(): Promise<Docente[] | undefined> {
        return await docentes.find().toArray()
    }

    public async findOne(filter: {id: string}): Promise<Docente | undefined> {
            const _id = new ObjectId(filter.id)
            return await docentes.findOne({ _id }) || undefined
        }
    
        public async add(item: Docente): Promise<Docente | undefined> {
            item._id = (await docentes.insertOne(item)).insertedId
            return item   
        }
    
        public async update(filter: {id: string}, item: Docente): Promise<Docente | undefined> {
            const _id = new ObjectId(filter.id)
            return (
                await docentes.findOneAndUpdate({_id},
                { $set: item },
                { returnDocument: "after" })
            ) || undefined
        }
    
        public async delete(filter: {id: string}): Promise<Docente | undefined> {
            const _id = new ObjectId(filter.id)
            return await docentes.findOneAndDelete({_id}) || undefined
        }
}