const joi = require('joi');

const equipoSchema = joi.object({
    nombre: joi.string().required(),
    pais: joi.string().required(),
    liga: joi.string().required(),
    fundacion: joi.number().integer().min(1800).max(new Date().getFullYear()).required(),
    presidente: joi.string().required(),
    entrenador: joi.string().required(),
    valor_equipo_millones: joi.number().positive().required(),
});
exports.equipoSchema = equipoSchema;
