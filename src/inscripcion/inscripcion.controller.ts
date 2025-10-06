import { Request, Response, NextFunction } from "express"
import { InscripcionRepository } from "./inscripcion.repository.js"
import { Inscripcion } from "./inscripcion.entity.js"
import { ObjectId } from "mongodb"
import { AlumnoRepository } from "../alumno/alumno.repository.js"
import { ConsultaRepository } from "../consulta/consulta.repository.js"
import { EstadoConsulta } from "../consulta/consulta.entity.js"

const inscripcionRepository = new InscripcionRepository()
const alumnoRepository = new AlumnoRepository()
const consultaRepository = new ConsultaRepository()

function extractInput(req: Request, res: Response, next: NextFunction) {
    req.body.input = {
        alumno: req.body.alumno,
        consulta: req.body.consulta,
    }
    next()
}

async function sanitizeInput(req: Request, res: Response, next: NextFunction) {
    const {alumno, consulta} = req.body.input
    req.body.sanitizedInput = {}

    // Verificar alumno
    // No chequear para undefined
    if (alumno !== undefined) {
        // Si el id no es válido
        if (!ObjectId.isValid(alumno)) {
            res.status(400).send({ message: "El id de alumno ingresado no es válido" })
            return
        }
        // Si no existe un alumno con la id ingresada
        if (!(await alumnoRepository.findOne({ id: alumno }))) {
            res.status(404).send({ message: "Alumno con id '" + alumno + "' no encontrado"})
            return
        }
        // Sino, el alumno es válido
        req.body.sanitizedInput.alumno = ObjectId.createFromHexString(alumno)
    }

    // Verificar consulta
    // No chequear para undefined
    if (consulta !== undefined) {
        // Si el id no es válido
        if (!ObjectId.isValid(consulta)) {
            res.status(400).send({ message: "El id de consulta ingresado no es válido" })
            return
        }
        // Si no existe una consulta con la id ingresada
        const consultaRecuperada = await consultaRepository.findOne({ id: consulta })
        if (!consultaRecuperada) {
            res.status(404).send({ message: "Consulta con id '" + consulta + "' no encontrada"})
            return
        }
        // Si se está creando la inscripción, pero la consulta ya finalizó o fue cancelada
        if (req.method == "POST" && consultaRecuperada.estado !== EstadoConsulta.Programada) {
            res.status(400).send({ message: "La consulta ingresada ya finalizó o fue cancelada" })
        }
        // Sino, la consulta es válida
        req.body.sanitizedInput.consulta = ObjectId.createFromHexString(consulta)
    }

    // TODO:
    // Que un alumno no pueda inscribirse a dos consultas con horarios superpuestos

    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]
        }
    })
    next()
}

async function findAll(_req: Request, res: Response) {
    res.json({ data: await inscripcionRepository.findAll() })
}

async function findOne(req: Request, res: Response) {
    const inscripcion = await inscripcionRepository.findOne({ id: req.params.id })
    if (!inscripcion) {
        res.status(404).send({ message: "Inscripcion no encontrado" })
        return
    }
    res.json({ data: inscripcion })
}

async function add(req: Request, res: Response) {
    const { alumno, consulta } = req.body.sanitizedInput
    const inscripcionInput = new Inscripcion(alumno, consulta)
    const inscripcion = await inscripcionRepository.add(inscripcionInput)
    res.status(201).send({ message: "Inscripcion creado con éxito", data: inscripcion })
}

async function update(req: Request, res: Response) {
    const inscripcion = await inscripcionRepository.update({ id: req.params.id }, req.body.sanitizedInput)
    if (!inscripcion) {
        res.status(404).send({ message: "Inscripcion no encontrado" })
        return
    }
    res.status(201).send({ message: "Inscripcion modificado con éxito", data: inscripcion })
}

async function remove(req: Request, res: Response) {
    const inscripcion = await inscripcionRepository.delete({ id: req.params.id })
    if (!inscripcion) {
        res.status(404).send({ message: "Inscripcion no encontrado" })
        return
    }
    res.status(200).send({ message: "Inscripcion borrado con éxito", data: inscripcion })
}

export { extractInput, sanitizeInput, findAll, findOne, add, update, remove }