import mongoose  from "mongoose";
const usuariosCollection = 'usuarios';

const UsuarioEsquema = mongoose.Schema({
    user: {type: String, require:true},
    clave: {type: String, require:true}
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

export default {UsuarioModel: mongoose.model(usuariosCollection,UsuarioEsquema)};