import { Router } from "express";
import { changePassword, extractInputChangePassword, extractInputLogin, loginAdministrador, loginAlumno, loginDocente } from "./auth.controller.js";

export const authRouter = Router()

authRouter.post("/alumno", extractInputLogin, loginAlumno)
authRouter.post("/docente", extractInputLogin, loginDocente)
authRouter.post("/administrador", extractInputLogin, loginAdministrador)
authRouter.post("/cambiarPassword", extractInputChangePassword, changePassword)