import { Router } from "express";
import fs from 'fs';

let carts=[];
const existe=fs.existsSync("./src/files/carts.txt");
if(!existe){
    carts=fs.writeFileSync("./src/files/carts.txt", JSON.stringify(carts, null, 2));
}

const RouteCarts=Router();

RouteCarts.get("/:cid", (req,res)=>{
    let carts=JSON.parse(fs.readFileSync("./src/files/carts.txt", "utf-8"));
    const carro=carts.find(item=>item.id==req.params.cid);
    if(!carro){
        res.status(404).send("No se encontró el carrito");
        return false;
    }
    const productos=carro.products;
    res.send("Carrito N°: "+req.params.cid+"\n productos: "+ JSON.stringify(productos));
});

RouteCarts.post("/",(req,res)=>{
    let carts=JSON.parse(fs.readFileSync("./src/files/carts.txt", "utf-8"));
    const ultimoId=carts.reduce((max,carts)=>(carts.id > max? carts.id: max),0);
    const newCart={
        id:ultimoId+1,
        products:[]
    };
    try {
        carts.push(newCart);
        fs.writeFileSync("./src/files/carts.txt", JSON.stringify(carts, null, 2));
        res.send("Se creó el carrito N°: "+(ultimoId+1));
    } catch (error) {
        res.status(500).send("Error al crear el carrito: "+ error.message);
    }
    
});

RouteCarts.post("/:cid/product/:pid",async (req,res)=>{
    let carts=JSON.parse(fs.readFileSync("./src/files/carts.txt", "utf-8"));
    const carro=carts.find(item=>item.id==req.params.cid);
    if(!carro){
        res.status(404).send("No se encuentra el carrito");
        return false;
    }
    const response=await fetch(`http://localhost:8080/api/productos/${req.params.pid}`);
    if(!response.ok){
        res.status(404).send("No existe el producto");
        return false;
    }

    const producto=await response.json();
    const existe = carro.products.find(item => item.idProd === Number(req.params.pid));
    if(existe){
        existe.quantity +=1;
        fs.writeFileSync("./src/files/carts.txt", JSON.stringify(carts, null, 2));
    }
    else{
        carro.products.push({idProd:Number(req.params.pid), quantity: 1});
        fs.writeFileSync("./src/files/carts.txt", JSON.stringify(carts, null, 2));
    }
    
    res.send("El producto se agrego correctamente, carro N°: " +req.params.cid +"\n"+ JSON.stringify(carro));

})

export default RouteCarts;