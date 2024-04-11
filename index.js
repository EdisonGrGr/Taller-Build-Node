const express = require('express');
const pdfEquipos = require('pdfkit');
const fs = require('fs');
const { leerArchivo, escribirArchivo } = require('./src/files');
const joi = require('joi');
const moment = require('moment');

const app = express();

app.use(express.json());


// Middleware para registrar las solicitudes en access_log.txt
app.use((req, res, next) => {
  const { method, url, query, body, ip } = req;
  const currentTime = moment().format('DD/MM/YYYY HH:mm:ss');
  const queryParams = JSON.stringify(query);
  const bodyParams = JSON.stringify(body);

  const logData = `${currentTime} ${method} ${url} ${queryParams} ${bodyParams} ${ip}\n`;

  fs.appendFile('access_log.txt', logData, (err) => {
    if (err) console.error('Error al escribir en el archivo access_log.txt:', err);
  });

  next();
});

// Ruta para actualizar el campo updated_at en todos los registros
app.put('/equipos/actualizar-timestamp', (req, res) => {
  try {
    const equipos = leerArchivo('./equipos.json');
    const updatedequipos = equipos.map(equipo => ({ ...equipo, updated_at: moment().format() }));
    escribirArchivo('./equipos.json', updatedequipos);
    res.status(200).send('Timestamp actualizado en todos los equipos');
  } catch (error) {
    console.error('Error al actualizar el timestamp:', error);
    res.status(500).send('Error al actualizar el timestamp');
  }
});


// Ruta para obtener todos los equipos, con opción de filtrar por nombre
app.get('/equipos', (req, res) => {
  try {
    const equipos = leerArchivo('./equipos.json');
    const { nombre } = req.query;
    if (nombre) {
      const equipo = equipos.filter(equipo => equipo.nombre.toLowerCase().includes(nombre.toLowerCase()));
      return res.send(equipo);
    }
    res.send(equipos);
  } catch (error) {
    console.error('Error al obtener los equipos:', error);
    res.status(500).send('Error al obtener los equipos');
  }
}); 

// Ruta para obtener información de un equipo por su ID
app.get('/equipos/:id', (req, res) => {
    try{
    const id = req.params.id;
    const equipos = leerArchivo('./equipos.json');
    const equipo = equipos.find((equipo) => equipo.id == id);
    if (!equipo) {
      return res.status(404).send('No se encontro el equipo')    
    }
    res.send(equipo)
  }catch(error){
    console.log("Error al obtener el equipo", error)
    res.status(500).send('Error al aobtener el equipo')
  }
  });

// Ruta para crear un equipo nuevo
app.post('/equipos', (req, res) => {
    try{
    const guardarequipo = req.body
    let equipos = leerArchivo('./equipos.json')
    guardarequipo.id = equipos.length +1
    equipos.push(guardarequipo)
  
    escribirArchivo('./equipos.json', equipos)
        res.status(201).send(guardarequipo)
  } catch(error){
    console.error("Error al guardar el equipo", error)
    res.status(400).send('Error al guardar el equipo')
  }
  });
  
  // Ruta para actualizar los equipos existentes
  app.put('/equipos/:id', (req, res) => {
    try {
      const id = req.params.id;
      const equipos = leerArchivo('./equipos.json');
      const index = equipos.findIndex(equipo => equipo.id == id);
      if (index === -1) {
        return res.status(404).send('No se encontró el equipo');
      }
      const updatedequipo = req.body;
      equipos[index] = updatedequipo;
      escribirArchivo('./equipos.json', equipos);
      res.status(200).send(updatedequipo);
    } catch (error) {
      console.error('Error al actualizar el equipo:', error);
      res.status(500).send('Error al actualizar el equipo');
    }
  });

  // Ruta para eliminar un equipo almacenado
  app.delete('/equipos/:id', (req, res) => {
    try {
      const id = req.params.id;
      let equipos = leerArchivo('./equipos.json');
      equipos = equipos.filter(equipo => equipo.id != id);
      escribirArchivo('./equipos.json', equipos);
      res.status(200).send('equipo con ID ${id} eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el equipo:', error);
      res.status(500).send('Error al eliminar el equipo');
    }
  });

  app.get('/generate-pdf', (req, res) => {
    // Crear un nuevo documento PDF
    const doc = new pdfEquipos();

    // Escribir contenido en el PDF
    doc.fontSize(24);
    doc.text('Equipos de futbol.');

    // Establecer el tipo de contenido y enviar el PDF como respuesta
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);
    doc.end();
});

const { validateEquipo } = require('./src/validator');
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  })
