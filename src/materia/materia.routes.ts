import { Router } from "express";
import { add, findAll, findOne, update, remove, extractInput, sanitizeInput, findOneByDescripcion, findAllByDocente } from "./materia.controller.js";
import { assureCompleteInput } from "../shared/controller.js";

export const materiaRouter = Router()

// Rutas comunes
materiaRouter.get("/", findAll)
materiaRouter.get("/:id", findOne)
materiaRouter.post("/", extractInput, assureCompleteInput, sanitizeInput, add)
materiaRouter.put("/:id", extractInput, sanitizeInput, update)
materiaRouter.patch("/:id", extractInput, sanitizeInput, update)
materiaRouter.delete("/:id", remove)

// Rutas adicionales
materiaRouter.get("/byDescripcion/:descripcion", findOneByDescripcion)
materiaRouter.get("/byDocente/:docente", findAllByDocente)