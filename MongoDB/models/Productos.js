import mongoose  from "mongoose";
const productosCollection = 'productos';

const ProductoEsquema = mongoose.Schema({
    title: {type: String, require:true},
    price: {type: Number, require:true},
    thumbnail: {type: String, require:true},
    stock: {type: Number, require:true}
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

export default {ProductoModel: mongoose.model(productosCollection,ProductoEsquema)};