import { Repository } from "../shared/repository.js";
import { Materia } from "./materia.entity.js";
import { db } from "../shared/db/connection.js";
import { ObjectId } from "mongodb";

const materias = db.collection<Materia>("materias")

export class MateriaRepository implements Repository<Materia> {
    
    public async findAll(): Promise<Materia[] | undefined> {
            return await materias.find().toArray()
        }
    
        public async findOne(filter: {id: string}): Promise<Materia | undefined> {
            const _id = new ObjectId(filter.id)
            return await materias.findOne({ _id }) || undefined
        }
    
        public async add(item: Materia): Promise<Materia | undefined> {
            item._id = (await materias.insertOne(item)).insertedId
            return item   
        }
    
        public async update(filter: {id: string}, item: Materia): Promise<Materia | undefined> {
            const _id = new ObjectId(filter.id)
            return (
                await materias.findOneAndUpdate({_id},
                { $set: item },
                { returnDocument: "after" })
            ) || undefined
        }
    
        public async delete(filter: {id: string}): Promise<Materia | undefined> {
            const _id = new ObjectId(filter.id)
            return await materias.findOneAndDelete({_id}) || undefined
        }
}