import "module-alias/register";
import { createServer } from "http";
import app from "./app";
import dotenv from "dotenv";
import { Server, Socket } from "socket.io";
import { MongoClient } from "mongodb";
import { SocketEmitter, SocketEvent } from "./constant";
import { FileMetadata, MessageReadEventData, NewInvitationEventData } from "@model/socket_model";
import { Whitelist } from "./config/cors";
import { MessageModel } from "@model/entity/message_model";

dotenv.config();

const server = createServer(app);
const port = process.env.PORT;
const connString: string | undefined = process.env.MONGO_URI;

interface SocketUser {
  socketId: string,
  userId: string,
  roomIdList: string[]
}

interface SocketUser {
  socketId: string,
  userId: string
}

let socketUsers: SocketUser[] = [];
let socketRooms: string[] = [];

if (connString != undefined && connString.length > 0) {
  MongoClient.connect(connString).then((db) => {
    app.locals.db = db;
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

  }).catch((error) => {
  })
}


const io = new Server(server, {
  cors: {
    origin: Whitelist,
  }
});

io.on("connection", (socket: Socket) => {
  console.log("socket: " + socket.id)
  const userId: string = socket.handshake.query.id.toString();
  let roomIdList: string[] = [];
  if (typeof socket.handshake.query.roomList == "string") {
    roomIdList = socket.handshake.query.roomList?.split(",");
  }

  // append room to socket
  // check if room existed
  for (let index = 0; index < roomIdList.length; index++) {
    const roomId = roomIdList[index];

    const socketRoomIndex = socketRooms.findIndex((r) => r == roomId);
    // in case: room not in socket => append room to socket
    if (socketRoomIndex < 0) {
      socketRooms = [...socketRooms, roomId]
    }
  }

  // append user to socket
  const newSocketUsers: SocketUser = {
    socketId: socket.id,
    userId: userId,
    roomIdList: roomIdList
  }
  socketUsers = [...socketUsers, newSocketUsers]

  // JOIN ROOM
  for (let index = 0; index < roomIdList.length; index++) {
    socket.join(roomIdList[index]);
  }

  socket.on(SocketEvent[SocketEvent.INVITE_USER], (data: NewInvitationEventData) => {
    const socketId = socketUsers.find((u) => u.userId == data.userId)?.socketId;
    if (socketId) {
      socket.to(socketId).emit(SocketEmitter[SocketEmitter.NEW_INVITATION], data)
    }
  });

  socket.on(SocketEvent[SocketEvent.SEND_MESSAGE], (data: MessageModel) => {
    socket.to(data.roomId as string).emit(SocketEmitter[SocketEmitter.RECEIVE_MESSAGE], data)
  })

  socket.on(SocketEvent[SocketEvent.TYPING], (data: MessageReadEventData) => {
    socket.to(data.roomId).emit(SocketEmitter[SocketEmitter.TYPING], {
      senderId: data.senderId,
    })
  })

  socket.on(SocketEvent[SocketEvent.STOP_TYPING], (data: MessageReadEventData) => {
    socket.to(data.roomId).emit(SocketEmitter[SocketEmitter.TYPING_END], {})
  })

  socket.on(SocketEvent[SocketEvent.READ_MESSAGE], (data: MessageReadEventData) => {
    socket.to(data.roomId).emit(SocketEmitter[SocketEmitter.MESSAGE_READ], {
      senderId: data.senderId,
    })
  })

  // FILE TRANSFER
  socket.on(SocketEvent[SocketEvent.SEND_FILE_METADATA], (data: {
    roomId: string,
    metadata: FileMetadata
  }) => {
    socket.in(data.roomId).emit(SocketEmitter[SocketEmitter.RECEIVE_FILE_METADATA], data.metadata)
  })

  socket.on(SocketEvent[SocketEvent.SEND_FILE_START], (data: {
    roomId: string
  }) => {
    socket.in(data.roomId).emit(SocketEmitter[SocketEmitter.FILE_TRANSFER], {})
  })

  socket.on(SocketEvent[SocketEvent.SEND_FILE_BUFFER], (data: {
    roomId: string,
    buffer: Uint8Array
  }) => {
    socket.in(data.roomId).emit(SocketEmitter[SocketEmitter.FILE_TRANSFER], data.buffer)
  })
  // END FILE TRANSFER

  // VIDEO CONFERENCE
  socket.on(SocketEvent[SocketEvent.JOIN_VIDEO_CALL], (data: {
    roomId: string,
    userId: string,
    signal
  }) => {
    io.to(data.roomId).emit(SocketEmitter[SocketEmitter.VIDEO_CALL_JOIN], {
      userId: data.userId,
      signal: data.signal
    })
  })

  socket.on(SocketEvent[SocketEvent.RETURN_SIGNAL], (data: {
    roomId: string,
    userId: string,
    signal
  }) => {
    console.log(SocketEmitter[SocketEmitter.RECEIVE_SIGNAL])
    io.to(data.roomId).emit(SocketEmitter[SocketEmitter.RECEIVE_SIGNAL], {
      userId: data.userId,
      signal: data.signal
    })
  })

  socket.on(SocketEvent[SocketEvent.STOP_VIDEO_CALL], (data: {
    roomId: string,
    userId: string
  }) => {
    io.to(data.roomId).emit(SocketEmitter[SocketEmitter.VIDEO_CALL_END], {
      userId: data.userId
    })
  })
  // END CONFERENCE CALL

  socket.on("disconnect", () => {
    console.log("disconnect: " + socket.id)
    socketUsers = socketUsers.filter((u) => u.socketId != socket.id)
  })
});

app.get('*', function (req, res) {
  return res.status(404).json({ "message": "resource not found" });
});

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port == 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr == 'string'
    ? 'pipe ' + addr
    : 'port ' + addr?.port;
  console.log('Listening on ' + bind);
}