import { Router } from "express";

const RouteRealTimeProducts=Router();



RouteRealTimeProducts.get("/", async (req, res)=>{
    try {
        // Hacer fetch para obtener los productos en formato JSON
        const response = await fetch(`http://localhost:8080/api/productos/?format=json`);
        const products = await response.json();  // Aquí obtienes los productos en formato JSON

        // Renderizar la vista pasando los productos
        res.render("realTimeProducts", { products: products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error al obtener productos');
    }
})

export default RouteRealTimeProducts;