
import { Router } from "express";
import fs from 'fs';

const RouteProducts=Router();
let products=[];
const existe=fs.existsSync("./src/files/products.txt");
if(!existe){
    products=fs.writeFileSync("./src/files/products.txt", JSON.stringify(products, null, 2));
}



RouteProducts.get("/",(req,res)=>{
    let products=JSON.parse(fs.readFileSync("./src/files/products.txt", "utf-8"));
    const limit=req.query.limit;
    res.send(limit? products.slice(0,limit): products)
});


RouteProducts.get("/:pid",(req,res)=>{
    let products=JSON.parse(fs.readFileSync("./src/files/products.txt", "utf-8"));
    const producto=products.find(item=>item.id=== Number(req.params.pid));

    if (producto) {
        return res.status(200).json(producto);
    } else {
        return res.status(404).send("No se encontró el producto");
    }
})

RouteProducts.post("/", (req,res)=>{
    products=JSON.parse(fs.readFileSync("./src/files/products.txt", "utf-8"));
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
        thumbnails:req.body.thumbnails
    };

    try {
        products.push(newProduct);
        fs.writeFileSync("./src/files/products.txt", JSON.stringify(products, null, 2));
        res.send("Se agrego el nuevo producto: "+ JSON.stringify(newProduct))
    } catch (error) {
        res.status(500).send("Error al crear el producto: "+ error.message);
    }
    
    
})

RouteProducts.put("/:pid",(req,res)=>{
    let products=JSON.parse(fs.readFileSync("./src/files/products.txt", "utf-8"));
    const producto=products.find(item=>item.id=== Number(req.params.pid));
    if(producto){
        Object.assign(producto,req.body);
        fs.writeFileSync("./src/files/products.txt", JSON.stringify(products, null, 2));
        res.send("Producto actualizado: "+ JSON.stringify(producto));
    }
    else{
        res.status(404).send("No se encontró el producto.");
    }
})

RouteProducts.delete("/:pid", (req, res) => {
    let products = JSON.parse(fs.readFileSync("./src/files/products.txt", "utf-8"));

    const producto = products.find(item => item.id === Number(req.params.pid));

    if (!producto) {
        return res.status(404).send("No se encontró el producto.");
    }

    products = products.filter(item => item.id !== Number(req.params.pid));

    fs.writeFileSync("./src/files/products.txt", JSON.stringify(products, null, 2));

    res.send(`Producto eliminado correctamente: ${JSON.stringify(producto)}`);
});





export default RouteProducts;