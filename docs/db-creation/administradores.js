// Crear colección
db.createCollection("administradores", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Schema para validar Administradores",
            required: ["nombre", "apellido", "correo", "password"],
            properties: {
                nombre: { bsonType: "string", description: "'nombre' debe ser string y es obligatorio" },
                apellido: { bsonType: "string", description: "'apellido' debe ser string y es obligatorio" },
                correo: { bsonType: "string", description: "'correo' debe ser string y es obligatorio" },
                permisos: { bsonType: "array", items: { bsonType: "int" }, description: "'permisos' debe ser int[] y es obligatorio" },
                password: { bsonType: "string", description: "'password' debe ser string y es obligatorio" },
            }
        }
    }
})

// Definir campos únicos
db.administradores.createIndex({ correo: 1 }, { unique: true })

// Agregar schema validator si la colección ya está creada
db.runCommand({
    collMod: "administradores",
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Schema para validar Administradores",
            required: ["nombre", "apellido", "correo", "password"],
            properties: {
                nombre: { bsonType: "string", description: "'nombre' debe ser string y es obligatorio" },
                apellido: { bsonType: "string", description: "'apellido' debe ser string y es obligatorio" },
                correo: { bsonType: "string", description: "'correo' debe ser string y es obligatorio" },
                permisos: { bsonType: "array", items: { bsonType: "int" }, description: "'permisos' debe ser int[] y es obligatorio" },
                password: { bsonType: "string", description: "'password' debe ser string y es obligatorio" },
            }
        }
    }
})

// Administrador
db.administradores.insertOne({ nombre: "Admin", apellido: "Istrador", correo: "admin@gmail.com", permisos: [1, 2, 3, 4, 5, 6], password: "asd123" })