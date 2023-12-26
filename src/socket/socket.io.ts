
// import { Server } from 'socket.io';
// const emailSocketMap = new Map()
// const socketToEmailMap = new Map()

// export const SocketServer = (server: any) => {
//   const io = new Server(server, {
//     cors: {
//       origin: 'http://localhost:5173'
//     }
//   });

//   io.on('connection', (socket) => {
//     console.log("new connection socketIo ");
//     socket.on('room:join', (data) => {
//       const { roomId, email } = data;
//       console.log("User", email, "joined room", roomId);
//       emailSocketMap.set(email, socket.id)
//       socketToEmailMap.set(socket.id, email)
//       io.to(roomId).emit('user:joined', { email, id: socket.id })
//       socket.join(roomId);
//       socket.to(socket.id).emit('roomjoin', data)
//     });


//     socket.on('user:call', ({ to, offer }) => {
//       io.to(to).emit('incomming:call', { from: socket.id, offer })
//     })

//     socket.on('call:accepted', ({ to, ans }) => {
//       io.to(to).emit('call:accepted', { from: socket.id, ans })
//     })

//     socket.on('peer:nego:needed', ({ to, offer }) => {
//       io.to(to).emit('peer:nego:needed', { from: socket.id, offer })
//     })

//     socket.on('peer:nego:done', ({ to, ans }) => {
//       io.to(to).emit('peer:nego:final', { from: socket.id, ans })
//     })

//     // chat functionality


//     let users: any[]=[];

//     const addUser = (userId:string, socketId:string) => {
      
//       console.log(userId,socketId,"this is form add user");
      
//         !users.some(user=>user.userId==userId)&& users.push({userId,socketId})
//     }

//     const removeUser = (socketId:string) => {
//         users=users.filter(user=>user.socketId !=socketId)
//     }

//     const getUser = (userId:string) => {
//       console.log(userId,"this is userId");
//       console.log(users,"this is users");
      
      
//         return users.find(user=>user.userId==userId)
//     }
    
//     socket.on('addUser', (userId) => {
//       addUser(userId, socket.id);
//       io.emit("getUsers", users);
//     });
    
//     // send and get messages
    
//     socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
      
//       console.log(senderId, receiverId, message,"sende messages");
      
//       const user = await getUser(receiverId);

//       console.log(user,"this is user");
      
      
//       if (user && user.socketId) {
//         io.to(user.socketId).emit('getMessages', {
//           senderId, message,
//         });
//       } else {
//         console.error(`User with userId ${receiverId} not found or missing socketId.`);
//       }
//     });
    
//     // when disconnect

//     socket.on("disconnect", () => {
//       console.log(`User disconnected: ${socket.id}`);
//       removeUser(socket.id);
//       io.emit("getUsers", users);
//     });

//   });




//   io.listen(3001)

//   return io;
// };


import { Server } from 'socket.io';

const emailSocketMap = new Map();
const socketToEmailMap = new Map();

export const SocketServer = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173'
    }
  });



  let users:any[] = [];
  //add user
  const addUser = (userId:string, socketId:string) => {
    !users.some((user) => user.userId === userId) &&
      users.push({ userId, socketId });
  };
  //remove user
  const removeUser = (socketId:string) => {
    users = users.filter((user) => user.socketId !== socketId);
  };
  //get user
  const getUser = (userId:string) => {
    return users.find((user) => user.userId === userId);
  };

  io.on('connection', (socket) => {
    console.log("new connection socketIo ");

    socket.on('room:join', (data) => {
      const { roomId, email } = data;
      console.log("User", email, "joined room", roomId);
      emailSocketMap.set(email, socket.id);
      socketToEmailMap.set(socket.id, email);
      io.to(roomId).emit('user:joined', { email, id: socket.id });
      socket.join(roomId);
      socket.to(socket.id).emit('roomjoin', data);
    });

    socket.on('user:call', ({ to, offer }) => {
      io.to(to).emit('incomming:call', { from: socket.id, offer });
    });

    socket.on('call:accepted', ({ to, ans }) => {
      io.to(to).emit('call:accepted', { from: socket.id, ans });
    });

    socket.on('peer:nego:needed', ({ to, offer }) => {
      io.to(to).emit('peer:nego:needed', { from: socket.id, offer });
    });

    socket.on('peer:nego:done', ({ to, ans }) => {
      io.to(to).emit('peer:nego:final', { from: socket.id, ans });
    });

    // chat functionality
 

    socket.on('addUser', (userId) => {
      addUser(userId, socket.id);
      io.emit("getUsers", users);
    });

    // send and get messages
    socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
      const user = await getUser(receiverId);

      if (user && user.socketId) {
        io.to(user.socketId).emit('getMessages', {
          senderId,
          message,
        });
      } else {
        console.error(`User with userId ${receiverId} not found or missing socketId.`);
      }
    });

    // when disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      removeUser(socket.id);
      io.emit("getUsers", users);
    });
  });

  io.listen(3001);

  return io;
};
