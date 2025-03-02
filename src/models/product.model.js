import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

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
userSchema.plugin(mongoosePaginate);

export const productModel = mongoose.model(usercollection, userSchema);