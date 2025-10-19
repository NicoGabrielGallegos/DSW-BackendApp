import { Router } from "express";
import { add, findAll, findOne, update, remove, extractInput, sanitizeInput, findAllByAlumno, findAllByConsulta } from "./inscripcion.controller.js";
import { assureCompleteInput } from "../shared/controller.middlewares.js";

export const inscripcionRouter = Router()

// Rutas comunes
inscripcionRouter.get("/", findAll)
inscripcionRouter.get("/:id", findOne)
inscripcionRouter.post("/", extractInput, assureCompleteInput, sanitizeInput, add)
inscripcionRouter.put("/:id", extractInput, sanitizeInput, update)
inscripcionRouter.patch("/:id", extractInput, sanitizeInput, update)
inscripcionRouter.delete("/:id", remove)

// Rutas adicionales
inscripcionRouter.get("/byAlumno/:alumno", findAllByAlumno)
inscripcionRouter.get("/byConsulta/:consulta", findAllByConsulta)
