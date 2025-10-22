import { Request, Response, NextFunction } from "express"

export function assureCompleteInput(req: Request, res: Response, next: NextFunction) {
    let error_message = "Entrada incompleta. Propiedades faltantes: "
    let error = false

    Object.keys(req.body.input).forEach(key => {
        if (req.body.input[key] === undefined) {
            error_message += key + ", "
            error = true
        }
    })

    if (error) {
        res.status(400).send({ message: error_message.slice(0, -2) })
        return
    }

    next()
}

export function getSanitizedPaginationParams(req: Request) {
    let page: number
    try {
        page = parseInt(req.query.p?.toString() || "") || 1
        if (page < 1) page = 1
    } catch (err) {
        page = 1
    }

    let limit: number
    try {
        limit = parseInt(req.query.l?.toString() || "") || 0
        if (limit < 0) limit = 0
    } catch (err) {
        limit = 0
    }

    return { page, limit }
}

export function getSanitizedDateTimeRangeParams(req: Request) {
    let horaInicio: string = req.query.i?.toString() || ""
    let horaFin: string = req.query.f?.toString() || ""

    return {
        horaInicio: isNaN(Date.parse(horaInicio)) ? "" : horaInicio,
        horaFin: isNaN(Date.parse(horaFin)) ? "" : horaFin
    }
}

export function getPopulateParams(req: Request) {
    let populate: string[] = req.query.populate?.toString().split(",") || []

    return { populate }
}

export function getSanitizedSortingParams(req: Request) {
    let sort: any = {}
    req.query.sort?.toString().split(",").forEach(s => {
        const [field, direction] = s.split(":")
        if (["asc", "ascending", "1"].includes(direction)) sort[field] = 1
        else if (["desc", "descending", "-1"].includes(direction)) sort[field] = -1
    })

    if (Object.keys(sort).length === 0) {
        sort = null
    }

    return { sort }

}