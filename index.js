var app = require('express')();
var http = require('http').createServer(app);

const whitelist = ['https://menusoftware.info','https://api.menusoftware.info'];

var io = require('socket.io')(http,{origins:'https://menusoftware.info',
handlePreflightRequest: (req, res) => {
  res.writeHead(200, {
    "Access-Control-Allow-Origin": "https://example.com",
    "Access-Control-Allow-Methods": "GET,POST",
    "Access-Control-Allow-Headers": "my-custom-header",
    "Access-Control-Allow-Credentials": true
  });
  res.end();
}});


var fs = require('fs');
var https = require('https');
const cors = require('cors');
app.use(cors());
io.origins(['https://menusoftware.info']);


app.get('/restaurant', (req, res) => {
  res.sendFile(__dirname + '/restaurant.html');
});

app.get('/api', (req, res) => {
    res.sendFile(__dirname + '/api.html');
  });

io.on('connection', (socket) => {


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


https.createServer({
  cert: fs.readFileSync('sslcert/menusoftware.info.crt', 'utf8'),
  key: fs.readFileSync('sslcert/menusoftware.info.key', 'utf8')
},app).listen(2021, function(){
   console.log('Servidor https correindo en el puerto 2021');
});


http.listen(2020, () => {
  console.log('listening on *:2020');
});