import { Router } from "express";
import { cartModel } from "../models/cart.model.js";
import { productModel } from "../models/product.model.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;


const RouteCarts=Router();

RouteCarts.get("/:cid", async (req, res) => {
    try {
      
      const carro = await cartModel.findOne({ id: req.params.cid }).populate("products.idProd"); 
  
      if (!carro) {
        return res.status(404).send("No se encontró el carrito");
      }
  
      
      res.send("Carrito N°: " + req.params.cid + "\n Productos: " + JSON.stringify(carro.products));
    } catch (error) {
      res.status(500).send("Error al obtener el carrito: " + error.message);
    }
  });

RouteCarts.post("/",async(req,res)=>{

    try{
        let carts= await cartModel.find();
        const ultimoId=carts.reduce((max,carts)=>(carts.id > max? carts.id: max),0);
        const newCart={
        id:ultimoId+1,
        products:[]
        };
        let resultado = await cartModel.create(newCart)
       
        res.send("Se creó el carrito N°: "+(ultimoId+1));
    }
    catch(error){
        res.status(500).send("Error al crear el carrito: "+ error.message);
    }

 
});

RouteCarts.post("/:cid/product/:pid",async (req,res)=>{

    try{
        let carts= await cartModel.find();
        let carro=carts.find(item=>item.id==req.params.cid);
        if(!carro){
            try{
                const ultimoId=carts.reduce((max,carts)=>(carts.id > max? carts.id: max),0);
                const newCart={
                id:ultimoId+1,
                products:[]
                };
                let resultado = await cartModel.create(newCart)
                carro= resultado;
                console.log(resultado)
            }
            catch(error){
                res.status(500).send("Error al crear el carrito: "+ error.message);
            }
        }
        const productID=new ObjectId(req.params.pid)
        const product=await productModel.findOne({_id: productID })
        if(!product){
            res.status(404).send("No existe el producto");
            return false;
        }
        console.log(product);
        
        const existe = carro.products.find(item => item.idProd.equals(productID));
        
        
        if(existe){
          const update = await cartModel.updateOne(
            { id: req.params.cid, "products.idProd": productID },
            { $inc: { "products.$.quantity": 1 } }
          );
            res.send("Se actualizo la cantidad del producto, carro N°: " +req.params.cid +"\n"+ JSON.stringify(carro));

        }
        else{
            
            let newProduct = {
                idProd: productID,
                quantity: 1
            };
        
            carro.products.push(newProduct);
        
            let update = await cartModel.updateOne({ id: Number(req.params.cid) }, { $set: { products: carro.products } });
            
            res.send("El producto se agrego correctamente, carro N°: " +req.params.cid +"\n"+ JSON.stringify(carro));

        }
    }
    catch(error){
        res.status(404).send("No se pudo actualizar el carro"+ error);
    }
    
    
})

RouteCarts.put("/:cid/products/:pid", async (req, res) => {
  try {
      const { quantity } = req.body;
      console.log(quantity)

      if (!quantity || quantity < 1) {
          return res.status(400).send("La cantidad debe ser un número mayor a 0");
      }

      const carro = await cartModel.findOne({ id: Number(req.params.cid) });

      if (!carro) {
          return res.status(404).send("No se encontró el carrito");
      }

      const productID = new ObjectId(req.params.pid);
      const existe = carro.products.find(item => item.idProd.equals(productID));

      if (!existe) {
          return res.status(404).send("El producto no está en el carrito");
      }

      await cartModel.updateOne(
          { id: Number(req.params.cid), "products.idProd": productID },
          { $set: { "products.$.quantity": quantity } }
      );

      res.send(`Cantidad del producto ${req.params.pid} en el carrito N° ${req.params.cid} actualizada a ${quantity}`);
  } catch (error) {
      console.error("Error al actualizar la cantidad del producto:", error);
      res.status(500).send("Hubo un problema al actualizar la cantidad del producto");
  }
});

RouteCarts.put("/:cid", async (req, res) => {
  try {
      const { products } = req.body;

      if (!Array.isArray(products)) {
          return res.status(400).send("El formato de productos no es válido, debe ser un array");
      }

      const carro = await cartModel.findOne({ id: Number(req.params.cid) });

      if (!carro) {
          return res.status(404).send("No se encontró el carrito");
      }

      // Validamos que los productos existan en la base de datos
      for (const item of products) {
          const product = await productModel.findById(item.idProd);
          if (!product) {
              return res.status(404).send(`El producto con ID ${item.idProd} no existe`);
          }
      }

      // Actualizar solo los productos en el carrito
      await cartModel.updateOne(
          { id: Number(req.params.cid) },
          { $set: { products } }
      );

      res.send(`Carrito N° ${req.params.cid} actualizado correctamente`);
  } catch (error) {
      console.error("Error al actualizar el carrito:", error);
      res.status(500).send("Hubo un problema al actualizar el carrito");
  }
});



RouteCarts.delete("/:cid/products/:pid", async (req, res) => {
    try {
        
        let carro = await cartModel.findOne({ id: Number(req.params.cid) });

        
        if (!carro) {
            return res.status(404).send("No se encontró el carrito");
        }

        
        const productIndex = carro.products.findIndex(item => item.idProd === Number(req.params.pid));

       
        if (productIndex === -1) {
            return res.status(404).send("Producto no encontrado en el carrito");
        }

        
        carro.products.splice(productIndex, 1);

        await cartModel.updateOne({ id: Number(req.params.cid) }, { $set: { products: carro.products } });
        res.send(`Producto eliminado correctamente del carrito N°: ${req.params.cid}\n` + JSON.stringify(carro));
    } catch (error) {
        console.error("Error al eliminar producto del carrito:", error);
        res.status(500).send("Hubo un problema al eliminar el producto del carrito");
    }
});

RouteCarts.delete("/:cid", async (req, res) => {
    try {
        let carro = await cartModel.findOne({ id: Number(req.params.cid) });

        if (!carro) {
            return res.status(404).send("No se encontró el carrito");
        }

        carro.products = [];

        await cartModel.updateOne(
            { id: Number(req.params.cid) },
            { $set: { products: carro.products } }
        );

        res.send(`Todos los productos han sido eliminados del carrito N°: ${req.params.cid}`);
    } catch (error) {
        console.error("Error al eliminar los productos del carrito:", error);
        res.status(500).send("Hubo un problema al eliminar los productos del carrito");
    }
});


export default RouteCarts;