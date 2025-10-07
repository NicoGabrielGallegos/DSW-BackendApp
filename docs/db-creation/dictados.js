// Crear colección
db.createCollection("dictados", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Schema para validar Dictados",
            required: ["docente", "materia"],
            properties: {
                docente: { bsonType: "objectId" },
                materia: { bsonType: "objectId" },
            }
        }
    }
})

// Definir campos únicos
db.dictados.createIndex({ docente: 1, materia: 1 }, { unique: true })

// Agregar schema validator si la colección ya está creada
db.runCommand({
    collMod: "dictados",
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Schema para validar Dictados",
            required: ["docente", "materia"],
            properties: {
                docente: { bsonType: "objectId" },
                materia: { bsonType: "objectId" },
            }
        }
    }
})