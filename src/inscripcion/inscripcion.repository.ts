import { addPopulationToPipeline, pagination, populateHas, Repository } from "../shared/repository.js";
import { Inscripcion } from "./inscripcion.entity.js";
import { db } from "../shared/db/connection.js";
import { Document, ObjectId, Sort } from "mongodb";
import { DateFilter } from "../shared/types/DateFilter.js";

const inscripciones = db.collection<Inscripcion>("inscripciones")

const defaultSort: Sort = { consulta: 1, alumno: 1 }

export class InscripcionRepository implements Repository<Inscripcion> {

    private sanitizeRangoHorario(filter: { horaInicio?: DateFilter, horaFin?: DateFilter }): { ["consulta.horaInicio"]?: DateFilter, ["consulta.horaFin"]?: DateFilter } {
        const rangoHorario: { "consulta.horaInicio"?: DateFilter, "consulta.horaFin"?: DateFilter } = {}
        if (filter.horaInicio) rangoHorario["consulta.horaInicio"] = filter.horaInicio
        if (filter.horaFin) rangoHorario["consulta.horaFin"] = filter.horaFin
        return rangoHorario
    }

    public async findAll(options: { page: number, limit: number, sort?: Sort, populate?: string[] } = { page: 1, limit: 0 }): Promise<Inscripcion[]> {
        // Poblar si es solicitado
        if (options.populate && options.populate.length !== 0) {
            const pipeline: Document[] = []
            // Poblar con consulta
            if (populateHas(options.populate || [], ["consulta", "dictado", "docente", "materia"]))
                addPopulationToPipeline(pipeline, { from: "consultas", field: "consulta" })
            // Poblar con dictado
            if (populateHas(options.populate || [], ["dictado", "docente", "materia"]))
                addPopulationToPipeline(pipeline, { from: "dictados", field: "consulta.dictado" })
            // Poblar con docente
            if (options.populate.includes("docente"))
                addPopulationToPipeline(pipeline, { from: "docentes", field: "consulta.dictado.docente" })
            // Poblar con materia
            if (options.populate.includes("materia"))
                addPopulationToPipeline(pipeline, { from: "materias", field: "consulta.dictado.materia" })
            // Poblar con alumno
            if (options.populate.includes("materia"))
                addPopulationToPipeline(pipeline, { from: "alumnos", field: "alumno" })

            const cursor = pagination(inscripciones.aggregate(pipeline).sort(options.sort || defaultSort), options).toArray()
            return await cursor as Inscripcion[]
        }

        return await inscripciones.find().sort(options.sort || defaultSort).skip((options.page - 1) * options.limit).limit(options.limit).toArray()
    }

    public async findOne(filter: { id: string }, options: { populate?: string[] } = {}): Promise<Inscripcion | undefined> {
        const _id = new ObjectId(filter.id)
        const pipeline: Document[] = [{ $match: { _id } }]
        // Poblar si es solicitado
        if (options.populate && options.populate.length !== 0) {
            // Poblar con dictado
            if (populateHas(options.populate || [], ["consulta", "dictado", "docente", "materia"]))
                addPopulationToPipeline(pipeline, { from: "consultas", field: "consulta" })
            // Poblar con dictado
            if (populateHas(options.populate || [], ["dictado", "docente", "materia"]))
                addPopulationToPipeline(pipeline, { from: "dictados", field: "consulta.dictado" })
            // Poblar con docente
            if (options.populate.includes("docente"))
                addPopulationToPipeline(pipeline, { from: "docentes", field: "consulta.dictado.docente" })
            // Poblar con materia
            if (options.populate.includes("materia"))
                addPopulationToPipeline(pipeline, { from: "materias", field: "consulta.dictado.materia" })
        }
        pipeline.push({ $limit: 1 })
        return (await inscripciones.aggregate(pipeline).toArray())[0] as Inscripcion || undefined
    }

    public async add(item: Inscripcion): Promise<Inscripcion | undefined> {
        item._id = (await inscripciones.insertOne(item)).insertedId
        return item
    }

    public async update(filter: { id: string }, item: Inscripcion): Promise<Inscripcion | undefined> {
        const _id = new ObjectId(filter.id)
        return (
            await inscripciones.findOneAndUpdate({ _id },
                { $set: item },
                { returnDocument: "after" })
        ) || undefined
    }

    public async delete(filter: { id: string }): Promise<Inscripcion | undefined> {
        const _id = new ObjectId(filter.id)
        return await inscripciones.findOneAndDelete({ _id }) || undefined
    }

    public async findOneByFilter(filter: { alumno?: ObjectId, consulta?: ObjectId }): Promise<Inscripcion | undefined> {
        return await inscripciones.findOne(filter) || undefined
    }

    public async findAllByFilter(
        filter: { alumno?: ObjectId, consulta?: ObjectId },
        options: { page: number, limit: number, sort?: Sort, populate?: string[] } = { page: 1, limit: 0 }
    ): Promise<Inscripcion[]> {
        // Poblar si es solicitado
        if (options.populate && options.populate.length !== 0) {
            const pipeline: Document[] = []
            // Poblar con alumno
            if (options.populate && options.populate.includes("alumno"))
                addPopulationToPipeline(pipeline, { from: "alumnos", field: "alumno" })
            // Poblar con consulta
            if (populateHas(options.populate || [], ["consulta", "dictado", "docente", "materia"]))
                addPopulationToPipeline(pipeline, { from: "consultas", field: "consulta" })
            // Poblar con dictado
            if (populateHas(options.populate || [], ["dictado", "docente", "materia"]))
                addPopulationToPipeline(pipeline, { from: "dictados", field: "consulta.dictado" })
            // Poblar con docente
            if (options.populate.includes("docente"))
                addPopulationToPipeline(pipeline, { from: "docentes", field: "consulta.dictado.docente" })
            // Poblar con materia
            if (options.populate.includes("materia"))
                addPopulationToPipeline(pipeline, { from: "materias", field: "consulta.dictado.materia" })

            const cursor = pagination(inscripciones.aggregate([
                {
                    $match: filter
                },
                ...pipeline
            ]).sort(options.sort || defaultSort), options).toArray()
            return await cursor as Inscripcion[]
        }

        // Sino, devolver sin poblar
        return await inscripciones.find(filter).sort(options.sort || defaultSort).skip((options.page - 1) * options.limit).limit(options.limit).toArray()
    }

    public async findAllByFilterWithHorario(
        filter: { alumno?: ObjectId, horaInicio?: DateFilter, horaFin?: DateFilter },
        options: { page: number, limit: number, sort?: Sort, populate?: string[] } = { page: 1, limit: 0 }
    ): Promise<Inscripcion[]> {
        const pipeline: Document[] = filter.alumno ? [{ $match: { alumno: filter.alumno } }] : []
        // Poblar con consulta para filtrar por horario de ser necesario
        addPopulationToPipeline(pipeline, { from: "consultas", field: "consulta" })
        pipeline.push({ $match: this.sanitizeRangoHorario(filter) })
        // Poblado del alumno por separado ya que no está anidado
        if (options.populate && options.populate.includes("alumno"))
            addPopulationToPipeline(pipeline, { from: "alumnos", field: "alumno" })
        // Poblar si es solicitado
        if (options.populate && populateHas(options.populate || [], ["consulta", "dictado", "docente", "materia"])) {
            // Poblar con dictado
            if (populateHas(options.populate || [], ["dictado", "docente", "materia"]))
                addPopulationToPipeline(pipeline, { from: "dictados", field: "consulta.dictado" })
            // Poblar con docente
            if (options.populate.includes("docente"))
                addPopulationToPipeline(pipeline, { from: "docentes", field: "consulta.dictado.docente" })
            // Poblar con materia
            if (options.populate.includes("materia"))
                addPopulationToPipeline(pipeline, { from: "materias", field: "consulta.dictado.materia" })

            const cursor = pagination(inscripciones.aggregate(
                pipeline
            ).sort(options.sort || defaultSort), options).toArray()
            return await cursor as Inscripcion[]
        }

        let inscripcionesByFilterWithHorario: Inscripcion[] = [];

        (await pagination(inscripciones.aggregate(
            pipeline
        ).sort(options.sort || defaultSort), options).toArray()).forEach((inscripcion) => {
            inscripcionesByFilterWithHorario.push({ alumno: inscripcion.alumno, consulta: inscripcion.consulta._id, _id: inscripcion._id })
        });


        return inscripcionesByFilterWithHorario
    }

    public async deleteByAlumno(filter: { alumno: ObjectId }): Promise<void> {
        await inscripciones.deleteMany(filter)
    }

    public async deleteByConsulta(filter: { consulta: ObjectId }): Promise<void> {
        await inscripciones.deleteMany(filter)
    }

    public async count(): Promise<number> {
        return await inscripciones.countDocuments()
    }

    public async countByFilter(filter: { alumno?: ObjectId, consulta?: ObjectId }): Promise<number> {
        return await inscripciones.countDocuments(filter)
    }

    public async countByFilterWithHorario(filter: { alumno?: ObjectId, horaInicio?: DateFilter, horaFin?: DateFilter }): Promise<number> {
        return (await inscripciones.aggregate([
            {
                $match: filter.alumno ? { alumno: filter.alumno } : {}
            },
            {
                $lookup: {
                    from: "consultas",
                    localField: "consulta",
                    foreignField: "_id",
                    as: "consulta"
                }
            },
            {
                $unwind: "$consulta"
            },
            {
                $match: this.sanitizeRangoHorario(filter)
            },
            {
                $count: "count"
            }
        ]).toArray())[0]?.count || 0;
    }
}