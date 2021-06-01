const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');
const router = require('./router.js');
const {addUser, removeUser, getUser, getRoomUsers} = require('./users.js');

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);
app.use(cors());

io.on('connection', socket => {
    console.log('We have a new connection.');
    socket.on('join', ({name, room}, callback) => {
        const {error, user} = addUser({id: socket.id, name, room});
        if (error) return callback(error);

        socket.emit('message', {user: 'admin', text: `${user.name}, добро пожаловать в комнату ${user.room}`});
        socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.name}, присоединился!`});
        socket.join(user.room);
        io.to(user.room).emit('roomData', {room: user.room, users: getRoomUsers(user.room)})

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message', {user: user.name, text: message});
        io.to(user.room).emit('roomData', {room: user.room, users: getRoomUsers(user.room)});
        callback();
    });


    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        console.log('User had left.', user);
        if (user) {
            io.to(user.room).emit('message', {user: 'admin', text: `${user.name} ушел.`});
            io.to(user.room).emit('roomData', {room: user.room, users: getRoomUsers(user.room)});
        }
    });
});

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));

