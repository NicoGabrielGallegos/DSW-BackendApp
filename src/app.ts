import express from "express"
import { alumnoRouter } from "./alumno/alumno.routes.js"
import { docenteRouter } from "./docente/docente.routes.js"
import { materiaRouter } from "./materia/materia.routes.js"
import { dictadoRouter } from "./dictado/dictado.routes.js"
import { consultaRouter } from "./consulta/consulta.routes.js"
import { inscripcionRouter } from "./inscripcion/inscripcion.routes.js"
import { administradorRouter } from "./administrador/administrador.routes.js"
import { authRouter } from "./shared/auth/auth.routes.js"
import cors from "cors"
import { auth } from "./shared/auth/auth.controller.js"


// Crear aplicación Express
const app = express()

// Permitir solicitudes desde el Frontend
app.use(cors({
    origin: "http://localhost:5173"
}))

// Middleware para escuchar únicamente peticiones donde el header 'Content-Type' sea de tipo 'application/json'
app.use(express.json())

// Router hacia los recursos
app.use("/api/alumnos", auth, alumnoRouter)
app.use("/api/docentes", auth, docenteRouter)
app.use("/api/materias", auth, materiaRouter)
app.use("/api/dictados", auth, dictadoRouter)
app.use("/api/consultas", auth, consultaRouter)
app.use("/api/inscripciones", auth, inscripcionRouter)
app.use("/api/administradores", auth, administradorRouter)
app.use("/api/auth", authRouter)

// Middleware para el manejo de peticiones a recursos no válidos
app.use((_req, res) => {
    res.status(404).send({message: "Recurso no encontrado"})
})

// Levantar API
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000/")
})