import { Request, Response, NextFunction } from "express"
import { AlumnoRepository } from "./alumno.repository.js"
import { Alumno } from "./alumno.entity.js"

const repository = new AlumnoRepository()

function sanitizeAlumnoInput(req: Request, _res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        correo: req.body.correo
    }
    // TODO checks

    Object.keys(req.body.sanitizedInput).forEach(key => {
        if(req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]
        }
    })
    next()
}

function findAll(_req: Request, res: Response) {
    res.json({data: repository.findAll()})
}

function findOne(req: Request, res: Response) {
    const alumno = repository.findOne({id: req.params.legajoAlumno})
    if (!alumno) {
        res.status(404).send({message: "Alumno no encontrado"})
        return
    }
    res.json({data: alumno})
}

function add(req: Request, res: Response) {
    const {nombre, apellido, correo} = req.body.sanitizedInput
    const alumnoInput = new Alumno(nombre, apellido, correo)
    const alumno = repository.add(alumnoInput)
    res.status(201).send({message: "Alumno creado con éxito", data: alumno})
}

function update(req: Request, res: Response) {
    req.body.sanitizedInput.legajoAlumno = req.params.legajoAlumno
    const alumno = repository.update(req.body.sanitizedInput)
    if (!alumno) {
        res.status(404).send({message: "Alumno no encontrado"})
        return
    }
    res.status(201).send({message: "Alumno modificado con éxito", data: alumno})
}

function remove(req: Request, res: Response) {
    const alumno = repository.delete({id: req.params.legajoAlumno})
    if (!alumno) {
        res.status(404).send({message: "Alumno no encontrado"})
        return
    }
    res.status(200).send({message: "Alumno borrado con éxito", data: alumno})
}

export {sanitizeAlumnoInput, findAll, findOne, add, update, remove}