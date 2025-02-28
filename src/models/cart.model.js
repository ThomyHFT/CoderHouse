import mongoose from "mongoose";

const usercollection = "carts";

const userSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  products: [
    {
      idProd: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "productos", 
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ]
});

export const cartModel = mongoose.model(usercollection, userSchema);
