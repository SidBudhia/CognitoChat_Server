const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const userRouter = require("./routers/userRouter");

dotenv.config();
const port = process.env.PORT || 8080;
require("./db/mongoose");

app.use(cors());
app.use(express.json());
app.use("/api/user", userRouter);

// app.use(function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Credentials', true);
//   res.header(
//       'Access-Control-Allow-Headers',
//       'Origin, X-Requested-With, Content-Type, Accept'
//   );
//   next();
// });


const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

var sockets = {};
var users = {};
var strangerWaiting = false;

io.on("connection",  (socket)=> {
  console.log(`User Connected by ID: ${socket.id}`);

  sockets[socket.id] = socket;
  users[socket.id] = {
    connectedTo: -1,
  };

  if (strangerWaiting !== false) {
    users[socket.id].connectedTo = strangerWaiting;
    users[strangerWaiting].connectedTo = socket.id;
    socket.emit("conn");
    sockets[strangerWaiting].emit("conn");
    strangerWaiting = false;
  } else {
    strangerWaiting = socket.id;
  }

  socket.on("new",  () => {
    if (strangerWaiting !== false) {
      users[socket.id].connectedTo = strangerWaiting;
      users[strangerWaiting].connectedTo = socket.id;
      socket.emit("conn");
      sockets[strangerWaiting].emit("conn");
      strangerWaiting = false;
    } else {
      strangerWaiting = socket.id;
    }
  });

  socket.on("disconn",  () => {
    var prevConn = users[socket.id].connectedTo;
    if (strangerWaiting === socket.id || strangerWaiting === prevConn) {
      strangerWaiting = false;
    }
    users[socket.id].connectedTo = -1;
    if (sockets[prevConn]) {
      users[prevConn].connectedTo = -1;
      sockets[prevConn].emit("disconn");
    }
    socket.emit("disconn");
  });

  socket.on("chat", (msgData) => {
    if (
      users[socket.id].connectedTo !== -1 &&
      sockets[users[socket.id].connectedTo]
    ) {
      sockets[users[socket.id].connectedTo].emit("chat", msgData);
    }
  });
  
  socket.on("disconnect", (err) => {
    console.log(`User DisConnected by ID: ${socket.id}`);

    var connTo = users[socket.id] && users[socket.id].connectedTo;
    if (connTo === undefined) {
      connTo = -1;
    }
    if (connTo !== -1 && sockets[connTo]) {
      sockets[connTo].emit("disconn");
      users[connTo].connectedTo = -1;
    }

    delete sockets[socket.id];
    delete users[socket.id];

    if (strangerWaiting === socket.id || strangerWaiting === connTo) {
      strangerWaiting = false;
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
