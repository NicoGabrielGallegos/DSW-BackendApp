import { Repository } from "../shared/repository.js";
import { Docente } from "./docente.entity.js";
import { db } from "../shared/db/connection.js";
import { ObjectId, Sort, SortDirection } from "mongodb";
import { Dictado } from "../dictado/dictado.entity.js";

const docentes = db.collection<Docente>("docentes")
const dictados = db.collection<Dictado>("dictados")

const defaultSort: Sort = { legajo: 1 }

export class DocenteRepository implements Repository<Docente> {

    private aggregationSort(alias: string, sort: Sort) {
        let newSort: any = {}
        if (Object.keys(sort).length === 0) sort = defaultSort
        Object.keys(sort).forEach(key => {
            newSort[`${alias}.${key}`] = sort[key as keyof Sort]
        })
        return newSort
    }

    public async findAll(options: { page: number, limit: number, sort?: Sort } = { page: 1, limit: 0 }): Promise<Docente[]> {
        return await docentes.find().sort(options.sort || defaultSort).skip((options.page - 1) * options.limit).limit(options.limit).toArray()
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

    public async findAllByFilter(filter: { legajo?: string, nombre?: string, apellido?: string, correo?: string }): Promise<Docente[]> {
        return await docentes.find(filter).toArray() || undefined
    }

    public async findAllByMateria(
        filter: { materia: ObjectId },
        options: { page: number, limit: number, sort?: Sort } = { page: 1, limit: 0 }
    ): Promise<Docente[]> {
        const docentesByMateria: Docente[] = [];
        const cursor = dictados.aggregate([
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
            },
            {
                $sort: this.aggregationSort("docente", options.sort || defaultSort)
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
            docentesByMateria.push(dictado.docente[0])
        });

        return docentesByMateria
    }

    public async count(): Promise<number> {
        return await docentes.countDocuments()
    }

    public async countByFilter(filter: { legajo?: string, nombre?: string, apellido?: string, correo?: string }): Promise<number> {
        return await docentes.countDocuments(filter)
    }

    public async countByMateria(filter: { materia: ObjectId }): Promise<number> {
        return (await dictados.aggregate([
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
                $count: "count"
            }
        ]).toArray())[0]?.count || 0;
    }
}