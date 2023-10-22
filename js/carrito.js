let productosEnCarrito = localStorage.getItem("productos-en-carrito");
productosEnCarrito = JSON.parse(productosEnCarrito);

const contenedorCarritoVacio = document.querySelector("#carritoVacio");
const contenedorCarritoProductos = document.querySelector("#carritoProductos");
const contenedorCarritoAcciones = document.querySelector("#carritoAcciones");
const contenedorCarritoComprado = document.querySelector("#carritoComprado");
let botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
const botonVaciar = document.querySelector("#carritoAccionesVaciar");
const contenedorTotal = document.querySelector("#total");
const botonComprar = document.querySelector("#carritoAccionesComprar")

function cargarProductosCarrito(){
    if(productosEnCarrito && productosEnCarrito.length > 0) {
        contenedorCarritoVacio.classList.add("disabled");
        contenedorCarritoProductos.classList.remove("disabled");
        contenedorCarritoAcciones.classList.remove("disabled");
        contenedorCarritoComprado.classList.add("disabled");
        contenedorCarritoProductos.innerHTML = "";
    
        productosEnCarrito.forEach(producto => {
            const div = document.createElement("div");
            div.classList.add("carrito-producto");
            const precioFormateado = producto.precio.toLocaleString('es-ES', { minimumFractionDigits: 2 });
            const subtotalFormateado = (producto.precio * producto.cantidad).toLocaleString('es-ES', { minimumFractionDigits: 2 });
            div.innerHTML = `   
            <img src="${producto.imagen}" alt="${producto.titulo}" class="carrito-producto-imagen">
            <div class="carrito-producto-titulo">
                <h3 class="carrito-producto-titulo">${producto.titulo}</h3>
            </div>
            <div class="carrito-producto-cantidad">
                <small>Cantidad</small>
                <p>${producto.cantidad}</p>
            </div>
            <div class="carrito-producto-precio">
                <small>precio</small>
                <p>$${precioFormateado}</p>
            </div>
            <div class="carrito-producto-subtotal">
                <small>subtotal</small>
                <p>$${subtotalFormateado}</p>
            </div>
            <button class="carrito-producto-eliminar" id="${producto.id}"><i class="bi bi-trash3-fill"></i></button>
        </div>`;
    
        contenedorCarritoProductos.append(div);
    
        })
    
    } else {
        contenedorCarritoVacio.classList.remove("disabled");
        contenedorCarritoProductos.classList.add("disabled");
        contenedorCarritoAcciones.classList.add("disabled");
    }

    actualizarBotonesEliminar();
    actualizarTotal();
}

cargarProductosCarrito();

function actualizarBotonesEliminar(){
    botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
    botonesEliminar.forEach(boton =>{
        boton.addEventListener("click", eliminarDelCarrito);
    })
}

function eliminarDelCarrito(e) {
    const idBoton = e.currentTarget.id;
    const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);

    if (index !== -1) {
        if (productosEnCarrito[index].cantidad > 1) {
            productosEnCarrito[index].cantidad--;
        } else {
            productosEnCarrito.splice(index, 1);
        }
    }

    cargarProductosCarrito();

    localStorage.removeItem(idBoton);
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

botonVaciar.addEventListener("click", vaciarCarrito);

function vaciarCarrito(){
    Swal.fire({
        title: '¿Estás seguro de vaciar el carrito?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#FEDC3D',
        cancelButtonColor: '#FEDC3D',
        confirmButtonText: '<span style="color: #000000">Sí, vaciar carrito</span>',
        cancelButtonText: '<span style="color: #000000">Cancelar</span>' 
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            productosEnCarrito = [];
            cargarProductosCarrito();
        }
    });
}

function actualizarTotal(){
    const totalCalculado = productosEnCarrito.reduce((acumulador, producto) => acumulador + (producto.precio * producto.cantidad), 0);
    const totalFormateado = totalCalculado.toLocaleString('es-ES', { minimumFractionDigits: 2 });
    contenedorTotal.innerText = `$${totalFormateado}`;
}


function validacionDeNombre(name) {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name);
}

function validacionDeEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function comprarCarrito() {
    Swal.fire({
        title: 'Ingrese sus datos',
        html:
            '<input id="swal-input1" class="swal2-input" placeholder="Nombre">' +
            '<input id="swal-input2" class="swal2-input" placeholder="Correo electrónico">',
        focusConfirm: false,
        customClass: {
            confirmButton: 'swal-button-custom'
        },
        preConfirm: () => {
            const nombre = document.getElementById('swal-input1').value;
            const email = document.getElementById('swal-input2').value;

            if (!nombre || !email) {
                Swal.showValidationMessage('Por favor, complete todos los campos.');
                return null;
            } else if (!validacionDeNombre(nombre)) {
                Swal.showValidationMessage('Ingrese un nombre válido (solo letras y espacios).');
                return null;
            } else if (nombre.length < 5) {
                Swal.showValidationMessage('El nombre debe contener más de 4 letras.');
                return null;
            } else if (!validacionDeEmail(email)) {
                Swal.showValidationMessage('Ingrese un correo electrónico válido.');
                return null;
            }

            return { nombre, email };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const formValues = result.value;

            console.log('Nombre:', formValues.nombre);
            console.log('Correo electrónico:', formValues.email);

            productosEnCarrito.length = 0;
            localStorage.setItem('productos-en-carrito', JSON.stringify(productosEnCarrito));

            cargarProductosCarrito();

            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Gracias por su compra',
                showConfirmButton: false,
                timer: 5000
            });
        } else {
            console.log('El usuario canceló la compra.');
        }
    });
}

botonComprar.addEventListener("click", comprarCarrito);