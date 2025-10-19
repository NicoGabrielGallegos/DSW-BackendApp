import { Repository } from "../shared/repository.js";
import { Materia } from "./materia.entity.js";
import { db } from "../shared/db/connection.js";
import { ObjectId, Sort } from "mongodb";
import { Dictado } from "../dictado/dictado.entity.js";

const materias = db.collection<Materia>("materias")
const dictados = db.collection<Dictado>("dictados")

const defaultSort: Sort = { descripcion: 1 }

export class MateriaRepository implements Repository<Materia> {

    private aggregationSort(alias: string, sort: Sort) {
        let newSort: any = {}
        if (Object.keys(sort).length === 0) sort = defaultSort
        Object.keys(sort).forEach(key => {
            newSort[`${alias}.${key}`] = sort[key as keyof Sort]
        })
        return newSort
    }

    public async findAll(options: { page: number, limit: number, sort?: Sort } = { page: 1, limit: 0 }): Promise<Materia[]> {
        return await materias.find().sort(options.sort || defaultSort).skip((options.page - 1) * options.limit).limit(options.limit).toArray()
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

    public async findAllByFilter(
        filter: { descripcion?: string },
        options: { page: number, limit: number, sort?: Sort } = { page: 1, limit: 0 }
    ): Promise<Materia[]> {
        return await materias.find(filter).sort(options.sort || defaultSort).toArray() || undefined
    }

    public async findAllByDocente(
        filter: { docente: ObjectId },
        options: { page: number, limit: number, sort?: Sort } = { page: 1, limit: 0 }
    ): Promise<Materia[]> {
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
                $sort: this.aggregationSort("materia", options.sort || defaultSort)
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

    public async count(): Promise<number> {
        return await materias.countDocuments()
    }

    public async countByDocente(filter: { docente: ObjectId }): Promise<number> {
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
        ]).toArray())[0]?.count || 0;
    }
}