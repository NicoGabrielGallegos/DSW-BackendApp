import { Request, Response, NextFunction } from "express";
import { AdministradorRepository } from "./administrador.repository.js";
import { isValidEmail } from "../shared/validations.js";

const administradorRepository = new AdministradorRepository()

// ----- Operaciones CRUD comunes -----

async function findAll(req: Request, res: Response) {
    const administradores = await administradorRepository.findAll()
    const total = await administradorRepository.count()
    res.json({ data: administradores, total, page: 1, limit: 0 })
}

async function findOne(req: Request, res: Response) {
    const administrador = await administradorRepository.findOne({ id: req.params.id })
    if (!administrador) {
        res.status(404).send({ message: "Administrador no encontrado" })
        return
    }
    res.json({ data: administrador })
}

async function findOneByCorreo(req: Request, res: Response) {
    const correo = req.params.correo
    if (!isValidEmail(correo)) {
        res.status(404).send({ message: "El correo ingresado no es válido" })
        return
    }
    const administrador = await administradorRepository.findOneByFilter({ correo: req.params.correo })
    if (!administrador) {
        res.status(404).send({ message: "Administrador no encontrado" })
        return
    }
    res.json({ data: administrador })
}


export { findAll, findOne, findOneByCorreo }
