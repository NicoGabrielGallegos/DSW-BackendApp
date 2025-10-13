// Crear colección
db.createCollection("materias", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Schema para validar Materias",
            required: ["descripcion"],
            properties: {
                descripcion: { bsonType: "string", description: "'descripcion' debe ser string y es obligatorio" },
            }
        }
    }
})

// Definir campos únicos
db.materias.createIndex({ descripcion: 1 }, { unique: true })

// Agregar schema validator si la colección ya está creada
db.runCommand({
    collMod: "materias",
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Schema para validar Materias",
            required: ["descripcion"],
            properties: {
                descripcion: { bsonType: "string", description: "'descripcion' debe ser string y es obligatorio" },
            }
        }
    }
})

// Materias
let materias = [
    "Análisis Matemático I", "Álgebra y Geometría Analítica", "Física I", "Inglés I", "Lógica y Estructuras Discretas", "Algoritmos y Estructuras de Datos", "Arquitectura de las Computadoras", "Sistemas y Procesos de Negocio",
    "Análisis Matemático II", "Física II", "Ingeniería y Sociedad", "Inglés II", "Sintaxis y Semántica de los Lenguajes", "Paradigmas de Programación", "Sistemas Operativos", "Análisis de Sistemas de Información",
    "Probabilidad y Estadística", "Economía", "Bases de Datos", "Desarrollo de Software", "Comunicación de Datos", "Análisis Numérico", "Diseño de Sistemas de Información",
    "Legislación", "Ingeniería y Calidad de Software", "Redes de Datos", "Investigación Operativa", "Simulación", "Tecnologías para la Automatización", "Administración de Sistemas de Información",
    "Inteligencia Artificial", "Ciencia de Datos", "Sistemas de Gestión", "Gestión Gerencial", "Seguridad en los Sistemas Informáticos", "Proyecto Final"
]

let materiasElectivas = [
    "Seminario Integrador"
]

materias.forEach()