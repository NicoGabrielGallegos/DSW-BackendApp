import { Router } from "express";
import { add, findAll, findOne, update, remove, extractInput, assureCompleteInput, sanitizeInput } from "./docente.controller.js";

export const docenteRouter = Router()

docenteRouter.get("/", findAll)
docenteRouter.get("/:id", findOne)
docenteRouter.post("/", extractInput, assureCompleteInput, sanitizeInput, add)
docenteRouter.put("/:id", extractInput, sanitizeInput, update)
docenteRouter.patch("/:id", extractInput, sanitizeInput, update)
docenteRouter.delete("/:id", remove)