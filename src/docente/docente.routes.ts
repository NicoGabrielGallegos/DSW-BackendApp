import { Router } from "express";
import { add, findAll, findOne, update, remove, extractInput, sanitizeInput, findOneByCorreo, findAllByMateria } from "./docente.controller.js";
import { assureCompleteInput } from "../shared/controller.middlewares.js";

export const docenteRouter = Router()

// Rutas comunes
docenteRouter.get("/", findAll)
docenteRouter.get("/:id", findOne)
docenteRouter.post("/", extractInput, assureCompleteInput, sanitizeInput, add)
docenteRouter.put("/:id", extractInput, sanitizeInput, update)
docenteRouter.patch("/:id", extractInput, sanitizeInput, update)
docenteRouter.delete("/:id", remove)

// Rutas adicionales
docenteRouter.get("/byCorreo/:correo", findOneByCorreo)
docenteRouter.get("/byMateria/:materia", findAllByMateria)