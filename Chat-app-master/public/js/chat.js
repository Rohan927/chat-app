socket = io()
//Elements
const $messageform =document.querySelector('#message-form')
const $messageformInput = $messageform.querySelector('input')
const $messageformButton = $messageform.querySelector('button')
const $sendlocationButton = document.querySelector('#send-Location')
const $messages = document.querySelector('#messages')

//template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//Options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

//Autoscrolling
const autoscroll = ()=>{
    //getting the new message
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight =  $newMessage.offsetHeight + newMessageMargin

    //visible Height
    const visibleHeight = $messages.offsetHeight

    //height of message container
    const containerHeight = $messages.scrollHeight

    //how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(scrollOffset>=containerHeight-newMessageHeight){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username : message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationmessage',(location)=>{
    const html = Mustache.render(locationTemplate,{
        username : location.username,
        url : location.url,
        createdAt : moment(location.createdAt).format('h:mm a')
    }) 
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room , users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageform.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageformButton.setAttribute('disabled','disabled')
    const message = e.target.elements.message.value

    socket.emit('sendMessage',message,(error)=>{
        $messageformButton.removeAttribute('disabled')
        $messageformInput.value = ''
        $messageformInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('Message Delivered')
    })
})
$sendlocationButton.addEventListener('click',(e)=>{
    e.preventDefault()
    
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    $sendlocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{

        socket.emit('send-location',{
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        },(error)=>{
           if(error){
               return console.log(error)
           }     
           console.log('Location shared!')
           $sendlocationButton.removeAttribute('disabled')
        })
    })
})
socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})