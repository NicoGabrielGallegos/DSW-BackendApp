import { addPopulationToPipeline, pagination, populateHas, Repository, sanitizeRangoHorario } from "../shared/repository.js";
import { Consulta } from "./consulta.entity.js";
import { db } from "../shared/db/connection.js";
import { Document, ObjectId, Sort } from "mongodb";
import { DateFilter } from "../shared/types/DateFilter.js";

const consultas = db.collection<Consulta>("consultas")

const defaultSort: Sort = { horaInicio: 1, horaFin: 1, dictado: 1 }

export class ConsultaRepository implements Repository<Consulta> {

    public async findAll(options: { page: number, limit: number, sort?: Sort, populate?: string[] } = { page: 1, limit: 0 }): Promise<Consulta[]> {
        // Poblar si es solicitado
        if (options.populate && options.populate.length !== 0) {
            const pipeline: Document[] = []
            // Poblar con dictado
            if (populateHas(options.populate || [], ["dictado", "docente", "materia"]))
                addPopulationToPipeline(pipeline, { from: "dictados", field: "dictado" })
            // Poblar con docente
            if (options.populate.includes("docente"))
                addPopulationToPipeline(pipeline, { from: "docentes", field: "dictado.docente" })
            // Poblar con materia
            if (options.populate.includes("materia"))
                addPopulationToPipeline(pipeline, { from: "materias", field: "dictado.materia" })

            const cursor = pagination(consultas.aggregate(pipeline).sort(options.sort || defaultSort), options).toArray()
            return await cursor as Consulta[]
        }

        // Sino, devolver sin poblar
        return await consultas.find().sort(options.sort || defaultSort).skip((options.page - 1) * options.limit).limit(options.limit).toArray()
    }

    public async findOne(filter: { id: string }, options: { populate?: string[] } = {}): Promise<Consulta | undefined> {
        const _id = new ObjectId(filter.id)
        const pipeline: Document[] = [{ $match: { _id } }]
        // Poblar si es solicitado
        if (options.populate && options.populate.length !== 0) {
            // Poblar con dictado
            if (populateHas(options.populate || [], ["dictado", "docente", "materia"]))
                addPopulationToPipeline(pipeline, { from: "dictados", field: "dictado" })
            // Poblar con docente
            if (options.populate.includes("docente"))
                addPopulationToPipeline(pipeline, { from: "docentes", field: "dictado.docente" })
            // Poblar con materia
            if (options.populate.includes("materia"))
                addPopulationToPipeline(pipeline, { from: "materias", field: "dictado.materia" })

        }
        pipeline.push({ $limit: 1 })
        return (await consultas.aggregate(pipeline).toArray())[0] as Consulta || undefined
    }

    public async add(item: Consulta): Promise<Consulta | undefined> {
        item._id = (await consultas.insertOne(item)).insertedId
        return item
    }

    public async update(filter: { id: string }, item: Consulta): Promise<Consulta | undefined> {
        const _id = new ObjectId(filter.id)
        return (
            await consultas.findOneAndUpdate({ _id },
                { $set: item },
                { returnDocument: "after" })
        ) || undefined
    }

    public async delete(filter: { id: string }): Promise<Consulta | undefined> {
        const _id = new ObjectId(filter.id)
        return await consultas.findOneAndDelete({ _id }) || undefined
    }

    public async findAllByFilter(
        filter: { dictado?: ObjectId, horaInicio?: DateFilter, horaFin?: DateFilter, estado?: string },
        options: { page: number, limit: number, sort?: Sort, populate?: string[] } = { page: 1, limit: 0 }
    ): Promise<Consulta[]> {
        // Poblar si es solicitado
        if (options.populate && options.populate.length !== 0) {
            const pipeline: Document[] = []
            // Poblar con dictado
            if (populateHas(options.populate || [], ["dictado", "docente", "materia"]))
                addPopulationToPipeline(pipeline, { from: "dictados", field: "dictado" })
            // Poblar con docente
            if (options.populate.includes("docente"))
                addPopulationToPipeline(pipeline, { from: "docentes", field: "dictado.docente" })
            // Poblar con materia
            if (options.populate.includes("materia"))
                addPopulationToPipeline(pipeline, { from: "materias", field: "dictado.materia" })

            const cursor = pagination(consultas.aggregate([
                {
                    $match: filter
                },
                ...pipeline
            ]).sort(options.sort || defaultSort), options).toArray()
            return await cursor as Consulta[]
        }

        // Sino, devolver sin poblar
        return await consultas.find(filter).sort(options.sort || defaultSort).skip((options.page - 1) * options.limit).limit(options.limit).toArray()
    }

    public async findAllByDocente(
        filter: { docente: ObjectId, horaInicio?: DateFilter, horaFin?: DateFilter },
        options: { page: number, limit: number, sort?: Sort, populate?: string[] } = { page: 1, limit: 0 }
    ): Promise<Consulta[]> {
        const pipeline: Document[] = [{ $match: sanitizeRangoHorario(filter) }]
        // Poblar con dictado siempre para filtrar por docente
        addPopulationToPipeline(pipeline, { from: "dictados", field: "dictado" })
        pipeline.push({ $match: { "dictado.docente": filter.docente } })
        // Poblar si es solicitado
        if (options.populate && populateHas(options.populate || [], ["dictado", "docente", "materia"])) {
            // Poblar con docente
            if (options.populate.includes("docente"))
                addPopulationToPipeline(pipeline, { from: "docentes", field: "dictado.docente" })
            // Poblar con materia
            if (options.populate.includes("materia"))
                addPopulationToPipeline(pipeline, { from: "materias", field: "dictado.materia" })

            const cursor = pagination(consultas.aggregate(
                pipeline
            ).sort(options.sort || defaultSort), options).toArray()
            return await cursor as Consulta[]
        }

        let consultasByDocente: Consulta[] = [];

        (await pagination(consultas.aggregate(
            pipeline
        ).sort(options.sort || defaultSort), options).toArray()).forEach((consulta) => {
            consultasByDocente.push({ _id: consulta._id, dictado: consulta.dictado._id, horaInicio: consulta.horaInicio, horaFin: consulta.horaFin, estado: consulta.estado })
        });

        return consultasByDocente
    }

    public async findAllByMateria(
        filter: { materia: ObjectId, horaInicio?: DateFilter, horaFin?: DateFilter },
        options: { page: number, limit: number, sort?: Sort, populate?: string[] } = { page: 1, limit: 0 }
    ): Promise<Consulta[]> {
        const pipeline: Document[] = [{ $match: sanitizeRangoHorario(filter) }]
        // Poblar con dictado siempre para filtrar por docente
        addPopulationToPipeline(pipeline, { from: "dictados", field: "dictado" })
        pipeline.push({ $match: { "dictado.materia": filter.materia } })
        // Poblar si es solicitado
        if (options.populate && populateHas(options.populate || [], ["dictado", "docente", "materia"])) {
            // Poblar con docente
            if (options.populate.includes("docente"))
                addPopulationToPipeline(pipeline, { from: "docentes", field: "dictado.docente" })
            // Poblar con materia
            if (options.populate.includes("materia"))
                addPopulationToPipeline(pipeline, { from: "materias", field: "dictado.materia" })

            const cursor = pagination(consultas.aggregate(
                pipeline
            ).sort(options.sort || defaultSort), options).toArray()
            return await cursor as Consulta[]
        }

        let consultasByDocente: Consulta[] = [];

        (await pagination(consultas.aggregate(
            pipeline
        ).sort(options.sort || defaultSort), options).toArray()).forEach((consulta) => {
            consultasByDocente.push({ _id: consulta._id, dictado: consulta.dictado._id, horaInicio: consulta.horaInicio, horaFin: consulta.horaFin, estado: consulta.estado })
        });

        return consultasByDocente
    }

    public async count(): Promise<number> {
        return await consultas.countDocuments()
    }

    public async countByFilter(filter: { dictado?: ObjectId, horaInicio?: DateFilter, horaFin?: DateFilter, estado?: string }): Promise<number> {
        return await consultas.countDocuments(filter)
    }

    public async countByDocente(filter: { docente: ObjectId, horaInicio?: DateFilter, horaFin?: DateFilter }): Promise<number> {
        return (await consultas.aggregate([
            {
                $match: sanitizeRangoHorario(filter)
            },
            {
                $lookup: {
                    from: "dictados",
                    localField: "dictado",
                    foreignField: "_id",
                    as: "dictado",
                }
            },
            {
                $match: {
                    dictado: { $elemMatch: { docente: filter.docente } }
                }
            },
            {
                $count: "count"
            }
        ]).toArray())[0]?.count || 0;
    }

    public async countByMateria(filter: { materia: ObjectId, horaInicio?: DateFilter, horaFin?: DateFilter }): Promise<number> {
        return (await consultas.aggregate([
            {
                $match: sanitizeRangoHorario(filter)
            },
            {
                $lookup: {
                    from: "dictados",
                    localField: "dictado",
                    foreignField: "_id",
                    as: "dictado",
                }
            },
            {
                $match: {
                    dictado: { $elemMatch: { materia: filter.materia } }
                }
            },
            {
                $count: "count"
            }
        ]).toArray())[0]?.count || 0;
    }
}