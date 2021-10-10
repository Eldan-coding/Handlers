import express  from "express";
import handlebars  from "express-handlebars";
import { createServer } from "http";
import { Server } from "socket.io";
import fs from "file-system";
import options from './MariaDB/options/mariaDB.js';
import knex from 'knex';

const app= express();
const PORT= 8080;
const router = express.Router();
const http=new createServer(app);
const io = new Server(http);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api', router);

app.use(express.static('public'));


//codigo para SELECT productos
const  GetProductos= async()=>{
    let productos=[];
        const KNEX=knex(options);
    try {
        productos=await KNEX.from('productos').select('*'); 
    } catch (error) {
        console.log('Error en Select:', e);        
    } finally {
        KNEX.destroy();
        return productos;     
    }
}

//codigo Insert Into productos
const addProduct= async(P)=>{

    const KNEX=knex(options);

    const datos = [
        P
    ];
    
    await KNEX('productos').insert(datos)
    .then(()=>{
        console.log("Filas insertadas!");
        KNEX.destroy();
    })
    .catch(e=>{
        console.log('Error en Insert:', e);
        KNEX.destroy();
    })

}

//codigo Update productos
const UpdateProducto=(P,ID)=>{
    const KNEX=knex(options);

    KNEX.from('productos').where('id', '=', ID).update(P)
    .then(() => {
        console.log('Filas actualizadas!')
        KNEX.destroy();
    })
    .catch(e=>{
        console.log('Error en Update:', e);
        KNEX.destroy();
    });
}

//Delete Producto
const DeleteProducto=(ID)=>{
    const KNEX=knex(options);

    KNEX.from('productos').where('id', '=', ID).del()
    .then(() => {
        console.log('Filas borradas!');
        KNEX.destroy();
    })
    .catch(e=>{
        console.log('Error en Delete:', e);
        KNEX.destroy();
    });
}

const mensajes=JSON.parse(fs.readFileSync('public/chat.txt',"utf-8"));

class Producto{
    constructor(title,price,thumbnail){
        this.title=title;
        this.price=price;
        this.thumbnail=thumbnail;
    }

    getObject(){
        return {
            title:this.title,
            price:this.price,
            thumbnail:this.thumbnail
        }
    }
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

router.get('/productos/vista', async (req,res)=>{
    res.render('main', {productos: await GetProductos()});
});

//////////////////////////////////////
io.on('connection', async (socket) =>{
    socket.emit("array", await GetProductos());
    socket.on('update', async (nuevoproducto)=>{
        await addProduct(nuevoproducto);
        io.sockets.emit('broadcast', await GetProductos());
    });
    //sockets para el chat
   socket.emit('conversa', mensajes);
    socket.on('updateconversa', (dataconversa)=>{
        addConversa(dataconversa);
        fs.writeFileSync('public/chat.txt',JSON.stringify(mensajes, null, "\t"));
        io.sockets.emit('broadcastchats', dataconversa);
    });
});

router.get('/productos/listar', async (req,res)=>{      
    let auxpro= await GetProductos();
    console.log(auxpro)
    if(auxpro.length > 0){
        res.json(auxpro);
    }else{
        res.json({error: 'no hay productos cargados'})
    }
});

router.get('/productos/listar/:id', async (req,res)=>{
    let params = req.params;
    let resultado={error: 'producto no encontrado'};
    let productos= await GetProductos();
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

    let product=new Producto(datos[0],datos[1],datos[2]);
    addProduct(product.getObject());
    res.json(product.getObject())
});

router.put('/productos/actualizar/:id', async (req,res)=>{
    let params = req.params;
    let body = req.body;
    const datos=Object.values(body);

    let productos=await GetProductos();
    let resultado={error: 'producto no actualizado: no se encontro'};
    for (let index = 0; index < productos.length; index++) {
        if(productos[index].id==params.id){
            let product=new Producto(datos[0],datos[1],datos[2]);
            UpdateProducto(product.getObject(),params.id);
            resultado=product.getObject();
        }
    }

    res.json(resultado)
});

router.delete('/productos/borrar/:id',async (req,res)=>{
    let params = req.params;

    let resultado={error: 'producto no eliminado: no se encontro'};
    let productos=await GetProductos();
    for (let index = 0; index < productos.length; index++) {
        if(productos[index].id==params.id){
            resultado=productos[index];
        }
    }
    DeleteProducto(params.id);

    res.json(resultado)
});