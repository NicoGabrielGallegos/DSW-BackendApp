import { Repository } from "../shared/repository.js";
import { Materia } from "./materia.entity.js";
import { db } from "../shared/db/connection.js";
import { ObjectId } from "mongodb";
import { Dictado } from "../dictado/dictado.entity.js";

const materias = db.collection<Materia>("materias")
const dictados = db.collection<Dictado>("dictados")

export class MateriaRepository implements Repository<Materia> {

    public async findAll(options: { page: number, limit: number } = { page: 1, limit: 0 }): Promise<Materia[]> {
        return await materias.find().sort({ descripcion: 1 }).skip((options.page - 1) * options.limit).limit(options.limit).toArray()
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

    public async findOneByFilter(filter: { descripcion?: string }): Promise<Materia | undefined> {
        return await materias.findOne(filter) || undefined
    }

    public async findAllByFilter(filter: { descripcion?: string }): Promise<Materia[] | undefined> {
        return await materias.find(filter).sort({ descripcion: 1 }).toArray() || undefined
    }

    public async findAllByDocente(filter: { docente: ObjectId }, options: { page: number, limit: number } = { page: 1, limit: 0 }): Promise<Materia[]> {
        const materiasByDocente: Materia[] = [];
        const cursor = dictados.aggregate([
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
            },
            {
                $sort: { "materia.descripcion": 1 }
            }
        ])

        // Aplicar filtros de paginación solo si el límite es positivo
        if (options.limit > 0) {
            // Aplicar skip solo si la página es válida
            if (options.page > 1) {
                cursor.skip((options.page - 1) * options.limit)
            }
            cursor.limit(options.limit)
        }


        (await cursor.toArray()).forEach((dictado) => {
            materiasByDocente.push(dictado.materia[0])
        });

        return materiasByDocente
    }

    public async countMaterias(): Promise<number> {
        return await materias.countDocuments()
    }

    public async countMateriasByDocente(filter: { docente: ObjectId }, options: { page: number, limit: number } = { page: 1, limit: 0 }): Promise<number> {
        return (await dictados.aggregate([
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
                $count: "count"
            }
        ]).toArray())[0].count;
    }
}