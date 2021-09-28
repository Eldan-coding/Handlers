const socket=io();

let ArrayProductos=[];
let arrayConversaciones=[];

//socket inicial para iniciar enviar array
socket.on('array', (data) =>{
    ArrayProductos=data;
});

//recibimos las conversaciones
socket.on('conversa', (data) =>{
    arrayConversaciones=data;
    Cargarmensajes()
});

//socket para recibir cambios de todos los clientes y aplicarlos en las tablas de los mismos
socket.on('broadcast', (arrayserver)=>{
    ArrayProductos=arrayserver;
    update();
})

const update=()=>{
    const containerhtml=document.getElementById("container-productos");
    if(containerhtml){
        containerhtml.innerHTML=Cargar();
    }else{
        const maincontainer=document.getElementById("main-container");
        maincontainer.innerHTML=`
        <table class="table table-dark table-striped text-center">
        <tbody id="container-productos">
            <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Foto</th>
            </tr>
        </tbody>
        </table>`;
        const containerhtml=document.getElementById("container-productos");
        containerhtml.innerHTML=Cargar();
    }
};

//actualizamos el chat generalmente
socket.on('broadcastchats', (data) =>{
    let bubble = document.createElement('div');
    bubble.className='bubble';
    bubble.innerHTML=`${data.correo} ${data.fecha}: ${data.mensaje}`
    document.getElementById("mensajes").appendChild(bubble);
});

//template de los datos en la tabla
const Cargar=()=>{
    let productoshtml=`
    <tr>
        <th>Nombre</th>
        <th>Precio</th>
        <th>Foto</th>
    </tr>`;
    ArrayProductos.forEach(article => {
        productoshtml+=`
            <tr>
                <td>${article.title}</td>
                <td>${article.price}</td>
                <td><img width="100px" src=${article.thumbnail} alt=${article.title}></td>
            </tr>`
    });
    return productoshtml;
};

//recibo datos desde el formulario
document.getElementById("formula").addEventListener("submit", function(e){
    e.preventDefault();
    let titulo=e.target[0].value
    let precio=e.target[1].value
    let miniatura=e.target[2].value
    ArrayProductos.push({
		title: titulo,
		price: precio,
		thumbnail: miniatura
    })
    update()
    socket.emit('update', ArrayProductos);
    document.getElementById("formula").reset();
});

    
const Cargarmensajes=()=>{
    arrayConversaciones.forEach(c => {
        let bubble = document.createElement('div');
        bubble.className='bubble';
        bubble.innerHTML=`${c.correo} ${c.fecha}: ${c.mensaje}`
        document.getElementById("mensajes").appendChild(bubble);
    });
    document.getElementById("chat").addEventListener("submit", function(e){
        e.preventDefault();
        const d=new Date();
        let objectConversa={
            correo: e.target[0].value,
            fecha: `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`,
            mensaje: e.target[1].value
        }
        socket.emit('updateconversa', objectConversa);

    });

};

