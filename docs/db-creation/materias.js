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