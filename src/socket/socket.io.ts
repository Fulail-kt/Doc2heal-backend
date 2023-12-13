
import { Server } from 'socket.io';
const emailSocketMap=new Map()
const socketToEmailMap=new Map()

export const SocketServer = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173'
    }
  });

  io.on('connection', (socket) => {


    console.log("new connection socketio");
    socket.on('room:join', (data) => {
      const { roomId, email } = data;
      console.log("User", email, "joined room", roomId);
      emailSocketMap.set(email,socket.id)
      socketToEmailMap.set(socket.id,email)
      io.to(roomId).emit('user:joined',{email,id:socket.id})
      socket.join(roomId);
      socket.to(socket.id).emit('roomjoin',data)
    });


    socket.on('user:call',({to,offer})=>{
      io.to(to).emit('incomming:call',{from:socket.id,offer})
    })

    socket.on('call:accepted',({to,ans})=>{
      io.to(to).emit('call:accepted',{from:socket.id,ans})
    })

    socket.on('peer:nego:needed',({to,offer})=>{
      io.to(to).emit('peer:nego:needed',{from:socket.id,offer})
    })

    socket.on('peer:nego:done',({to,ans})=>{
      io.to(to).emit('peer:nego:final',{from:socket.id,ans})
    })

    // chat functionality


    

    socket.on('send:message',({to,message})=>{
      //get the sender's email
      const fromEmail=socketToEmailMap.get(socket.id);

      //get the reciever's socket.id

      const toSocketId=emailSocketMap.get(to);

      io.to(toSocketId).emit('')

    })



  });


  

  io.listen(3001)

  return io;
};

