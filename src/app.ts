import express from "express"
import { alumnoRouter } from "./alumno/alumno.routes.js"
import { docenteRouter } from "./docente/docente.routes.js"
import { materiaRouter } from "./materia/materia.routes.js"
import { dictadoRouter } from "./dictado/dictado.routes.js"

// Crear aplicación Express
const app = express()

// Middleware para escuchar únicamente peticiones donde el header 'Content-Type' sea de tipo 'application/json'
app.use(express.json())

// Router hacia los recursos
app.use("/api/alumnos", alumnoRouter)
app.use("/api/docentes", docenteRouter)
app.use("/api/materias", materiaRouter)
app.use("/api/dictados", dictadoRouter)

// Middleware para el manejo de peticiones a recursos no válidos
app.use((_req, res) => {
    res.status(404).send({message: "Recurso no encontrado"})
})

// Levantar API
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000/")
})