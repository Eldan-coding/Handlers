import mongoose  from "mongoose";
const MensajesCollection = 'mensajes';

const MensajeEsquema = mongoose.Schema({
    author: {type: Array, require:true},
    fecha: {type: String, require: true},
    text: {type: String, require:true}
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

export default {MensajesModel: mongoose.model(MensajesCollection,MensajeEsquema)};