import { Server } from "socket.io";
import express  from "express";
import RouteProducts from "./src/routes/route.products.js";
import RouteCarts from "./src/routes/route.carts.js";
import handlebars from "express-handlebars"
import __dirname from "./utils.js";
import RouteRealTimeProducts from "./src/routes/route.realTimeProducts.js";




const servidor= express();
const puerto=8080;
const httpServer=servidor.listen(puerto,()=>{
    console.log("servidor habilitado en el puerto: "+ puerto);
});
const socketServer= new Server(httpServer);
const  CargarProductos = async()=>{
    const response = await fetch(`http://localhost:8080/api/productos/`);
    const productos=await response.json();
    return productos
}

servidor.use(express.json());
servidor.use(express.urlencoded({extended:true}));
servidor.engine("handlebars", handlebars.engine());
servidor.set("views", __dirname + "/src/views");
servidor.set("view engine", "handlebars");
servidor.use(express.static(__dirname+"/src/public"));
servidor.use("/api/productos", RouteProducts);
servidor.use("/api/carts", RouteCarts);
servidor.use("/realtimeproducts", RouteRealTimeProducts);
servidor.get("/", async(req,res)=>{
    const products= await CargarProductos();
    res.render("home", {products})
})



socketServer.on("connection", socket => {
    console.log("Nuevo cliente conectado");

    //cargar inicialmemte los productos
    CargarProductos().then(productos => {
        socket.emit("productos", productos);
    }).catch(error => {
        console.error("Error al cargar productos:", error);
    });

    //aqui recibire el producto a agregar
    socket.on("productos", async (data) => {
        try {
            const response = await fetch('http://localhost:8080/api/productos/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if(response.status===200){
                CargarProductos().then(productos => {
                    socket.emit("productos", productos);
                }).catch(error => {
                    console.error("Error al cargar productos:", error);
                });
            }
            else{
                socket.emit("errorAgregar", "Error al agregar el nuevo producto")
            }

            
            

        } catch (error) {
            console.error('Error al agregar producto:', error);
            socket.emit('errorAgregar', 'Error al agregar el producto');
        }
    });

    //espero el id para eliminar el producto
    socket.on("eliminarProducto", async data=>{
        try{
            const response = await fetch(`http://localhost:8080/api/productos/${data}`, {
                method: "DELETE",
            });
            if(response.status===200){
                socket.emit("respuestaEliminar", "se elimino correctamente el producto")
            }
            else{
                socket.emit("respuestaEliminar", "error al eliminar el producto")
            }
            CargarProductos().then(productos => {
                socket.emit("productos", productos);
            }).catch(error => {
                console.error("Error al cargar productos:", error);
            });

        }
        catch (e){
                console.error(e)
        }
        
    })

});