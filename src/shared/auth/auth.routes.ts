import { Router } from "express";
import { extractInput, loginAdministrador, loginAlumno, loginDocente } from "./auth.controller.js";

export const authRouter = Router()

authRouter.post("/alumno", extractInput, loginAlumno)
authRouter.post("/docente", extractInput, loginDocente)
authRouter.post("/administrador", extractInput, loginAdministrador)