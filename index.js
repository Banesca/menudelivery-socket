var app = require('express')();
var http = require('http').createServer(app);
var https = require('https');





var fs = require('fs');
const cors = require('cors');
app.use(cors());


app.get('/restaurant', (req, res) => {
  res.sendFile(__dirname + '/restaurant.html');
});

app.get('/api', (req, res) => {
    res.sendFile(__dirname + '/api.html');
  });



var serverhttps = https.createServer({
  cert: fs.readFileSync('sslcert/menusoftware.info.crt', 'utf8'),
  key: fs.readFileSync('sslcert/menusoftware.info.key', 'utf8')
},app)
.listen(2021, function(){
   console.log('Servidor https correindo en el puerto 2021');
});


http.listen(2020, () => {
  console.log('listening on *:2020');
});


// SOCKET HTTPS UPDATE
var io = require('socket.io')(serverhttps,{
  allowRequest: (req, cb) => {
    console.log("Llamada desde: "+  req.headers.origin)
    callback(null, true);

  }
})

io.origins(['https://menusoftware.info','https://menusoftware.info:80','https://menusoftware.info:443','http://localhost','http://localhost:80','http://72.167.55.26','http://72.167.55.26:2021','https://72.167.55.26:2021','https://api.menusoftware.info:2021','http://api.menusoftware.info','undefined']);


io.on('connection', (socket) => {
  console.log('LLEGO');

  let restaurant = socket.handshake.query.restaurant;//Obtenemos el restaurant

  if(restaurant != undefined){
      console.log('Restaurant: ' + restaurant + ' Conectado');
  }else{
      console.log('Api Conectada');
  }


  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('chat message', (msg) => {
      console.log('message: ' + msg);
      io.emit('chat message', "Lo recibii");

  });




  socket.join(restaurant);// Suscribimos la terminal  a el room del contrato

  // Eventos que eschuchan los llamados de la API
  socket.on('changeorder', (msg) => {
      console.log("*changeorder*")
      io.to(msg.restaurant).emit('changeorder'); // Emitimos el evento de cambio en productos
      socket.disconnect()// Desconectamos la api
  });

  // Eventos que eschuchan los llamados de la API
  socket.on('newPrint', (msg) => {
    console.log("*newPrint*")
    console.log(msg.restaurant)

    io.to(msg.restaurant).emit('newPrint',msg); // Emitimos el evento de cambio en productos
    socket.disconnect()// Desconectamos la api
});


});