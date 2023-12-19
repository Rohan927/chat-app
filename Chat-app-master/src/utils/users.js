const users = []
const rooms = []
const addUser = ({id,username,room})=>{
    //Cleaning the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    rooms.push(room)
    //Validating data
    if(!username||!room){
        return {error:'Username and room are required'}
    }

    //Check for existing user
    const existinguser = users.find((user) => user.room==room && user.username==username)
    if(existinguser){
        return {
            error : 'Username in use'
        }
    }
    //store user
    const user = {id,username,room}
    users.push(user)
    return {user}
}
const removeUser = (id)=>{
    //checking is user exist
    const index = users.findIndex((user) => user.id==id)
    if(index!=-1){
        const ri = rooms.findIndex((room) => users[index].room==room)
        rooms.splice(ri,1)
        return users.splice(index,1)[0]
    }
}
const getUser = (id)=>{
    return users.find((user)=> user.id==id)  
}
const getUsersInRoom = (room)=>{
    return users.filter((user)=> user.room==room)

}
const getRooms = ()=>{
    return new Set(rooms)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getRooms
}
