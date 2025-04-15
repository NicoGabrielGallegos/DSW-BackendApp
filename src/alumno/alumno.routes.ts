import { Router } from "express";
import { add, findAll, findOne, remove, sanitizeAlumnoInput, update } from "./alumno.controller.js";

export const alumnoRouter = Router()

alumnoRouter.get("/", findAll)
alumnoRouter.get("/:legajoAlumno", findOne)
alumnoRouter.post("/", sanitizeAlumnoInput, add)
alumnoRouter.put("/:legajoAlumno", sanitizeAlumnoInput, update)
alumnoRouter.patch("/:legajoAlumno", sanitizeAlumnoInput, update)
alumnoRouter.delete("/:legajoAlumno", remove)