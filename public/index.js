const socket=io();

let ArrayProductos=[];
let arrayConversaciones=[];

//socket inicial para iniciar array
socket.on('array', (data) =>{
    ArrayProductos=data;   
});

//recibimos las conversaciones
socket.on('conversa', (data) =>{
    arrayConversaciones=data[1].messages;
    document.getElementById("compresion").innerText=`Porcentaje de compresion de mensajes ${(JSON.stringify(data[1]).length/JSON.stringify(data[0]).length)*100}%`
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
        let email = document.createElement('span');
        let fecha_hora = document.createElement('span');
        let mensa = document.createElement('span');
        let thumb = document.createElement('img');

        bubble.className='bubble';
        email.className='elemail';
        fecha_hora.className='date';
        mensa.className='mensa';

        document.getElementById("compresion").innerText=`Porcentaje de compresion de mensajes ${(JSON.stringify(data[1]).length/JSON.stringify(data[0]).length)*100}%`

        let Ucorreo=data[1].messages[data[1].messages.length-1].author.id;
        let Ufecha=data[1].messages[data[1].messages.length-1].fecha;
        let Utext=data[1].messages[data[1].messages.length-1].text;
        let Uavatar=data[1].messages[data[1].messages.length-1].author.avatar;
        
        email.innerText=`${Ucorreo} `;
        fecha_hora.innerText=`${Ufecha}: `;
        mensa.innerText=`${Utext} `;
        thumb.setAttribute('src', Uavatar);
        thumb.width = '20';
        
        bubble.appendChild(email);
        bubble.appendChild(fecha_hora);
        bubble.appendChild(mensa);
        bubble.appendChild(thumb);
        

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

const Cargarmensajes=()=>{
    arrayConversaciones.forEach(c => {
        let bubble = document.createElement('div');
        let email = document.createElement('span');
        let fecha_hora = document.createElement('span');
        let mensa = document.createElement('span');
        let thumb = document.createElement('img');

        
        bubble.className='bubble';
        email.className='elemail';
        fecha_hora.className='date';
        mensa.className='mensa';

        email.innerText=`${c.author.id} `;
        fecha_hora.innerText=`${c.fecha}: `;
        mensa.innerText=`${c.text} `;
        thumb.setAttribute('src', c.author.avatar);
        thumb.width = '30';
        
        bubble.appendChild(email);
        bubble.appendChild(fecha_hora);
        bubble.appendChild(mensa);
        bubble.appendChild(thumb);

        document.getElementById("mensajes").appendChild(bubble);
    });
    document.getElementById("chat").addEventListener("submit", function(e){
        e.preventDefault();
        const d=new Date();
        let objectConversa={
            author:{
                id: e.target[0].value,
                nombre: e.target[1].value,
                apellido: e.target[2].value,
                edad: e.target[3].value,
                alias: e.target[4].value,
                avatar: e.target[5].value
            },
            fecha: `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`,
            text: e.target[6].value
        }
        socket.emit('updateconversa', objectConversa);
    });

};



//recibo datos desde el formulario
document.getElementById("formula").addEventListener("submit", function(e){
    e.preventDefault();
    let titulo=e.target[0].value
    let precio=e.target[1].value
    let miniatura=e.target[2].value
    let OBJ={
		title: titulo,
		price: precio,
		thumbnail: miniatura
    };
    ArrayProductos.push(OBJ);
    update();
    socket.emit('update', OBJ);
    document.getElementById("formula").reset();
});