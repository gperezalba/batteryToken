const express = require('express');
const app = express();

app.use(express.static(__dirname + '/app/'));

app.listen('8000', function() {
  console.log('Servidor web escuchando en el puerto 8000');
})
