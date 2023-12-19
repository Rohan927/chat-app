const express = require('express')
const app = express()
const http = require('http')
const path = require('path')
const Filter = require('bad-words')
const socketio = require('socket.io')
const {generateMessage,generateLocationMessage} = require('./utils/messages')
const {addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getRooms} = require('./utils/users')

const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname,'../public')
const port = process.env.PORT||3000

app.use(express.static(publicDirectoryPath))

io.on('connection',(socket)=>{
    console.log('New WebSocket connection')
    const rooms = [...getRooms()]
    socket.emit('dropdown',rooms)
    socket.on('join',(options,callback)=>{
        const {user,error} = addUser({id:socket.id, ...options})

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message',generateMessage(user.username,'Welcome!'))  
        socket.broadcast.to(user.room).emit('message',generateMessage(user.username,user.username + ' has joined'))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users : getUsersInRoom(user.room)
        })
        callback()
    })
    


    socket.on('sendMessage',(message,callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profane language is not allowed')
        }
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    }) 
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage(user.username,`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users : getUsersInRoom(user.room)  
            })
        }
    })
    socket.on('send-location',(location,callback)=>{
        const user = getUser(socket.id)
        
        io.to(user.room).emit('locationmessage',generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })

}) 

server.listen(port,()=>{
    console.log("Chat App is running on server "+port)
})