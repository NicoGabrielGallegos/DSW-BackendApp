import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export const PRIVATE_KEY = "private_key"

export function auth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        res.status(401).send({ message: "No autorizado" })
        return
    }
    
    const token = authHeader.split(" ")[1]
    try {
        const decoded = jwt.verify(token, PRIVATE_KEY)
        
        if(!req.body) req.body = {}
        req.body.loggedUser = decoded

        next()
    } catch (err) {
        
        res.status(401).send({ message: "Token inválido" })
    }
}