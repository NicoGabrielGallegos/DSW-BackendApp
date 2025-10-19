import { AggregationCursor, Document } from "mongodb"
import { DateFilter } from "./types/DateFilter.js"

export interface Repository<T> {
    findAll(): Promise<T[] | undefined>
    findOne(filter: { id: string }): Promise<T | undefined>
    add(item: T): Promise<T | undefined>
    update(filter: { id: string }, item: T): Promise<T | undefined>
    delete(filter: { id: string }): Promise<T | undefined>
}

export function sanitizeRangoHorario(filter: { horaInicio?: DateFilter, horaFin?: DateFilter }): { horaInicio?: DateFilter, horaFin?: DateFilter } {
    const rangoHorario: { horaInicio?: DateFilter, horaFin?: DateFilter } = {}
    if (filter.horaInicio) rangoHorario.horaInicio = filter.horaInicio
    if (filter.horaFin) rangoHorario.horaFin = filter.horaFin
    return rangoHorario
}

export function pagination(cursor: AggregationCursor<Document>, options: { page: number, limit: number }) {
    // Aplicar filtros de paginación solo si el límite es positivo
    if (options.limit > 0) {
        // Aplicar skip solo si la página es válida
        if (options.page > 1) {
            cursor.skip((options.page - 1) * options.limit)
        }
        cursor.limit(options.limit)
    }
    return cursor
}

export function addPopulationToPipeline(pipeline: Document[], populate: { from: string, field: string, projection?: Document }) {
    pipeline.push(
        {
            $lookup: {
                from: populate.from,
                localField: populate.field,
                foreignField: "_id",
                as: populate.field,
                pipeline: [{ $project: populate.projection || { password: 0 } }]
            }
        },
        {
            $unwind: `$${populate.field}`
        }
    )
    return pipeline
}

export function populateHas(populate: string[], values: string[]) {
    return values.some(val => (populate).includes(val))
}