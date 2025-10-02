import { Router } from "express";
import { add, findAll, findOne, update, remove, sanitizeMateriaInput } from "./materia.controller.js";

export const materiaRouter = Router()

materiaRouter.get("/", findAll)
materiaRouter.get("/:id", findOne)
materiaRouter.post("/", sanitizeMateriaInput, add)
materiaRouter.put("/:id", sanitizeMateriaInput, update)
materiaRouter.patch("/:id", sanitizeMateriaInput, update)
materiaRouter.delete("/:id", remove)