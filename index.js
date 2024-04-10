// Creación y configuración del SERVER
const http = require('http');
const app = require('./src/app');

const Message = require('./src/models/message.model');

// Config .env
require('dotenv').config();

// Config bd
require('./src/config/db')

// Creación server
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT);

// Listeners
server.on('listening', () => {
    console.log(`Servidor escuchando sobre el puerto ${PORT}`);
});

server.on('error', (error) => {
    console.log(error);
});


// Config WS server

const io = require('socket.io')(server, {
    cors: { origin: '*' }
})

// Event connection
// Se lanza cuando un nuevo cliente se conecta a nuestro WS server
io.on('connection', async (socket) => {
    console.log('Ey un nuevo granuja');
    socket.broadcast.emit('chat_message_server', {
        nombre: 'INFO', mensaje: 'Se ha añadido un nuevo granuja', createdAt: new Date()
    })

    // Envío a todos la información de cuántos clientes hay conectados
    io.emit('clients_online', io.engine.clientsCount);

    // Recuperar los 5 últimos mensajes y los enviaré al cliente a través de un evento 'chat_init'
    const messages = await Message.find().sort({ createdAt: -1}).limit(5)
    socket.emit('chat_init', messages);

    socket.on('chat_message_client', async (data) => {
        data.socketId = socket.id;
        // Guardo el mensaje en la bd
        const newMessage = await Message.create(data);
        io.emit('chat_message_server', newMessage);
    })

    socket.on('disconnect', () => {
        io.emit('chat_message_server', {
            nombre: 'INFO', mensaje: 'Hemos perdido a un granuja', createdAt: new Date()
        });
        io.emit('clients_online', io.engine.clientsCount);
    });
});