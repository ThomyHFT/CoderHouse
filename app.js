import { Server } from "socket.io";
import express  from "express";
import RouteProducts from "./src/routes/route.products.js";
import RouteCarts from "./src/routes/route.carts.js";
import handlebars from "express-handlebars"
import __dirname from "./utils.js";
import RouteRealTimeProducts from "./src/routes/route.realTimeProducts.js";
import mongoose from "mongoose"
import { cartModel } from "./src/models/cart.model.js";
import { productModel } from "./src/models/product.model.js";
import mongoosePaginate from "mongoose-paginate-v2";


const servidor= express();
const puerto=8080;
const httpServer=servidor.listen(puerto,()=>{
    console.log("servidor habilitado en el puerto: "+ puerto);
});

const connectDB = async () => {
    try {
    await mongoose.connect("mongodb+srv://ThomyHFT:123@cluster0.xazxy.mongodb.net/Proyecto_Final?retryWrites=true&w=majority&appName=Cluster0");
      console.log("Conectado a MongoDB");
    } catch (error) {
      console.error("Error, no se pudo conectar a la base de datos:", error);
      process.exit(1); //con esto cancelo la ejecucion ya que el programa se basa en la base de datos
    }
  };
  
  connectDB();

  


const socketServer= new Server(httpServer);
const CargarProductos = async () => {
    try {
        return await productModel.find();
    } catch (error) {
        console.error("Error al cargar productos:", error);
        return [];
    }
};


servidor.use(express.json());
servidor.use(express.urlencoded({extended:true}));
servidor.engine("handlebars", handlebars.engine());
servidor.set("views", __dirname + "/src/views");
servidor.set("view engine", "handlebars");
servidor.use(express.static(__dirname+"/src/public"));
servidor.use((err, req, res, next) => {
    console.error("Error en el servidor:", err.stack);
    res.status(500).json({ status: "error", message: "Error interno del servidor" });
});
servidor.use("/api/productos", RouteProducts);
servidor.use("/api/carts", RouteCarts);
servidor.use("/realtimeproducts", RouteRealTimeProducts);
servidor.get("/", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        
        let query = {};
        
        if (req.query.query) {
            query.category = req.query.query; 
        }

        if (req.query.available !== undefined) {
            query.status = req.query.available === "true";
        }

        const sort = req.query.sort ? { price: req.query.sort === "asc" ? 1 : -1 } : {};

        const result = await productModel.paginate(query, { limit, page, sort, lean: true });

        res.render("home", {
            products: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/?limit=${limit}&page=${result.page - 1}` : null,
            nextLink: result.hasNextPage ? `/?limit=${limit}&page=${result.page + 1}` : null
        });

        console.log(result);

    } catch (error) {
        res.status(500).send("Error al obtener productos: " + error.message);
        next(error)
    }
});


servidor.get("/carts/:cid", async (req, res) => {
    try {
        const carro = await cartModel.findOne({ id: req.params.cid }).populate('products.idProd').lean();
        //utilice .lean() debido a un error de handlebars con las propiedades como 
        // _id que trae de la base de datos
        if (!carro) {
            return res.status(404).send("Carrito no encontrado");
        }

        res.render("cart", { carro});
    } catch (error) {
        res.status(500).send("Error al obtener el carrito: " + error.message);
        next(error)
    }
});


socketServer.on("connection", socket => {
    console.log("Nuevo cliente conectado");

    //cargar inicialmemte los productos
    CargarProductos().then(productos => {
        socket.emit("productos", productos);
    }).catch(error => {
        console.error("Error al cargar productos:", error);
    });

    socket.on("productos", async (data) => {
        try {
            const response = await productModel.create(data);
            
            if(!response){
                socket.emit("errorAgregar", "Error al agregar el nuevo producto")
            }
            else{
                CargarProductos().then(productos => {
                    socket.emit("productos", productos);
                }).catch(error => {
                    console.error("Error al cargar productos:", error);
                });
            }
        } catch (error) {
            console.error('Error al agregar producto:', error);
            socket.emit('errorAgregar', 'Error al agregar el producto');
        }
    });

    //espero el id para eliminar el producto
    socket.on("eliminarProducto", async (data) => {
        try {
            const resultado = await productModel.deleteOne({ id: Number(data) });
    
            if (resultado.deletedCount === 0) {
                socket.emit("respuestaEliminar", "Error: No se encontró el producto");
            } else {
                socket.emit("respuestaEliminar", "Producto eliminado correctamente");
            }
    
            CargarProductos().then(productos => {
                socket.emit("productos", productos);
            }).catch(error => {
                console.error("Error al cargar productos:", error);
            });
    
        } catch (error) {
            console.error("Error en eliminación:", error);
            socket.emit("respuestaEliminar", "Error al eliminar el producto");
        }
    });
    

});