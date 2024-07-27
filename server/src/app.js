const express = require('express')
const app = express() 
const bodyParser = require('body-parser')
const http = require('http').Server(app)
const io = require('socket.io')(http)
const fileUpload = require('express-fileupload')
const cors = require('cors');

app.use(bodyParser.json())
app.use(cors());

app.use(express.static(__dirname + '/public'));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));

var users = {}

app.get('/rooms/:userId/chat/:roomId', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

io.on('connection', function(socket) {
  users[socket.id] = { name: "noname" };
  console.log('a user connected', socket.id);

  socket.on('joinRoom', function(roomId, username) {
    socket.leaveAll(); // Отключаем сокета от всех комнат, к которым он был подключен
    socket.join(roomId); // Присоединяем пользователя к комнате
    socket.roomId = roomId; // Устанавливаем значение roomId для текущего сокета

    // Добавляем запись в объект users
    users[socket.id] = {
      name: username,
      roomId: roomId
    };

    socket.broadcast.to(socket.roomId).emit("upUsers", getUsersInRoom(socket.roomId)); // Отправка списка пользователей в текущей комнате
    socket.emit("upUsers", getUsersInRoom(socket.roomId)); // Отправка списка пользователей в текущей комнате

    console.log('a user connected to room', username, roomId, socket.id);

    socket.on('disconnectFromRoom', function() {
      if (socket.roomId && users[socket.id]) {
        const disconnectedUsername = users[socket.id].name;
        const disconnectedRoomId = users[socket.id].roomId;
  
        socket.leave(socket.roomId); // Отключаем пользователя от комнаты
        delete users[socket.id]; // Удаляем пользователя из списка
  
        // Отправляем обновленный список пользователей в текущей комнате другим пользователям
        socket.broadcast.to(disconnectedRoomId).emit('upUsers', getUsersInRoom(disconnectedRoomId));
  
        console.log('user disconnected from room', disconnectedUsername, disconnectedRoomId, socket.id);
      }
    });
  });

  socket.on('newMessage', function(data) {
    socket.to(socket.roomId).emit("newMessage", data);
  });

  socket.on('disconnect', function() {
    socket.leave(socket.roomId);
    delete users[socket.id];
    socket.broadcast.to(socket.roomId).emit("upUsers", getUsersInRoom(socket.roomId)); // Отправка списка пользователей в текущей комнате
    console.log('user disconnected', socket.id);
  });
});

function getUsersInRoom(roomId) {
  var roomUsers = {};
  for (var userId in users) {
    if (users[userId].roomId === roomId) {
      roomUsers[userId] = users[userId].name; // Возвращаем только имена пользователей
    }
  }
  return roomUsers;
}

app.post('/upload', async function(req, res) {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  let sampleFile = req.files.file;

  let fullName = __dirname + '/public/static/files/' + sampleFile.name
  let visName = 'http://192.168.0.116:3000/'+'/static/files/' + sampleFile.name

  sampleFile.mv(fullName, function(err) {
    if (err)
      return res.status(500).send(err);

    res.send({url: visName});
  })
})

http.listen(3000,'192.168.0.116', () => {
  console.log('server start!')
})
