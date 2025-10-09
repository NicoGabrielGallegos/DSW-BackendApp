import { Router } from "express";
import { add, findAll, findOne, update, remove, sanitizeInput, findAllByDictado, findAllInHorario, extractInput, findAllByDocente, findAllByDictadoInHorario, findAllByDocenteInHorario, findAllByMateriaInHorario, findAllByMateria } from "./consulta.controller.js";
import { assureCompleteInput } from "../shared/controller.middlewares.js";

export const consultaRouter = Router()

// Rutas comunes
consultaRouter.get("/", findAll)
consultaRouter.get("/:id", findOne)
consultaRouter.post("/", extractInput, assureCompleteInput, sanitizeInput, add)
consultaRouter.put("/:id", extractInput, sanitizeInput, update)
consultaRouter.patch("/:id", extractInput, sanitizeInput, update)
consultaRouter.delete("/:id", remove)

// Rutas adicionales
consultaRouter.get("/byDictado/:dictado", findAllByDictado)
consultaRouter.get("/byDocente/:docente", findAllByDocente)
consultaRouter.get("/byMateria/:materia", findAllByMateria)
consultaRouter.get("/inHorario/:horaInicio/:horaFin", findAllInHorario)
consultaRouter.get("/byDictado/:dictado/inHorario/:horaInicio/:horaFin", findAllByDictadoInHorario)
consultaRouter.get("/byDocente/:docente/inHorario/:horaInicio/:horaFin", findAllByDocenteInHorario)
consultaRouter.get("/byMateria/:materia/inHorario/:horaInicio/:horaFin", findAllByMateriaInHorario)