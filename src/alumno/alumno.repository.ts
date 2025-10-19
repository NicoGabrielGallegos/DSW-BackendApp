import { Repository } from "../shared/repository.js";
import { Alumno } from "./alumno.entity.js";
import { db } from "../shared/db/connection.js";
import { ObjectId, Sort } from "mongodb";
import { Inscripcion } from "../inscripcion/inscripcion.entity.js";

const alumnos = db.collection<Alumno>("alumnos")
const inscripciones = db.collection<Inscripcion>("inscripciones")

const defaultSort: Sort = { legajo: 1 }

export class AlumnoRepository implements Repository<Alumno> {

    private aggregationSort(alias: string, sort: Sort) {
        let newSort: any = {}
        if (Object.keys(sort).length === 0) sort = defaultSort
        Object.keys(sort).forEach(key => {
            newSort[`${alias}.${key}`] = sort[key as keyof Sort]
        })
        return newSort
    }

    public async findAll(options: { page: number, limit: number, sort?: Sort } = { page: 1, limit: 0 }): Promise<Alumno[]> {
        return await alumnos.find().sort(options.sort || defaultSort).skip((options.page - 1) * options.limit).limit(options.limit).toArray()
    }

    public async findOne(filter: { id: string }): Promise<Alumno | undefined> {
        const _id = new ObjectId(filter.id)
        return await alumnos.findOne({ _id }) || undefined
    }

    public async add(item: Alumno): Promise<Alumno | undefined> {
        item._id = (await alumnos.insertOne(item)).insertedId
        return item
    }

    public async update(filter: { id: string }, item: Alumno): Promise<Alumno | undefined> {
        const _id = new ObjectId(filter.id)
        return (
            await alumnos.findOneAndUpdate({ _id },
                { $set: item },
                { returnDocument: "after" })
        ) || undefined
    }

    public async delete(filter: { id: string }): Promise<Alumno | undefined> {
        const _id = new ObjectId(filter.id)
        return await alumnos.findOneAndDelete({ _id }) || undefined
    }

    public async findOneByFilter(filter: { legajo?: string, nombre?: string, apellido?: string, correo?: string }): Promise<Alumno | undefined> {
        return await alumnos.findOne(filter) || undefined
    }

    public async findAllByFilter(
        filter: { legajo?: string, nombre?: string, apellido?: string, correo?: string },
        options: { page: number, limit: number, sort?: Sort } = { page: 1, limit: 0, }
    ): Promise<Alumno[]> {
        return await alumnos.find(filter).sort(options.sort || defaultSort).skip((options.page - 1) * options.limit).limit(options.limit).toArray() || undefined
    }

    public async findAllByConsulta(
        filter: { consulta: ObjectId },
        options: { page: number, limit: number, sort?: Sort } = { page: 1, limit: 0 }
    ): Promise<Alumno[]> {
        const alumnosByConsulta: Alumno[] = [];
        const cursor = inscripciones.aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: "alumnos",
                    localField: "alumno",
                    foreignField: "_id",
                    as: "alumno"
                }
            },
            {
                $project: { "alumno": 1 }
            },
            {
                $sort: this.aggregationSort("alumno", options.sort || defaultSort)
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

        (await cursor.toArray()).forEach((inscripcion) => {
            alumnosByConsulta.push(inscripcion.alumno[0])
        });

        return alumnosByConsulta
    }

    public async count(): Promise<number> {
        return await alumnos.countDocuments()
    }

    public async countByFilter(filter: { legajo?: string, nombre?: string, apellido?: string, correo?: string }): Promise<number> {
        return await alumnos.countDocuments(filter)
    }

    public async countByConsulta(filter: { consulta: ObjectId }): Promise<number> {
        return (await inscripciones.aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: "alumnos",
                    localField: "alumno",
                    foreignField: "_id",
                    as: "alumno"
                }
            },
            {
                $count: "count"
            }
        ]).toArray())[0]?.count || 0;
    }
}