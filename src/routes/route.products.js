
import { Router } from "express";
import fs from 'fs';
import { productModel } from "../models/product.model.js";

const RouteProducts=Router();
RouteProducts.get("/",async(req,res)=>{

    try{
        let productos= await productModel.find()
        const limit=req.query.limit;
        res.send(limit? products.slice(0,limit): productos)

    }
    catch(e){
        res.status(404).send("No se encontró el producto");
    }
});


RouteProducts.get("/:pid",async(req,res)=>{

    try{
        let productos= await productModel.find()
        const producto=productos.find(item=>item.id=== Number(req.params.pid));
        res.send(producto)

    }
    catch(e){
        res.status(404).send("No se encontró el producto");
    }
    
})

RouteProducts.post("/", async(req,res)=>{

    try{
        let products= await productModel.find()
        const ultimoId=products.reduce((max,products)=>(products.id > max? products.id: max),0);
        const newProduct={
            id:ultimoId+1,
            title:req.body.title,
            descripcion:req.body.descripcion,
            code:req.body.code,
            price:req.body.price,
            status:req.body.status,
            stock:req.body.stock,
            category:req.body.category,
            thumbnails: req.body.thumbnails || [],
        };

        let resutado = await productModel.create(newProduct)
        res.send("Se agrego el nuevo producto")
        

    }
    catch(e){
        res.status(404).send("No se actualizó el producto.");
    }

    
    
})

RouteProducts.put("/:pid",async(req,res)=>{

    try{
        let products= await productModel.find()
        const producto=products.find(item=>item.id=== Number(req.params.pid));
        let resultado = await productModel.updateOne({id:Number(req.params.pid)}, { $set: req.body } )
        res.send("Producto Actualizado")
    }
    catch(e){
        res.status(404).send("No se encontró el producto.");
    }
})

RouteProducts.delete("/:pid", async(req, res) => {

    try{
        let resultado= await productModel.deleteOne({id:Number(req.params.pid)})
        res.send("se eliminó correctamente")
    }
    catch(e){
         res.status(404).send("No se eliminó el producto.");
    }
});





export default RouteProducts;