import { Repository } from "../shared/repository.js";
import { Docente } from "./docente.entity.js";
import { db } from "../shared/db/connection.js";
import { ObjectId } from "mongodb";
import { Dictado } from "../dictado/dictado.entity.js";

const docentes = db.collection<Docente>("docentes")
const dictados = db.collection<Dictado>("dictados")

export class DocenteRepository implements Repository<Docente> {

    public async findAll(): Promise<Docente[] | undefined> {
        return await docentes.find().toArray()
    }

    public async findOne(filter: { id: string }): Promise<Docente | undefined> {
        const _id = new ObjectId(filter.id)
        return await docentes.findOne({ _id }) || undefined
    }

    public async add(item: Docente): Promise<Docente | undefined> {
        item._id = (await docentes.insertOne(item)).insertedId
        return item
    }

    public async update(filter: { id: string }, item: Docente): Promise<Docente | undefined> {
        const _id = new ObjectId(filter.id)
        return (
            await docentes.findOneAndUpdate({ _id },
                { $set: item },
                { returnDocument: "after" })
        ) || undefined
    }

    public async delete(filter: { id: string }): Promise<Docente | undefined> {
        const _id = new ObjectId(filter.id)
        return await docentes.findOneAndDelete({ _id }) || undefined
    }

    public async findOneByFilter(filter: { legajo?: string, nombre?: string, apellido?: string, correo?: string }): Promise<Docente | undefined> {
        return await docentes.findOne(filter) || undefined
    }

    public async findAllByFilter(filter: { legajo?: string, nombre?: string, apellido?: string, correo?: string }): Promise<Docente[] | undefined> {
        return await docentes.find(filter).toArray() || undefined
    }

    public async findAllByMateria(filter: { materia: ObjectId }): Promise<Docente[]> {
        const docentesByMateria: Docente[] = [];
        (await dictados.aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: "docentes",
                    localField: "docente",
                    foreignField: "_id",
                    as: "docente"
                }
            },
            {
                $project: { "docente": 1 }
            }

        ]).toArray()).forEach((dictado) => {
            docentesByMateria.push(dictado.docente[0])
        });

        return docentesByMateria
    }
}