import { Repository } from "../shared/repository.js";
import { Materia } from "./materia.entity.js";
import { db } from "../shared/db/connection.js";
import { ObjectId } from "mongodb";
import { Dictado } from "../dictado/dictado.entity.js";

const materias = db.collection<Materia>("materias")
const dictados = db.collection<Dictado>("dictados")

export class MateriaRepository implements Repository<Materia> {

    public async findAll(): Promise<Materia[] | undefined> {
        return await materias.find().toArray()
    }

    public async findOne(filter: { id: string }): Promise<Materia | undefined> {
        const _id = new ObjectId(filter.id)
        return await materias.findOne({ _id }) || undefined
    }

    public async add(item: Materia): Promise<Materia | undefined> {
        item._id = (await materias.insertOne(item)).insertedId
        return item
    }

    public async update(filter: { id: string }, item: Materia): Promise<Materia | undefined> {
        const _id = new ObjectId(filter.id)
        return (
            await materias.findOneAndUpdate({ _id },
                { $set: item },
                { returnDocument: "after" })
        ) || undefined
    }

    public async delete(filter: { id: string }): Promise<Materia | undefined> {
        const _id = new ObjectId(filter.id)
        return await materias.findOneAndDelete({ _id }) || undefined
    }

    public async findOneByFilter(filter: { descripcion?: string}): Promise<Materia | undefined> {
        return await materias.findOne(filter) || undefined
    }

    public async findAllByFilter(filter: { descripcion?: string }): Promise<Materia[] | undefined> {
        return await materias.find(filter).toArray() || undefined
    }

    public async findAllByDocente(filter: { docente: ObjectId }): Promise<Materia[] | undefined> {
        const materiasByDocente: Materia[] = [];
        (await dictados.aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: "materias",
                    localField: "materia",
                    foreignField: "_id",
                    as: "materia"
                }
            },
            {
                $project: { "materia": 1 }
            }

        ]).toArray()).forEach((dictado) => {
            materiasByDocente.push(dictado.materia[0])
        });

        return materiasByDocente
    }
}