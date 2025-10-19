import { Request, Response, NextFunction } from "express"
import { ConsultaRepository } from "./consulta.repository.js"
import { Consulta, EstadoConsulta } from "./consulta.entity.js"
import { ObjectId } from "mongodb"
import { DictadoRepository } from "../dictado/dictado.repository.js"
import { getPopulateParams, getSanitizedDateTimeRangeParams, getSanitizedPaginationParams } from "../shared/controller.js"
import { DateFilter } from "../shared/types/DateFilter.js"

const consultaRepository = new ConsultaRepository()
const dictadoRepository = new DictadoRepository()

function extractInput(req: Request, res: Response, next: NextFunction) {
    req.body.input = {
        dictado: req.body.dictado,
        horaInicio: req.body.horaInicio,
        horaFin: req.body.horaFin,
        estado: req.body.estado,
    }
    next()
}

async function sanitizeInput(req: Request, res: Response, next: NextFunction) {
    const { dictado, horaInicio, horaFin, estado } = req.body.input
    req.body.sanitizedInput = {}

    // Verificar dictado
    // No chequear para undefined
    if (dictado !== undefined) {
        // Si el id no es válido
        if (!ObjectId.isValid(dictado)) {
            res.status(400).send({ message: "El id de dictado ingresado no es válido" })
            return
        }
        // Si no existe un dictado con el id ingresado
        const dictadoRecuperado = await dictadoRepository.findOne({ id: dictado })
        if (!(dictadoRecuperado)) {
            res.status(404).send({ message: `Dictado con id '${dictado}' no encontrado` })
            return
        }
        req.body.sanitizedInput.dictado = ObjectId.createFromHexString(dictado)
        // Guardar el docente para realizar una validación luego
        req.body.additionalInfo = { docente: dictadoRecuperado.docente }
    }

    // Validar hora de inicio
    // No chequear para undefined
    if (horaInicio !== undefined) {
        // Si no es una fecha válida
        if (isNaN(Date.parse(horaInicio))) {
            res.status(400).send({ message: "La hora de inicio ingresada no es válida" })
            return
        }
        const horaInicioDate = new Date(horaInicio)
        // Si la fecha es anterior a hoy
        if (horaInicioDate.getTime() - Date.now() < 0) {
            res.status(400).send({ message: "La hora de inicio debe ser de un día posterior a hoy" })
            return
        }
        req.body.sanitizedInput.horaInicio = horaInicioDate
    }

    // Validar hora de fin
    // No chequear para undefined
    if (horaFin !== undefined) {
        // Si no es una hora válida
        if (isNaN(Date.parse(horaFin))) {
            res.status(400).send({ message: "La hora de fin ingresada no es válida" })
            return
        }
        const horaFinDate = new Date(horaFin)
        // Si la hora es hoy o anterior
        if (horaFinDate.getTime() - Date.now() < 0) {
            res.status(400).send({ message: "La hora de fin debe ser de un día posterior a hoy" })
            return
        }
        req.body.sanitizedInput.horaFin = horaFinDate
    }

    // Verificar que el estado de la consulta sea válido
    // Chequear solo si no es undefined
    if (estado !== undefined) {
        // Si no es un estado válido
        if (!Object.values(EstadoConsulta).includes(estado)) {
            res.status(400).send({ message: "El estado de la consulta no es válido" })
            return
        }
        req.body.sanitizedInput.estado = estado
        // Si es undefined, asignar default solo con el método POST
    } else if (req.method === "POST") {
        req.body.sanitizedInput.estado = EstadoConsulta.Programada.toString()
    }

    delete req.body.input
    // Eliminar keys sin valores asignados
    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]
        }
    })
    next()
}

function handleError(res: Response, err: any) {
    switch (err.code) {
        case 11000: // DuplicateKey
            const key = Object.keys(err.errorResponse.keyValue)[0]
            const value = Object.values(err.errorResponse.keyValue)[0]
            res.status(400).send({ message: `La operación no se pudo completar, '${key}: ${value}' ya existe` })
            return
        case 121: // DocumentValidationFailure
            let error_message = "Ocurrió un problema al intentar validar las siguiente propiedades: "

            // Si se agregan más validaciones al esquema, esta validación sería necesaria
            // let detalles = err.errorResponse.errInfo.details
            // if (detalles.operatorName === "$jsonSchema" && detalles.schemaRulesNotSatisfied[0] === "operatorName")

            err.errorResponse.errInfo.details.schemaRulesNotSatisfied[0].propertiesNotSatisfied.forEach((property: { propertyName: string }) => {
                error_message += `${property.propertyName}, `
            });
            res.status(400).send({ message: error_message.slice(0, -2) })
            break
        default:
            res.status(400).send({ message: err })
            return
    }
}

// ----- Operaciones CRUD comunes -----

async function findAll(req: Request, res: Response) {
    const { page, limit } = getSanitizedPaginationParams(req)
    const { horaInicio, horaFin } = getSanitizedDateTimeRangeParams(req)
    const { populate } = getPopulateParams(req)

    const filter: { horaInicio?: DateFilter, horaFin?: DateFilter } = {}
    if (horaInicio !== "") filter.horaInicio = { $gte: new Date(horaInicio) }
    if (horaFin !== "") filter.horaFin = { $lte: new Date(horaFin) }

    const consultas = await consultaRepository.findAllByFilter(filter, { page, limit, populate })
    const total = await consultaRepository.countByFilter(filter)
    res.json({ data: consultas, total, page, limit })
}

async function findOne(req: Request, res: Response) {
    const { populate } = getPopulateParams(req)
    const consulta = await consultaRepository.findOne({ id: req.params.id }, { populate })
    if (!consulta) {
        res.status(404).send({ message: "Consulta no encontrada" })
        return
    }
    res.json({ data: consulta })
}

async function add(req: Request, res: Response) {
    const { dictado, horaInicio, horaFin, estado } = req.body.sanitizedInput
    const { docente } = req.body.additionalInfo

    // Asegurar que la consulta no se superponga a otra del mismo docente
    if ((await consultaRepository.findAllByDocente({ docente, horaInicio: { $lt: horaFin }, horaFin: { $gt: horaInicio } })).length !== 0) {
        res.status(400).send({ message: "Ya existe una consulta para el docente de este dictado que se superpone con el rango de horario dado" })
        return
    }

    // Asegurar una duración mínima de 15 minutos
    if (horaInicio.getTime() + 900000 > horaFin.getTime()) {
        res.status(400).send({ message: "La hora de fin de la consulta debe ser al menos 15 minutos posterior a la hora de inicio" })
        return
    }

    const consultaInput = new Consulta(dictado, horaInicio, horaFin, estado)
    try {
        const { populate } = getPopulateParams(req)
        const consulta = await consultaRepository.add(consultaInput, { populate })
        res.status(201).send({ message: "Consulta creada con éxito", data: consulta })
    } catch (err: any) {
        handleError(res, err)
    }
}


async function update(req: Request, res: Response) {
    const consultaRecuperada = await consultaRepository.findOne({ id: req.params.id })
    if (!consultaRecuperada) {
        res.status(404).send({ message: "Consulta no encontrada" })
        return
    }

    let nuevaHoraInicio = req.body.sanitizedInput.horaInicio ?? consultaRecuperada.horaInicio
    let nuevaHoraFin = req.body.sanitizedInput.horaFin ?? consultaRecuperada.horaFin
    const { docente } = req.body.additionalInfo

    // Asegurar que la consulta no se superponga a otra del mismo docente
    if ((await consultaRepository.findAllByDocente({ docente, horaInicio: { $lt: nuevaHoraFin }, horaFin: { $gt: nuevaHoraInicio } })).length !== 0) {
        res.status(400).send({ message: "Ya existe una consulta para el docente de este dictado que se superpone con el rango de horario dado" })
        return
    }

    // Asegurar una duración mínima de 15 minutos
    if (nuevaHoraInicio.getTime() + 900000 > nuevaHoraFin.getTime()) {
        res.status(400).send({ message: "La hora de fin de la consulta debe ser al menos 15 minutos posterior a la hora de inicio" })
        return
    }

    try {
        const { populate } = getPopulateParams(req)
        const consulta = await consultaRepository.update({ id: req.params.id }, req.body.sanitizedInput, { populate })
        if (!consulta) {
            res.status(404).send({ message: "Consulta no encontrada" })
            return
        }
        res.status(201).send({ message: "Consulta modificada con éxito", data: consulta })
    } catch (err: any) {
        handleError(res, err)
    }
}

async function remove(req: Request, res: Response) {
    const { populate } = getPopulateParams(req)
    const consulta = await consultaRepository.delete({ id: req.params.id }, { populate })
    if (!consulta) {
        res.status(404).send({ message: "Consulta no encontrada" })
        return
    }
    res.status(200).send({ message: "Consulta borrada con éxito", data: consulta })
}

// ----- Operaciones específicas -----

async function findAllByDictado(req: Request, res: Response) {
    let dictado = req.params.dictado
    if (!ObjectId.isValid(dictado)) {
        res.status(400).send({ message: "El id de dictado ingresado no es válido" })
        return
    }

    const { page, limit } = getSanitizedPaginationParams(req)
    const { horaInicio, horaFin } = getSanitizedDateTimeRangeParams(req)
    const { populate } = getPopulateParams(req)

    const filter: { dictado: ObjectId, horaInicio?: DateFilter, horaFin?: DateFilter } = { dictado: new ObjectId(dictado) }
    if (horaInicio !== "") filter.horaInicio = { $gte: new Date(horaInicio) }
    if (horaFin !== "") filter.horaFin = { $lte: new Date(horaFin) }

    const consultas = await consultaRepository.findAllByFilter(filter, { page, limit, populate })
    const total = await consultaRepository.countByFilter(filter)
    res.json({ data: consultas, total, page, limit })
}

async function findAllByDocente(req: Request, res: Response) {
    let docente = req.params.docente
    if (!ObjectId.isValid(docente)) {
        res.status(400).send({ message: "El id de docente ingresado no es válido" })
        return
    }

    const { page, limit } = getSanitizedPaginationParams(req)
    const { horaInicio, horaFin } = getSanitizedDateTimeRangeParams(req)
    const { populate } = getPopulateParams(req)

    const filter: { docente: ObjectId, horaInicio?: DateFilter, horaFin?: DateFilter } = { docente: new ObjectId(docente) }
    if (horaInicio !== "") filter.horaInicio = { $gte: new Date(horaInicio) }
    if (horaFin !== "") filter.horaFin = { $lte: new Date(horaFin) }

    const consultas = await consultaRepository.findAllByDocente(filter, { page, limit, populate })
    const total = await consultaRepository.countByDocente(filter)
    res.json({ data: consultas, total, page, limit })
}

async function findAllByMateria(req: Request, res: Response) {
    let materia = req.params.materia
    if (!ObjectId.isValid(materia)) {
        res.status(400).send({ message: "El id de materia ingresado no es válido" })
        return
    }

    const { page, limit } = getSanitizedPaginationParams(req)
    const { horaInicio, horaFin } = getSanitizedDateTimeRangeParams(req)
    const { populate } = getPopulateParams(req)

    const filter: { materia: ObjectId, horaInicio?: DateFilter, horaFin?: DateFilter } = { materia: new ObjectId(materia) }
    if (horaInicio !== "") filter.horaInicio = { $gte: new Date(horaInicio) }
    if (horaFin !== "") filter.horaFin = { $lte: new Date(horaFin) }

    const consultas = await consultaRepository.findAllByMateria(filter, { page, limit, populate })
    const total = await consultaRepository.countByMateria(filter)
    res.json({ data: consultas, total, page, limit })
}

export { extractInput, sanitizeInput, findAll, findOne, add, update, remove, findAllByDictado, findAllByDocente, findAllByMateria }