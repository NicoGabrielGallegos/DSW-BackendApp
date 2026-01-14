import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { isValidEmail } from "../validations.js"
import { AlumnoRepository } from "../../alumno/alumno.repository.js"
import { DocenteRepository } from "../../docente/docente.repository.js"
import { AdministradorRepository } from "../../administrador/administrador.repository.js"
import { compare, hash } from "bcryptjs"
import { Alumno } from "../../alumno/alumno.entity.js"
import { Docente } from "../../docente/docente.entity.js"
import { Administrador } from "../../administrador/administrador.entity.js"

export const PRIVATE_KEY = "private_key"

const alumnoRepository = new AlumnoRepository()
const docenteRepository = new DocenteRepository()
const administradorRepository = new AdministradorRepository()

export enum Rol {
    Alumno = "alumno",
    Docente = "docente",
    Administrador = "administrador",
}

function auth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        res.status(401).send({ message: "No autorizado" })
        return
    }

    const token = authHeader.split(" ")[1]
    try {
        jwt.verify(token, PRIVATE_KEY)
        next()
    } catch (err) {
        res.status(401).send({ message: "Token inválido" })
    }
}

function extractInputLogin(req: Request, res: Response, next: NextFunction) {
    req.body.input = {
        correo: req.body.correo,
        password: req.body.password
    }

    // Verificar que el correo sea válido
    if (!isValidEmail(req.body.input.correo)) {
        res.status(400).send({ message: "Correo o contraseña incorrectos" })
        return
    }

    next()
}

async function loginAlumno(req: Request, res: Response) {
    const { correo, password } = req.body.input

    // Verificar que exista un alumno con ese correo
    const alumno = await alumnoRepository.findOneByFilter({ correo })
    if (!alumno) {
        res.status(400).json({ message: "Correo o contraseña incorrectos" })
        return
    }

    // Verificar que la contraseña sea correcta
    const passwordMatch = await compare(password, alumno.password)
    if (!passwordMatch) {
        res.status(400).json({ message: "Correo o contraseña incorrectos" })
        return
    }

    const payload = {
        id: alumno._id as ObjectId,
        legajo: alumno.legajo,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        correo: alumno.correo,
        rol: Rol.Alumno
    }

    const token = jwt.sign({ user: payload }, PRIVATE_KEY, { expiresIn: "1h" })

    res.json({ data: token })
}

async function loginDocente(req: Request, res: Response) {
    const { correo, password } = req.body.input

    // Verificar que exista un docente con ese correo
    const docente = await docenteRepository.findOneByFilter({ correo })
    if (!docente) {
        res.status(400).json({ message: "Correo o contraseña incorrectos" })
        return
    }

    // Verificar que la contraseña sea correcta
    const passwordMatch = await compare(password, docente.password)
    if (!passwordMatch) {
        res.status(400).json({ message: "Correo o contraseña incorrectos" })
        return
    }

    const payload = {
        id: docente._id as ObjectId,
        legajo: docente.legajo,
        nombre: docente.nombre,
        apellido: docente.apellido,
        correo: docente.correo,
        rol: Rol.Docente
    }

    const token = jwt.sign({ user: payload }, PRIVATE_KEY, { expiresIn: "1h" })

    res.json({ data: token })
}

async function loginAdministrador(req: Request, res: Response) {
    const { correo, password } = req.body.input

    // Verificar que exista un docente con ese correo
    const administrador = await administradorRepository.findOneByFilter({ correo })
    if (!administrador) {
        res.status(400).json({ message: "Correo o contraseña incorrectos" })
        return
    }

    // Verificar que la contraseña sea correcta
    const passwordMatch = await compare(password, administrador.password)
    if (!passwordMatch) {
        res.status(400).json({ message: "Correo o contraseña incorrectos" })
        return
    }

    const payload = {
        id: administrador._id as ObjectId,
        nombre: administrador.nombre,
        apellido: administrador.apellido,
        correo: administrador.correo,
        permisos: administrador.permisos,
        rol: Rol.Administrador
    }

    const token = jwt.sign({ user: payload }, PRIVATE_KEY, { expiresIn: "1h" })

    res.json({ data: token })
}

function extractInputChangePassword(req: Request, res: Response, next: NextFunction) {
    req.body.input = {
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword
    }

    // Verificar que se ingresen tanto la contraseña actual como la contraseña nueva
    if (!req.body.input.currentPassword || !req.body.input.newPassword) {
        res.status(400).send({ message: "Entrada de datos incompleta " })
        return
    }

    const authHeader = req.headers.authorization
    if (!authHeader) {
        res.status(401).send({ message: "No autorizado" })
        return
    }

    const token = authHeader.split(" ")[1]
    try {
        const decoded = jwt.verify(token, PRIVATE_KEY)
        req.body.decodedPayload = decoded
        next()
    } catch (err) {
        res.status(401).send({ message: "Token inválido" })
    }
}

async function changePassword(req: Request, res: Response) {
    const { id, rol }: { id: ObjectId, rol: Rol } = req.body.decodedPayload.user
    const { currentPassword, newPassword }: { currentPassword: string, newPassword: string } = req.body.input

    let user: { password: string } | undefined
    //Alumno | Docente | Administrador | undefined

    switch (rol) {
        case Rol.Alumno:
            user = await alumnoRepository.findOne({ id: id.toString() })
            break;
        case Rol.Docente:
            user = await docenteRepository.findOne({ id: id.toString() })
            break;
        case Rol.Administrador:
            user = await administradorRepository.findOne({ id: id.toString() })
            break;
    }

    if (!user) {
        res.status(404).json({ message: "Usuario no encontrado" })
        return
    }

    const isMatch = await compare(currentPassword, user.password)
    if (!isMatch) {
        res.status(401).json({ message: "Contraseña actual incorrecta" })
        return
    }

    if (currentPassword === newPassword) {
        res.status(401).json({ message: "La nueva contraseña debe ser diferente a la contraseña actual"})
        return
    }

    const password = await hash(newPassword, 10)

    switch (rol) {
        case Rol.Alumno:
            user = await alumnoRepository.update({ id: id.toString() }, { password } as Alumno)
            break;
        case Rol.Docente:
            user = await docenteRepository.update({ id: id.toString() }, { password } as Docente)
            break;
        case Rol.Administrador:
            user = await administradorRepository.update({ id: id.toString() }, { password } as Administrador)
            break;
    }

    if (!user) {
        res.status(404).send({ message: "Usuario no encontrado" })
        return
    }
    res.status(201).send({ message: "Contraseña modificada con éxito", data: user })
}

export { auth, extractInputLogin, loginAlumno, loginDocente, loginAdministrador, extractInputChangePassword, changePassword }