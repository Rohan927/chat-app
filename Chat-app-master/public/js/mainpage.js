socket = io()

//Element
const $dropdown = document.querySelector('#dropdown')

//Template
const dropdownTemplate = document.querySelector('#dropdown-template').innerHTML

socket.on('dropdown',(rooms)=>{
    console.log(rooms)
    const html = Mustache.render(dropdownTemplate,{rooms})
    $dropdown.insertAdjacentHTML('beforeend',html)
})