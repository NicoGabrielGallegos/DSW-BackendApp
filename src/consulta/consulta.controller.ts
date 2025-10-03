import { Request, Response, NextFunction } from "express"
import { ConsultaRepository } from "./consulta.repository.js"
import { Consulta, EstadoConsulta } from "./consulta.entity.js"
import { ObjectId } from "mongodb"

const repository = new ConsultaRepository()

function sanitizeConsultaInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
        dictado: req.body.dictado,
        horaInicioStr: req.body.horaInicio,
        horaFinStr: req.body.horaFin,
        estado: req.body.estado,
    }
    
    const {dictado, horaInicioStr, horaFinStr, estado} = req.body.sanitizedInput

    // Verificar dictado
    // Chequear undefined solo con el método POST
    if (dictado !== undefined || req.method === "POST") {
        // Si es un id válido
        if (ObjectId.isValid(dictado))  {
            req.body.sanitizedInput.dictado = ObjectId.createFromHexString(dictado)
        } else {
            res.status(400).send({message: "El id de dictado ingresado no es válido"})
            return
        }
    }

    // Validar hora de inicio
    // Chequear undefined solo con el método POST
    if (horaInicioStr !== undefined || req.method === "POST") {
        // Si no es una fecha válida
        if (isNaN(Date.parse(horaInicioStr))) {
            res.status(400).send({message: "La hora de inicio ingresada no es válida"})
            return
        } else {
            const horaInicio = new Date(horaInicioStr)
            // Si la fecha es anterior a hoy
            if (horaInicio.getTime() - Date.now() < 0) {
                res.status(400).send({message: "La hora de inicio debe ser de un día posterior a hoy"})
                return
            } else {
                req.body.sanitizedInput.horaInicio = horaInicio
                delete req.body.sanitizedInput.horaInicioStr
            }
        }
    }

    // Validar hora de fin
    // Chequear undefined solo con el método POST
    if (horaFinStr !== undefined || req.method === "POST") {
        // Si no es una hora válida
        if (isNaN(Date.parse(horaFinStr))) {
            res.status(400).send({message: "La hora de fin ingresada no es válida"})
            return
        } else {
            const horaFin = new Date(horaFinStr)
            // Si la hora es hoy o anterior
            if (horaFin.getTime() - Date.now() < 0) {
                res.status(400).send({message: "La hora de fin debe ser de un día posterior a hoy"})
                return
            } else {
                req.body.sanitizedInput.horaFin = horaFin
                delete req.body.sanitizedInput.horaFinStr
            }
        }
    }

    // Verificar que el estado de la consulta sea
    // Chequear solo si no es undefined
    if (estado !== undefined) {
        // Si es un estado válido
        if (Object.values(EstadoConsulta).includes(estado)) {
            req.body.sanitizedInput.estado = estado
        } else {
            res.status(400).send({message: "El estado de la consulta no es válido"})
            return
        }
    // Si es undefined, asignar default solo con el método POST
    } else if (req.method === "POST") {
        req.body.sanitizedInput.estado = EstadoConsulta.Programada.toString()
    }

    // Eliminar keys sin valores asignados
    Object.keys(req.body.sanitizedInput).forEach(key => {
        if(req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]
        }
    })
    next()
}

async function findAll(_req: Request, res: Response) {
    res.json({data: await repository.findAll()})
}

async function findOne(req: Request, res: Response) {
    const consulta = await repository.findOne({id: req.params.id})
    if (!consulta) {
        res.status(404).send({message: "Consulta no encontrada"})
        return
    }
    res.json({data: consulta})
}

async function add(req: Request, res: Response) {
    const {dictado, horaInicio, horaFin, estado} = req.body.sanitizedInput

    if (horaInicio.getTime() + 900000 <= horaFin.getTime()) {
        const consultaInput = new Consulta(dictado, horaInicio, horaFin, estado)
        const consulta = await repository.add(consultaInput)
        res.status(201).send({message: "Consulta creada con éxito", data: consulta})
    } else {
        res.status(400).send({message: "La hora de fin de la consulta debe ser al menos 15 minutos posterior a la hora de inicio"})
    }
}

async function update(req: Request, res: Response) {
    const consultaRecuperada = await repository.findOne({id: req.params.id})
    if (!consultaRecuperada) {
        res.status(404).send({message: "Consulta no encontrada"})
        return
    }
    
    let nuevaHoraInicio = req.body.sanitizedInput.horaInicio ?? consultaRecuperada.horaInicio
    let nuevaHoraFin = req.body.sanitizedInput.horaFin ?? consultaRecuperada.horaFin

    if (nuevaHoraInicio.getTime() + 900000 <= nuevaHoraFin.getTime()) {
        const consulta = await repository.update({id: req.params.id}, req.body.sanitizedInput)
        if (!consulta) {
            res.status(404).send({message: "Consulta no encontrada"})
            return
        }
        res.status(201).send({message: "Consulta modificada con éxito", data: consulta})
    } else {
        res.status(400).send({message: "La hora de fin de la consulta debe ser al menos 15 minutos posterior a la hora de inicio"})
    }
}

async function remove(req: Request, res: Response) {
    const consulta = await repository.delete({id: req.params.id})
    if (!consulta) {
        res.status(404).send({message: "Consulta no encontrada"})
        return
    }
    res.status(200).send({message: "Consulta borrada con éxito", data: consulta})
}

export {sanitizeConsultaInput, findAll, findOne, add, update, remove}