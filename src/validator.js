const { leerArchivo } = require('./files');
const { equipoSchema } = require('./equipoSchema');

function validateEquipo(req, res, next) {
    try {
        const equipoData = req.body;

        // Verificar si el equipo ya existe en los datos recibidos
        const Equipos = leerArchivo('./equipos.json');
        const equipoExistente = Equipos.find(equipo => equipo.nombre === equipoData.nombre);
        if (equipoExistente) {
            return res.status(400).send('El equipo ya existe');
        }

        // Validar el cuerpo de la solicitud utilizando Joi
        const { error } = equipoSchema.validate(equipoData);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        next();
    } catch (error) {
        res.status(500).send('Error al validar el equipo');
    }
}

module.exports = { validateEquipo };
