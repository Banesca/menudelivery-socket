var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/terminal', (req, res) => {
  res.sendFile(__dirname + '/terminal.html');
});

app.get('/api', (req, res) => {
    res.sendFile(__dirname + '/api.html');
  });

io.on('connection', (socket) => {


    console.log(socket.handshake.query.restaurant)

    let restaurant = socket.handshake.query.restaurant;//Obtenemos el restaurant

    if(restaurant != undefined && terminal != undefined){
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
        io.to(msg.contrato).emit('changeorder'); // Emitimos el evento de cambio en productos 
        socket.disconnect()// Desconectamos la api
    });
 
  
});

http.listen(2020, () => {
  console.log('listening on *:2020');
});