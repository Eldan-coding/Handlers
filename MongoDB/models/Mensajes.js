import mongoose  from "mongoose";
const MensajesCollection = 'mensajes';

const MensajeEsquema = mongoose.Schema({
    correo: {type: String, require:true},
    fecha: {type: String, require:true},
    mensaje: {type: String, require:true}
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

export default {MensajesModel: mongoose.model(MensajesCollection,MensajeEsquema)};