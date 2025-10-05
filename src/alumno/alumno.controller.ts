import { Request, Response, NextFunction } from "express"
import { AlumnoRepository } from "./alumno.repository.js"
import { Alumno } from "./alumno.entity.js"
import { isValidEmail } from "../shared/validations.js"
import { hash } from "bcryptjs"

const repository = new AlumnoRepository()

function extractInput(req: Request, res: Response, next: NextFunction) {
    req.body.input = {
        legajo: req.body.legajo,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        correo: req.body.correo,
        password: req.body.password
    }
    next()
}

async function sanitizeInput(req: Request, res: Response, next: NextFunction) {
    const { legajo, nombre, apellido, correo, password } = req.body.input
    req.body.sanitizedInput = {
        legajo: legajo,
        nombre: nombre,
        apellido: apellido,
    }

    if (correo !== undefined) {
        if (isValidEmail(correo)) {
            req.body.sanitizedInput.correo = correo
        } else {
            res.status(400).send({ message: "El correo ingresado no es válido" })
            return
        }
    }

    if (password !== undefined) {
        req.body.sanitizedInput.password = await hash(password, 10)
    }

    delete req.body.input
    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]
        }
    })

    next()
}

async function findAll(_req: Request, res: Response) {
    res.json({ data: await repository.findAll() })
}

async function findOne(req: Request, res: Response) {
    const alumno = await repository.findOne({ id: req.params.id })
    if (!alumno) {
        res.status(404).send({ message: "Alumno no encontrado" })
        return
    }
    res.json({ data: alumno })
}

async function add(req: Request, res: Response) {
    const { legajo, nombre, apellido, correo, password } = req.body.sanitizedInput
    const alumnoInput = new Alumno(legajo, nombre, apellido, correo, password)
    try {
        const alumno = await repository.add(alumnoInput)
        res.status(201).send({ message: "Alumno creado con éxito", data: alumno })
    } catch (err) {
        res.status(400).send({ message: err})
    }
}

async function update(req: Request, res: Response) {
    const alumno = await repository.update({ id: req.params.id }, req.body.sanitizedInput)
    if (!alumno) {
        res.status(404).send({ message: "Alumno no encontrado" })
        return
    }
    res.status(201).send({ message: "Alumno modificado con éxito", data: alumno })
}

async function remove(req: Request, res: Response) {
    const alumno = await repository.delete({ id: req.params.id })
    if (!alumno) {
        res.status(404).send({ message: "Alumno no encontrado" })
        return
    }
    res.status(200).send({ message: "Alumno borrado con éxito", data: alumno })

    // TODO:
    // Al eliminar un alumno, eliminar también sus inscripciones
}

export { extractInput, sanitizeInput, findAll, findOne, add, update, remove }