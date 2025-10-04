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
        res.status(400).send({ message: error_message.slice(0, -2)})
        return
    }
    
    next()
}