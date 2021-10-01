"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _expressHandlebars = require("express-handlebars");

var _expressHandlebars2 = _interopRequireDefault(_expressHandlebars);

var _http = require("http");

var _socket = require("socket.io");

var _fileSystem = require("file-system");

var _fileSystem2 = _interopRequireDefault(_fileSystem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var app = (0, _express2.default)();
var PORT = 8080;
var router = _express2.default.Router();
var http = new _http.createServer(app);
var io = new _socket.Server(http);

app.use(_express2.default.json());
app.use(_express2.default.urlencoded({ extended: true }));

app.use('/api', router);

app.use(_express2.default.static('public'));

var productos = [];
var id = 0;
var mensajes = JSON.parse(_fileSystem2.default.readFileSync('public/chat.txt', "utf-8"));

var Producto = function () {
    function Producto(title, price, thumbnail, id) {
        _classCallCheck(this, Producto);

        this.title = title;
        this.price = price;
        this.thumbnail = thumbnail;
        this.id = id;
    }

    _createClass(Producto, [{
        key: "getObject",
        value: function getObject() {
            return {
                title: this.title,
                price: this.price,
                thumbnail: this.thumbnail,
                id: this.id
            };
        }
    }]);

    return Producto;
}();

var getID = function getID() {
    id++;
    return id;
};

var addProduct = function addProduct(P) {
    productos.push(P);
};

var addConversa = function addConversa(chat) {
    mensajes.push(chat);
};

var server = http.listen(PORT, function () {
    console.log("Servidor HTTP corriendo en", server.address().port);
});
server.on('error', function (error) {
    return console.log('Error en servidor', error);
});

app.engine("hbs", (0, _expressHandlebars2.default)({
    extname: ".hbs",
    defaultLayout: "index.hbs",
    layoutsDir: "views/layouts",
    partialsDir: "views/partials"
}));

app.set('views', './views'); // especifica el directorio de vistas
app.set('view engine', 'hbs'); // registra el motor de plantillas

router.get('/', function (req, res) {
    res.send("<h1>Inicio Del Programa</h1>");
});

router.get('/productos/vista', function (req, res) {
    res.render('main', { productos: productos, mensajes: mensajes });
});

io.on('connection', function (socket) {
    socket.emit("array", productos);
    socket.on('update', function (datacliente) {
        productos = datacliente;
        io.sockets.emit('broadcast', productos);
    });
    //sockets para el chat
    socket.emit('conversa', mensajes);
    socket.on('updateconversa', function (dataconversa) {
        addConversa(dataconversa);
        _fileSystem2.default.writeFileSync('public/chat.txt', JSON.stringify(mensajes, null, "\t"));
        io.sockets.emit('broadcastchats', dataconversa);
    });
});

router.get('/productos/listar', function (req, res) {
    if (productos.length > 0) {
        res.json(productos);
    } else {
        res.json({ error: 'no hay productos cargados' });
    }
});

router.get('/productos/listar/:id', function (req, res) {
    var params = req.params;
    var resultado = { error: 'producto no encontrado' };
    for (var index = 0; index < productos.length; index++) {
        if (productos[index].id == params.id) {
            resultado = productos[index];
        }
    }

    res.json(resultado);
});

router.post('/productos/guardar', function (req, res) {
    var body = req.body;
    console.log(body);
    var datos = Object.values(body);

    var product = new Producto(datos[0], datos[1], datos[2], getID());
    addProduct(product.getObject());
    res.json(product.getObject());
});

router.put('/productos/actualizar/:id', function (req, res) {
    var params = req.params;
    var body = req.body;
    var datos = Object.values(body);

    var resultado = { error: 'producto no actualizado: no se encontro' };
    for (var index = 0; index < productos.length; index++) {
        if (productos[index].id == params.id) {
            var product = new Producto(datos[0], datos[1], datos[2], params.id);
            productos[index] = product.getObject();
            resultado = product.getObject();
        }
    }

    res.json(resultado);
});

router.delete('/productos/borrar/:id', function (req, res) {
    var params = req.params;

    var arrayAux = [];
    var resultado = { error: 'producto no eliminado: no se encontro' };
    for (var index = 0; index < productos.length; index++) {
        if (productos[index].id == params.id) {
            resultado = productos[index];
        } else {
            arrayAux.push(productos[index]);
        }
    }
    productos = arrayAux;

    res.json(resultado);
});
