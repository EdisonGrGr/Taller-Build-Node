const fs = require('fs');

function leerArchivo(path) {
    const data = fs.readFileSync(path);
    const equipos = JSON.parse(data).equipos;
    return equipos;
}

function escribirArchivo(path,info) {
    const data = JSON.stringify({'equipos': info});
    fs.writeFileSync(path,data);
}
module.exports = {
    leerArchivo,
    escribirArchivo
}