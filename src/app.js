// Creación y configuración de la APP de Express
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Configuración de rutas
router.get('/', (req, res) => {
    res.json('Una rutita dentro del back para probar')
});



module.exports = app;