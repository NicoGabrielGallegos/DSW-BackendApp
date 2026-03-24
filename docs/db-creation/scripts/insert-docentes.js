const bcryptjs = require("bcryptjs")

db = connect("mongodb://127.0.0.1:27017/dswapp")

const docentes = [
    { nombre: "Adrián", apellido: "Meca" },
    { nombre: "Diana", apellido: "Martínez" },
]

async function insertDocentes() {
    const promesas = docentes.map(async (docente, idx) => {
        let legajo = `${61001 + idx}`
        return {
            legajo,
            nombre: docente.nombre,
            apellido: docente.apellido,
            correo: `${docente.nombre[0]}${docente.apellido}@gmail.com`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
            password: await bcryptjs.hash(`${docente.nombre[0]}${docente.apellido[0]}${legajo}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""), 10)
        }
    })

    const docentesProcesados = await Promise.all(promesas)

    db.docentes.insertMany(docentesProcesados)
}

insertDocentes()
