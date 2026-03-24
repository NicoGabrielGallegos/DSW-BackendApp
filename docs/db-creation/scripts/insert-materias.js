db = connect("mongodb://127.0.0.1:27017/dswapp")

db.materias.insertMany([
    { descripcion: "Análisis Matemático I" },
    { descripcion: "Álgebra y Geometría Analítica" },
    { descripcion: "Física I" },
    { descripcion: "Inglés I" },
    { descripcion: "Lógica y Estructuras Discretas" },
    { descripcion: "Algoritmos y Estructuras de Datos" },
    { descripcion: "Arquitectura de las Computadoras" },
    { descripcion: "Sistemas y Procesos de Negocio" },

    { descripcion: "Análisis Matemático II" },
    { descripcion: "Física II" },
    { descripcion: "Ingeniería y Sociedad" },
    { descripcion: "Inglés II" },
    { descripcion: "Sintaxis y Semántica de los Lenguajes" },
    { descripcion: "Paradigmas de Programación" },
    { descripcion: "Sistemas Operativos" },
    { descripcion: "Análisis de Sistemas de Información" },

    { descripcion: "Probabilidad y Estadística" },
    { descripcion: "Economía" },
    { descripcion: "Bases de Datos" },
    { descripcion: "Desarrollo de Software" },
    { descripcion: "Comunicación de Datos" },
    { descripcion: "Análisis Numérico" },
    { descripcion: "Diseño de Sistemas de Información" },

    { descripcion: "Legislación" },
    { descripcion: "Ingeniería y Calidad de Software" },
    { descripcion: "Redes de Datos" },
    { descripcion: "Investigación Operativa" },
    { descripcion: "Simulación" },
    { descripcion: "Tecnologías para la Automatización" },
    { descripcion: "Administración de Sistemas de Información" },

    { descripcion: "Inteligencia Artificial" },
    { descripcion: "Ciencia de Datos" },
    { descripcion: "Sistemas de Gestión" },
    { descripcion: "Gestión Gerencial" },
    { descripcion: "Seguridad en los Sistemas Informáticos" },
    { descripcion: "Proyecto Final" }
])