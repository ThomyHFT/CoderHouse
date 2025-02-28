import mongoose from "mongoose";

const usercollection = "productos";

const userSchema = new mongoose.Schema({
    id: Number,
    title: String,
    descripcion: String,
    code: String,
    price: Number,
    status: Boolean,
    stock: Number,
    category: String,
    thumbnails: Object
})

export const productModel = mongoose.model(usercollection, userSchema);