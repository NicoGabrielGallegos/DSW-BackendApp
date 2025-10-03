import { Router } from "express";
import { add, findAll, findOne, update, remove, sanitizeDictadoInput } from "./dictado.controller.js";

export const dictadoRouter = Router()

dictadoRouter.get("/", findAll)
dictadoRouter.get("/:id", findOne)
dictadoRouter.post("/", sanitizeDictadoInput, add)
dictadoRouter.put("/:id", sanitizeDictadoInput, update)
dictadoRouter.patch("/:id", sanitizeDictadoInput, update)
dictadoRouter.delete("/:id", remove)