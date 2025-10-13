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

export function getSanitizedQuery(req: Request) {
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