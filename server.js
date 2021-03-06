import express from "express";
import handlebars from "express-handlebars";
import { createServer } from "http";
import { Server } from "socket.io";
import fs from "file-system";
/* import options from './MariaDB/options/mariaDB.js';
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
import { Strategy as FacebookStrategy } from "passport-facebook";
import { fork } from "child_process";
import { cpus } from "os";
//import cluster from "cluster";
import compression from "compression";
import log4js from "log4js";
import nodemailer from "nodemailer";
import twilio from "twilio";

const twilioClient= twilio("ACe1a9239a92a467ef59af396f6ab13392", "4be4f842b61cc0e059ae5b6ec7ba9cc0");

//Para convertir en HTTPS
import https from 'https';
import path from 'path'; 
const httpsOptions = {
    key: fs.readFileSync('./SSLCert/cert.key'),
    cert: fs.readFileSync('./SSLCert/cert.pem')
}

const app = express();
const PORT = 8443;
const router = express.Router();
const WebProtocol = https.createServer(httpsOptions,app);
const io = new Server(WebProtocol);
const URLMONGO = 'mongodb://localhost:27017/ecommerce'

let parametrosDeInicio = process.argv.slice(2);
let PUERTO;
let FACEBOOK_CLIENT_ID = '1592840727737592';
let FACEBOOK_CLIENT_SECRET = '0b7019db4c08bc888caf6762197754cb';
let MODO = parametrosDeInicio[3];
if(parametrosDeInicio.length>3){
    PUERTO=parametrosDeInicio[0];
    FACEBOOK_CLIENT_ID=parametrosDeInicio[1];
    FACEBOOK_CLIENT_SECRET=parametrosDeInicio[2];
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

app.use('/api', router);

app.use(express.static('public'));

log4js.configure({
    appenders:{
        fileWarnAppender: { type: "file", filename: 'public/logs/warn.log'},
        fileErrorAppender: { type: "file", filename: 'public/logs/error.log'},
        consoleAppender: { type: "console"}
    },
    categories:{
        default: { appenders: ["consoleAppender"], level: "trace"},
        warn: { appenders: ["fileWarnAppender"], level: "warn"},
        error: { appenders: ["fileErrorAppender"], level: "error"}
    }
});

const logger= log4js.getLogger();
const loggerW= log4js.getLogger("warn");
const loggerE= log4js.getLogger("error");

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
        logger.info('Conectando a MongoDB para credenciales');
        user = await UsuarioModel.UsuarioModel.findOne({ '_id': ID }).lean();
    } catch (error) {
        logger.error('Error en find:', error);
        loggerE.error('Error en find:', error);
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
        console.log("??Producto insertado!");
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
        console.log("??Producto Actualizado!");
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
        console.log("??Producto Eliminado!");
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
        console.log("??Mensaje guardado!");
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

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "daniel.castrov.98@gmail.com",
        pass: "hdwwbhcnftknrmsn"
    },
    tls: {
      rejectUnauthorized: false
    }
});


const server = WebProtocol.listen(PUERTO || PORT, () => {
    logger.info("Servidor HTTPS corriendo en", server.address().port);
});;

/* if ((cluster.isMaster && MODO=="CLUSTER") || cluster.isWorker){
    server = WebProtocol.listen(PUERTO || PORT, () => {
        logger.info("Servidor HTTPS corriendo en", server.address().port);
    });
    server.on('error', error => console.log('Error en servidor', error));   
    logger.info(`Servidor Corriendo en Modo ${MODO}`)
}else if(MODO=="FORK" || MODO== undefined){
    cluster.fork();
    cluster.on('exit', (worker, code, signal) => { 
        loggerW.warn(`Worker ${worker.process.pid} died`)
    });
} */

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
                return done(null, false, console.log(user, 'clave err??nea'));
            }
        }
    })
);

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_CLIENT_ID,
    clientSecret: FACEBOOK_CLIENT_SECRET,
    callbackURL: "https://localhost:8443/api/auth/facebook/vista",
    profileFields: ['id', 'displayName', 'emails', 'photos']
  },
  async function(accessToken, refreshToken, profile, cb) {
    let credenciales = await GetCredentials(profile.displayName);
    if (credenciales != undefined) {
        return cb(null, credenciales);
    } else {
        await SaveCredentials(profile.displayName, profile.id);//usamos el display como user y el id como clave
        return cb(null, await GetCredentials(profile.displayName))
    }
  }
));

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

router.get('/info', (req, res) => {
    /* console.log({
        argumentos:  process.argv,
        OS: process.platform,
        nodeVersion: process.version,
        memoria: process.memoryUsage(),
        rutaEjecucion: process.argv[1],
        processID: process.pid,
        carpetaCorriente: process.cwd(),
        NumeroProcesadores: cpus().length
    }) */
    res.json({
        argumentos:  process.argv,
        OS: process.platform,
        nodeVersion: process.version,
        memoria: process.memoryUsage(),
        rutaEjecucion: process.argv[1],
        processID: process.pid,
        carpetaCorriente: process.cwd(),
        NumeroProcesadores: cpus().length
    });
});


router.get('/ramdoms', (req, res) => {
    /* const NA = fork("./numerosAleatorios.js");
    NA.send('start');
    NA.on('message', datos=>res.end(datos)); */
    console.log("no bloquea");
});

router.get('/ramdoms/:canti', (req, res) => {
    /* const NA2 = fork("./numerosAleatorios.js");
    NA2.send(req.params.canti);
    NA2.on('array', datos=>res.end(datos)); */
    console.log("no bloquea");
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
        const d=new Date();
         transporter.sendMail({
            from: "NodeJs Login y Logout",
            to: `daniel.castrov.98@gmail.com`,
            subject: `login ${req.user.user} ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`,
            html: "Datos de Login"
        })
        next()
    } else {
        res.sendFile('login.html', { root: "./public" });
    }
}

///////FACEBOOK 
router.get('/auth/facebook',
  passport.authenticate('facebook'));

router.get('/auth/facebook/vista',
  passport.authenticate('facebook', { failureRedirect: 'falloLogin' }),
  function(req, res) {
    res.redirect("/api/productos/vista");
  });


router.get('/login', autenticarLogin_signup, async (req, res) => res.sendFile('login.html', { root: "./public" }));
router.post('/login', passport.authenticate('login', { failureRedirect: 'falloLogin' }), (req, res) => res.redirect("productos/vista"));

router.get('/signup', autenticarLogin_signup, async (req, res) => res.sendFile('registro.html', { root: "./public" }));
router.post('/signup', passport.authenticate('signup', { failureRedirect: 'falloRegistro' }), (req, res) => res.redirect("productos/vista"));

router.get('/falloLogin', (req, res) => res.sendFile('errorlogin.html', { root: "./public" }));
router.get('/falloRegistro', (req, res) => res.sendFile('errorRegistro.html', { root: "./public" }));

router.get('/logout', (req, res) => {
    let user = req.user.user;
    req.logout();
    const d=new Date();
    transporter.sendMail({
       from: "NodeJs Login y Logout",
       to: `daniel.castrov.98@gmail.com`,
       subject: `logout ${user} ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`,
       html: "Datos de Logout"
   })
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
        const regex = /administrador/gm
        if (regex.test(dataconversa.text)){
            await twilioClient.messages.create({
                body: `El usuario '${dataconversa.nombre}' envio: '${dataconversa.text}' `,
                from: "+19402835485",
                to: "+573004405955"
            })
        }
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