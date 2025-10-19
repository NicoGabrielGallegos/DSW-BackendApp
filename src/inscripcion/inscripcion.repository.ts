import { Repository } from "../shared/repository.js";
import { Inscripcion } from "./inscripcion.entity.js";
import { db } from "../shared/db/connection.js";
import { ObjectId, Sort } from "mongodb";
import { DateFilter } from "../shared/types/DateFilter.js";

const inscripciones = db.collection<Inscripcion>("inscripciones")

const defaultSort: Sort = { consulta: 1, alumno: 1 }

export class InscripcionRepository implements Repository<Inscripcion> {

    private sanitizeRangoHorario(filter: { horaInicio?: DateFilter, horaFin?: DateFilter }): { horaInicio?: DateFilter, horaFin?: DateFilter } {
        const rangoHorario: { horaInicio?: DateFilter, horaFin?: DateFilter } = {}
        if (filter.horaInicio) rangoHorario.horaInicio = filter.horaInicio
        if (filter.horaFin) rangoHorario.horaFin = filter.horaFin
        return rangoHorario
    }

    public async findAll(options: { page: number, limit: number, sort?: Sort } = { page: 1, limit: 0 }): Promise<Inscripcion[]> {
        return await inscripciones.find().sort(options.sort || defaultSort).skip((options.page - 1) * options.limit).limit(options.limit).toArray()
    }

    public async findOne(filter: { id: string }): Promise<Inscripcion | undefined> {
        const _id = new ObjectId(filter.id)
        return await inscripciones.findOne({ _id }) || undefined
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
        options: { page: number, limit: number, sort?: Sort } = { page: 1, limit: 0 }
    ): Promise<Inscripcion[]> {
        return await inscripciones.find(filter).sort(options.sort || defaultSort).skip((options.page - 1) * options.limit).limit(options.limit).toArray() || undefined
    }

    public async findAllByFilterWithHorario(
        filter: { alumno?: ObjectId, horaInicio?: DateFilter, horaFin?: DateFilter },
        options: { page: number, limit: number, sort?: Sort } = { page: 1, limit: 0 }
    ): Promise<Inscripcion[]> {
        const inscripcionesByFilterWithHorario: Inscripcion[] = [];

        const cursor = inscripciones.aggregate([
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
                $match: {
                    consulta: { $elemMatch: this.sanitizeRangoHorario(filter) }
                }
            },
            {
                $project: { "alumno": 1, "consulta": 1 }
            }
        ]).sort(options.sort || defaultSort)

        // Aplicar filtros de paginación solo si el límite es positivo
        if (options.limit > 0) {
            // Aplicar skip solo si la página es válida
            if (options.page > 1) {
                cursor.skip((options.page - 1) * options.limit)
            }
            cursor.limit(options.limit)
        }

        (await cursor.toArray()).forEach((inscripcion) => {
            inscripcionesByFilterWithHorario.push({ alumno: inscripcion.alumno, consulta: inscripcion.consulta[0]._id, _id: inscripcion._id })
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
                $match: {
                    consulta: { $elemMatch: this.sanitizeRangoHorario(filter) }
                }
            },
            {
                $count: "count"
            }
        ]).toArray())[0]?.count || 0;
    }
}