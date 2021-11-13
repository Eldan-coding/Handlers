import express from "express";
import handlebars from "express-handlebars";
import { createServer } from "http";
import { Server } from "socket.io";
/* import fs from "file-system";
import options from './MariaDB/options/mariaDB.js';
import optionsSQLlite from './SQLite/options/SQLite3.js';
import knex from 'knex'; */
import mongoose from "mongoose";
import ProductoModel from "./MongoDB/models/Productos.js"
import MensajesModel from "./MongoDB/models/Mensajes.js"
import UsuarioModel from "./MongoDB/models/Usuarios.js"
import faker from "faker";
import { denormalize, normalize, schema } from "normalizr";
import util from "util";
import session from "express-session";
import MongoStore from "connect-mongo";
const advancedoptions = { useNewUrlParser: true, useUnifiedTopology: true }
import passport from "passport";
import { Strategy } from "passport-local";

const app = express();
const PORT = 8080;
const router = express.Router();
const http = new createServer(app);
const io = new Server(http);
const URLMONGO = 'mongodb://localhost:27017/ecommerce'

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);

app.use(express.static('public'));

//Obtener Usuario by ID
const GetCredentialsBy_ID = async (ID) => {
    let user;
    try {
        await mongoose.connect(URLMONGO,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 1000
            })
        console.log('Conectando a MongoDB para credenciales');
        user = await UsuarioModel.UsuarioModel.findOne({ '_id': ID }).lean();
    } catch (error) {
        console.log('Error en find:', error);
    } finally {
        await mongoose.connection.close();
        return user;
    }
}

//Obtener Usuario
const GetCredentials = async (usuario) => {
    let user;
    try {
        await mongoose.connect(URLMONGO,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 1000
            })
        console.log('Conectando a MongoDB para credenciales');
        user = await UsuarioModel.UsuarioModel.findOne({ 'user': usuario }).lean();
    } catch (error) {
        console.log('Error en find:', error);
    } finally {
        await mongoose.connection.close();
        return user;
    }
}

const SaveCredentials = async (usuario, clave) => {
    try {
        await mongoose.connect(URLMONGO,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 1000
            })
        console.log('Conectando a MongoDB para credenciales');
        await UsuarioModel.UsuarioModel.insertMany({ 'user': usuario, 'clave': clave });
        console.log("User Registrado!");
    } catch (error) {
        console.log('Error en Insert:', error);
    } finally {
        await mongoose.connection.close();
    }
}

//codigo para SELECT productos
const GetProductos = async () => {
    let productos = [];
    try {
        await mongoose.connect(URLMONGO,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 1000
            })
        console.log('Conectando a MongoDB...');
        productos = await ProductoModel.ProductoModel.find({}).lean();
    } catch (error) {
        console.log('Error en find:', error);
    } finally {
        await mongoose.connection.close();
        return productos;
    }
}

//codigo Insert Into productos
const addProduct = async (P) => {

    try {
        await mongoose.connect(URLMONGO,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 1000
            })
        console.log('Conectando a MongoDB...');
        await ProductoModel.ProductoModel.insertMany(P)
        console.log("¡Producto insertado!");
    } catch (error) {
        console.log('Error en Insert:', error);
    } finally {
        await mongoose.connection.close();
    }

}

//codigo Update productos
const UpdateProducto = async (P, ID) => {
    try {
        await mongoose.connect(URLMONGO,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 1000
            })
        console.log('Conectando a MongoDB...');
        await ProductoModel.ProductoModel.updateMany(ID, { $set: P })
        console.log("¡Producto Actualizado!");
    } catch (error) {
        console.log('Error en UpdateMany:', error);
    } finally {
        await mongoose.connection.close();
    }
}

//Delete Producto
const DeleteProducto = async (ID) => {
    try {
        await mongoose.connect(URLMONGO,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 1000
            })
        console.log('Conectando a MongoDB...');
        await ProductoModel.ProductoModel.deleteMany(ID)
        console.log("¡Producto Eliminado!");
    } catch (error) {
        console.log('Error en Delete:', error);
    } finally {
        await mongoose.connection.close();
    }
}

//codigo para obtener mensajes desde SQLite3
const GetMensajes = async () => {
    let mensajes = [];

    try {
        await mongoose.connect(URLMONGO,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 1000
            })
        console.log('Conectando a MongoDB...');
        mensajes = await MensajesModel.MensajesModel.find({}).lean();
    } catch (error) {
        console.log('Error en find:', error);
    } finally {
        await mongoose.connection.close();
        let c = 1;
        mensajes.map((mes) => {
            mes.author = mes.author[0]
            mes._id = c
            c++
        })
        let messages = {
            id: '666',
            messages: mensajes
        }

        const authorEsquema = new schema.Entity("autores")
        const messagesEsquema = new schema.Entity("mensaje", {
            author: authorEsquema
        }, { idAttribute: "_id" })
        const conversaEsquema = new schema.Entity("conversacion", {
            messages: [messagesEsquema]
        })


        const normalizar = normalize(messages, conversaEsquema);
        const desnormalizar = denormalize(normalizar.result, conversaEsquema, normalizar.entities)

        return [normalizar, desnormalizar]
    }
}

const addConversa = async (M) => {

    try {
        await mongoose.connect(URLMONGO,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 1000
            })
        console.log('Conectando al MongoDB(insert)...');
        await MensajesModel.MensajesModel.insertMany(M)
        console.log("¡Mensaje guardado!");
    } catch (error) {
        console.log('Error en Insert:', error);
    } finally {
        await mongoose.connection.close();
    }
}

class Producto {
    constructor(title, price, thumbnail) {
        this.title = title;
        this.price = price;
        this.thumbnail = thumbnail;
    }

    getObject() {
        return {
            title: this.title,
            price: this.price,
            thumbnail: this.thumbnail
        }
    }
}

const server = http.listen(PORT, () => {
    console.log("Servidor HTTP corriendo en", server.address().port);
});
server.on('error', error => console.log('Error en servidor', error));


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

/*Desafio de Log-in
 router.use(session({
    secret: "fdgs5fsa",
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge:600000}
})) */

router.use(session({
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://Dan:DanUsandoMongo@cluster0.4w0r4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
        mongoOptions: advancedoptions
    }),
    secret: "QPODJSDljhdsa",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 600000 }
}));

router.use(passport.initialize());
router.use(passport.session());

passport.use('signup', new Strategy({
    usernameField: 'user',
    passwordField: 'clave',
    passReqToCallback: true
},
    async function (req, user, clave, done) {
        let credenciales = await GetCredentials(user);
        if (credenciales != undefined) {
            return done(null, false, console.log(user, 'Usuario existente'));
        } else {
            await SaveCredentials(user, clave);
            console.log(credenciales);
            return done(null, await GetCredentials(user))
        }
    }
));

passport.use('login', new Strategy({
    usernameField: 'user',
    passwordField: 'clave',
    passReqToCallback: true
},
    async function (req, user, clave, done) {
        let credenciales = await GetCredentials(user);
        if (credenciales == undefined) {
            return done(null, false, console.log(user, 'usuario no existe'));
        } else {
            if (credenciales.clave == clave) {
                return done(null, credenciales)
            } else {
                return done(null, false, console.log(user, 'clave errónea'));
            }
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    let usuario = await GetCredentialsBy_ID(id);
    done(null, usuario);
});


router.get('/', (req, res) => {
    res.send("<h1>Inicio Del Programa</h1>");
});

const autenticarLogin_signup = async (req, res, next) => {
    if (req.isAuthenticated()) {
        res.render('main', { productos: await GetProductos(), user: req.user.user });
    } else {
        next()
    }
}

const autenticarApp = (req, res, next) => {
    if (req.isAuthenticated()) {
        next()
    } else {
        res.sendFile('login.html', { root: "./public" });
    }
}

router.get('/login', autenticarLogin_signup, async (req, res) => res.sendFile('login.html', { root: "./public" }));
router.post('/login', passport.authenticate('login', { failureRedirect: 'falloLogin' }), (req, res) => res.redirect("productos/vista"));

router.get('/signup', autenticarLogin_signup, async (req, res) => res.sendFile('registro.html', { root: "./public" }));
router.post('/signup', passport.authenticate('signup', { failureRedirect: 'falloRegistro' }), (req, res) => res.redirect("productos/vista"));

router.get('/falloLogin', (req, res) => res.sendFile('errorlogin.html', { root: "./public" }));
router.get('/falloRegistro', (req, res) => res.sendFile('errorRegistro.html', { root: "./public" }));

router.get('/logout', (req, res) => {
    let user = req.user.user;
    req.logout();
    res.send(`
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <div class="alert alert-primary" role="alert">
    Hasta Luego, ${user} </div>`)
});

router.get('/productos/vista', autenticarApp, async (req, res) => res.render('main', { productos: await GetProductos(), user: req.user.user }));

io.on('connection', async (socket) => {
    socket.emit("array", await GetProductos());
    socket.on('update', async (nuevoproducto) => {
        await addProduct(nuevoproducto);
        io.sockets.emit('broadcast', await GetProductos());
    });
    //sockets para el chat
    socket.emit('conversa', await GetMensajes());
    socket.on('updateconversa', async (dataconversa) => {
        await addConversa(dataconversa);
        io.sockets.emit('broadcastchats', await GetMensajes());//recuperamos los datos (normalizados y desnormalizados)
    });
});

router.get('/productos/listar', async (req, res) => {
    let auxpro = await GetProductos();
    console.log(auxpro)
    if (auxpro.length > 0) {
        res.json(auxpro);
    } else {
        res.json({ error: 'no hay productos cargados' })
    }
});

router.get('/productos/listar/:id', async (req, res) => {
    let params = req.params;
    let resultado = { error: 'producto no encontrado' };
    let productos = await GetProductos();
    for (let index = 0; index < productos.length; index++) {
        if (productos[index].id == params.id) {
            resultado = productos[index];
        }
    }

    res.json(resultado)
});

router.post('/productos/guardar', (req, res) => {
    let body = req.body;
    console.log(body)
    const datos = Object.values(body);

    let product = new Producto(datos[0], datos[1], datos[2]);
    addProduct(product.getObject());
    res.json(product.getObject())
});

router.put('/productos/actualizar/:id', async (req, res) => {
    let params = req.params;
    let body = req.body;
    const datos = Object.values(body);
    let oid = mongoose.Types.ObjectId(params.id);

    let productos = await GetProductos();
    let resultado = { error: 'producto no actualizado: no se encontro' };
    for (let index = 0; index < productos.length; index++) {
        if (productos[index]._id.equals(oid)) {
            let product = new Producto(datos[0], datos[1], datos[2]);
            UpdateProducto(product.getObject(), { _id: oid });
            resultado = product.getObject();
        }
    }

    res.json(resultado)
});

router.delete('/productos/borrar/:id', async (req, res) => {
    let params = req.params;
    let oid = mongoose.Types.ObjectId(params.id);

    let resultado = { error: 'producto no eliminado: no se encontro' };
    let productos = await GetProductos();
    for (let index = 0; index < productos.length; index++) {
        if (productos[index]._id.equals(oid)) {
            resultado = productos[index];
        }
    }
    DeleteProducto({ _id: oid });

    res.json(resultado)
});


//Desafio Test View
const ramdomdata = (q) => {
    if (q == 0) return { error: "no hay productos" }
    let ramdomproductos = '';
    for (let i = 0; i < q; i++) {
        ramdomproductos += `
        <tr>
            <td>${faker.commerce.productName()}</td>
            <td>${faker.commerce.price()}</td>
            <td><img width="100px" src=${faker.image.avatar()} alt=""></td>
        </tr>`
    }
    return (`
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <div id="main-container">
    <table class="table table-dark table-striped text-center">
        <tbody id="container-productos">
            <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Foto</th>
            </tr>
            ${ramdomproductos}
            </tbody>
            </table>
            </div>`)
}

router.get('/productos/vista-test', (req, res) => {
    res.send(ramdomdata(10));
});

router.get('/productos/vista-test/:cant', (req, res) => {
    let params = req.params;
    res.send(ramdomdata(params.cant));
});