import { Router } from "express";
import { add, findAll, findOne, update, remove, sanitizeDocenteInput } from "./docente.controller.js";

export const docenteRouter = Router()

docenteRouter.get("/", findAll)
docenteRouter.get("/:id", findOne)
docenteRouter.post("/", sanitizeDocenteInput, add)
docenteRouter.put("/:id", sanitizeDocenteInput, update)
docenteRouter.patch("/:id", sanitizeDocenteInput, update)
docenteRouter.delete("/:id", remove)