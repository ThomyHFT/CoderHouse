document.addEventListener("DOMContentLoaded", () => {
    const socket = io();

    //dinamismo de la vista
        const agregarProductoBtn = document.getElementById('agregarProductoBtn');
        const formularioProducto = document.getElementById('formularioProducto');
        agregarProductoBtn.addEventListener('click', () => {
            formularioProducto.style.display = formularioProducto.style.display === 'none' ? 'block' : 'none';
        });

        const eliminarProductoBtn = document.getElementById('eliminarProductoBtn');
        const selectEliminar = document.getElementById('selectEliminar');

        eliminarProductoBtn.addEventListener('click', () => {
            selectEliminar.style.display = selectEliminar.style.display === 'none' ? 'block' : 'none';
        });
    //

    //cargar los productos
    function actualizarListaProductos(productos) {
        const productosList = document.getElementById("productosList");
        productosList.innerHTML = ""; 
    
        productos.forEach(producto => {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${producto.title}</strong>
                <p>${producto.descripcion}</p>
                <p>Precio: $${producto.price}</p>
                <p>Stock: ${producto.stock}</p>
            `;
            productosList.appendChild(li);
        });

        const productoEliminarSelect = document.getElementById("productoEliminar");
        productoEliminarSelect.innerHTML = ""; 

        productos.forEach(producto => {
            const option = document.createElement("option");
            option.value = producto.id;
            option.textContent = producto.title;
            productoEliminarSelect.appendChild(option);
        });
    }

    //agregar producto
    const form = document.getElementById('nuevoProductoForm'); 
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();  
            const selectElement = document.getElementById('status');
            const selectedValue = selectElement.options[selectElement.selectedIndex].text;
            const status= selectedValue==="Disponible"? true : false;
            
            
            const productData = {
                title: document.getElementById('title').value,
                descripcion: document.getElementById('descripcion').value,
                code: document.getElementById('code').value,
                price: document.getElementById('price').value,
                status: status,
                stock: document.getElementById('stock').value,
                category: document.getElementById('category').value,
                thumbnails: {},
            };
            socket.emit("productos", productData);
            alert("Se agrego correctamente el producto")
            form.reset();
        });
    } else {
        console.log("No se encontró el formulario con id 'nuevoProductoForm'.");
    }

    //actualizaciones
    socket.on("productos", (productos) => {
        actualizarListaProductos(productos);
        const formulario=document.getElementById("formularioProducto");
        formulario.style.display = 'none';
    });

    socket.on("errorAgregar", data=>{
        alert(data);
    })

    //eliminar un producto
    const eliminarProductoBtn2 = document.getElementById('eliminarProducto');
        eliminarProductoBtn2.addEventListener('click', function() {
            const productoId = document.getElementById('productoEliminar').value;
            if (productoId) {
                socket.emit("eliminarProducto", productoId)
                socket.on("respuestaEliminar", data=>{
                    alert(data);
                    const selector=document.getElementById("selectEliminar")
                    selector.style.display = 'none';
                })
            } else {
                alert("Por favor, selecciona un producto para eliminar.");
            }
        });
});


