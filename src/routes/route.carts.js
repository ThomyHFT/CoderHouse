import { Router } from "express";
import { cartModel } from "../models/cart.model.js";
import { productModel } from "../models/product.model.js";


const RouteCarts=Router();

RouteCarts.get("/:cid", async (req, res) => {
    try {
      
      const carro = await cartModel.findOne({ id: req.params.cid }).populate("products.idProd"); 
  
      if (!carro) {
        return res.status(404).send("No se encontró el carrito");
      }
  
      
      res.send("Carrito N°: " + req.params.cid + "\n Productos: " + JSON.stringify(carro.products));
    } catch (e) {
      res.status(500).send("Error al obtener el carrito: " + e.message);
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
    catch(e){
        res.status(500).send("Error al crear el carrito: "+ error.message);
    }

 
});

RouteCarts.post("/:cid/product/:pid",async (req,res)=>{

    try{
        let carts= await cartModel.find();
        const carro=carts.find(item=>item.id==req.params.cid);
        if(!carro){
            res.status(404).send("No se encuentra el carrito");
            return false;
        }
        const product=await productModel.findOne({id:Number(req.params.pid)})
        if(!product.ok){
            res.status(404).send("No existe el producto");
            return false;
        }
        const producto=await product.json();
        const existe = carro.products.find(item => item.idProd === Number(req.params.pid));
        if(existe){
            existe.quantity+=1;
            let update = await cartModel.updateOne(
                { id: Number(req.params.cid), "products.idProd": Number(req.params.pid) },
                { $set: { "products.$.quantity": existe.quantity } } 
            );
            res.send("Se actualizo la cantidad del producto, carro N°: " +req.params.cid +"\n"+ JSON.stringify(carro));

        }
        else{
            
            let newProduct = {
                idProd: Number(req.params.pid),
                quantity: 1
            };
        
            carro.products.push(newProduct);
        
            let update = await cartModel.updateOne({ id: Number(req.params.cid) }, { $set: { products: carro.products } });
            
            res.send("El producto se agrego correctamente, carro N°: " +req.params.cid +"\n"+ JSON.stringify(carro));

        }
    }
    catch(e){
        res.status(404).send("No se pudo actualizar el carro");
    }
    
    
   
    
    
})

RouteCarts.post("/:cid/product/:pid", async (req, res) => {
    try {
      let cart = await cartModel.findOne({ id: req.params.cid });
  
      if (!cart) {
        return res.status(404).send("Carrito no encontrado");
      }
  
  
      const product = await productModel.findOne({ id: Number(req.params.pid) });
  
      if (!product) {
        return res.status(404).send("Producto no encontrado");
      }
  
 
      const existingProduct = cart.products.find(p => p.idProd.toString() === product._id.toString());
  
      if (existingProduct) {
       
        existingProduct.quantity += req.body.quantity || 1; 
      } else {
       
        cart.products.push({
          idProd: product._id,
          quantity: req.body.quantity || 1 
        });
      }
  
      await cart.save(); 
      res.send("Producto actualizado correctamente en el carrito");
  
    } catch (e) {
      res.status(500).send("Error al actualizar el carrito: " + e.message);
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
    } catch (e) {
        console.error("Error al eliminar producto del carrito:", e);
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
    } catch (e) {
        console.error("Error al eliminar los productos del carrito:", e);
        res.status(500).send("Hubo un problema al eliminar los productos del carrito");
    }
});


export default RouteCarts;