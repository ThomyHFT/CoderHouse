import { Router } from "express";
import { productModel } from "../models/product.model.js";

const RouteRealTimeProducts=Router();



RouteRealTimeProducts.get("/", async (req, res)=>{
    try {
        // Hacer fetch para obtener los productos en formato JSON
        const products = await productModel.find();
        // Renderizar la vista pasando los productos
        res.render("realTimeProducts", { products: products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error al obtener productos');
    }
})

export default RouteRealTimeProducts;