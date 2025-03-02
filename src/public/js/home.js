document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", async(event) => {
            const productId = event.target.getAttribute("data-id");
            console.log("Producto agregado al carrito con ID:", productId);
            const cartId = 1; 

            try{
                const response= await fetch(`/api/carts/${cartId}/product/${productId}`, {
                    method: "POST",
                })
                if(!response.ok){
                    console.log("Error no se pudo agregar el producto")
                }
                else{
                    alert("producto agregado al carro")
                }
            }
            catch (e){

            }
            
        });
    });
});