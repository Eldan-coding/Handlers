import express  from "express";
import handlebars  from "express-handlebars";
import { createServer } from "http";
import { Server } from "socket.io";
import fs from "file-system";

const app= express();
const PORT= 8080;
const router = express.Router();
const http=new createServer(app);
const io = new Server(http);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api', router);

app.use(express.static('public'));

let productos=[];
let id=0;
const mensajes=JSON.parse(fs.readFileSync('public/chat.txt',"utf-8"));

class Producto{
    constructor(title,price,thumbnail,id){
        this.title=title;
        this.price=price;
        this.thumbnail=thumbnail;
        this.id=id;
    }

    getObject(){
        return {
            title:this.title,
            price:this.price,
            thumbnail:this.thumbnail,
            id:this.id
        }
    }
}

const getID=()=>{
    id++;
    return id;
}

const addProduct=(P)=>{
    productos.push(P);
}

const addConversa=(chat)=>{
    mensajes.push(chat);
}

const server = http.listen (PORT, ()=>{
    console.log("Servidor HTTP corriendo en", server.address().port);
});
server.on('error', error=>console.log('Error en servidor',error));


app.engine(
    "hbs",
    handlebars({
        extname: ".hbs",
        defaultLayout: "index.hbs",
        layoutsDir: "views/layouts",
        partialsDir: "views/partials"
    })
);

app.set('views', './views'); // especifica el directorio de vistas
app.set('view engine', 'hbs'); // registra el motor de plantillas

router.get('/', (req,res)=>{
    res.send("<h1>Inicio Del Programa</h1>");
});

router.get('/productos/vista',(req,res)=>{
    res.render('main', {productos: productos, mensajes: mensajes});
});

io.on('connection', (socket) =>{
    socket.emit("array", productos);
    socket.on('update', (datacliente)=>{
        productos=datacliente;
        io.sockets.emit('broadcast', productos)
    });
    //sockets para el chat
    socket.emit('conversa', mensajes);
    socket.on('updateconversa', (dataconversa)=>{
        addConversa(dataconversa);
        fs.writeFileSync('public/chat.txt',JSON.stringify(mensajes, null, "\t"));
        io.sockets.emit('broadcastchats', dataconversa);
    });
});

router.get('/productos/listar',(req,res)=>{
    if(productos.length > 0){
        res.json(productos);
    }else{
        res.json({error: 'no hay productos cargados'})
    }
});

router.get('/productos/listar/:id',(req,res)=>{
    let params = req.params;
    let resultado={error: 'producto no encontrado'};
    for (let index = 0; index < productos.length; index++) {
        if(productos[index].id==params.id){
            resultado=productos[index];
        }
    }

    res.json(resultado)
});

router.post('/productos/guardar',(req,res)=>{
    let body = req.body;
    console.log(body)
    const datos=Object.values(body);

    let product=new Producto(datos[0],datos[1],datos[2],getID());
    addProduct(product.getObject());
    res.json(product.getObject())
});

router.put('/productos/actualizar/:id',(req,res)=>{
    let params = req.params;
    let body = req.body;
    const datos=Object.values(body);

    let resultado={error: 'producto no actualizado: no se encontro'};
    for (let index = 0; index < productos.length; index++) {
        if(productos[index].id==params.id){
            let product=new Producto(datos[0],datos[1],datos[2],params.id);
            productos[index]=product.getObject();
            resultado=product.getObject();
        }
    }

    res.json(resultado)
});

router.delete('/productos/borrar/:id',(req,res)=>{
    let params = req.params;

    let arrayAux=[];
    let resultado={error: 'producto no eliminado: no se encontro'};
    for (let index = 0; index < productos.length; index++) {
        if(productos[index].id==params.id){
            resultado=productos[index];
        }else{
            arrayAux.push(productos[index]);
        }
    }
    productos=arrayAux;

    res.json(resultado)
});