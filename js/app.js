let productos = [];

async function cargarProductosDesdeJSON() {
    try {
        const response = await fetch("./JSON/productos.json");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al cargar los productos:", error);
        throw new Error("No se pudieron cargar los productos.");
    }
}

async function inicializar() {
    try {
        productos = await cargarProductosDesdeJSON();
        cargarProductos(productos);
    } catch (error) {
        console.error("Error al inicializar la aplicación:", error);
    } finally {
        console.log("Bienvenido a nuestro ecommerce");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await inicializar();
    } catch (error) {
        console.error("Error al inicializar la aplicación:", error);
    }
    productosEnCarrito = JSON.parse(localStorage.getItem("productos-en-carrito")) || [];
    actualizarNumerito();
});

function cargarProductos(productos) {
    contenedorProductos.innerHTML = "";

    productos.forEach(producto => {
        const divProducto = document.createElement("div");
        divProducto.classList.add("producto");

        const botonTexto = producto.stock > 0 ? "Agregar" : "Sin Stock";  // Cambio aquí

        divProducto.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.titulo}" class="producto-imagen">
            <div class="producto-detalles">
                <h3 class="producto-titulo">${producto.titulo}</h3>
                <p class="producto-precio">$${producto.precio}</p>
                <button class="producto-agregar" id="${producto.id}" ${producto.stock === 0 ? '' : ''}>${botonTexto}</button>
            </div>
        `;

        contenedorProductos.appendChild(divProducto);
    });

    actualizarBotonesAgregar();
}

const menuHamburguesa = document.querySelector("#menuHamburguesa")
const contenedorProductos = document.querySelector("#contenedorProductos");
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const tituloPrincipal = document.querySelector("#tituloPrincipal");
let botonesAgregar = document.querySelectorAll(".producto-agregar");
const buscador = document.querySelector("#inputBuscador")
const precioMaximoInput = document.querySelector("#precioMaximo");
const precioMinimoInput = document.querySelector("#precioMinimo");
const botonFiltrar = document.querySelector("#filtrar");
const menuCategorias = document.querySelector("#menuCategorias")


menuHamburguesa.addEventListener("click", () => {
    const elementosBotonNavbar = document.querySelectorAll('.boton-navbar');

    elementosBotonNavbar.forEach(elemento => {
        elemento.classList.toggle('disabled');
    });
    menuCategorias.classList.toggle("togleado")
});


function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-ES').format(precio);
}

botonesCategorias.forEach(boton =>{
    boton.addEventListener("click", (e) => {

        botonesCategorias.forEach(boton=>boton.classList.remove("active"));
        e.currentTarget.classList.add("active");
        buscador.value = '';

        if (e.currentTarget.id != "todos"){
            const productoCategoria = productos.find(producto => producto.categoria.id === e.currentTarget.id);
            tituloPrincipal.innerText = productoCategoria.categoria.nombre;
            const productosBoton = productos.filter(producto => producto.categoria.id === e.currentTarget.id);
            cargarProductos(productosBoton);
        } else {
            tituloPrincipal.innerText = "Todos los productos";
            cargarProductos(productos)
        }

    })
})

function actualizarBotonesAgregar() {
    botonesAgregar = [...document.querySelectorAll(".producto-agregar")];
    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", agregarAlCarrito);
    });
}

let productosEnCarritoLS = localStorage.getItem("productos-en-carrito");

if (productosEnCarritoLS) {
    productosEnCarritoLS = JSON.parse(productosEnCarritoLS);
    actualizarNumerito();
} else {
    productosEnCarritoLS = [];
}

productosEnCarritoLS = JSON.parse(localStorage.getItem("productos-en-carrito")) || [];


function agregarAlCarrito(e) {
    const idBoton = e.currentTarget.id;
    const productoAgregado = productos.find(producto => producto.id === idBoton);

    if (productoAgregado.stock === 0) {
        Toastify({
            text: 'Lo sentimos, no tenemos stock',
            duration: 3000,
            close: true,
            gravity: 'bottom',
            position: 'right',
            style: {
                background: 'red',
                color: '#ffffff',
            },
            stopOnFocus: true,
        }).showToast();
        return;
    }

    const index = productosEnCarritoLS.findIndex(producto => producto.id === idBoton);
    index !== -1
        ? productosEnCarritoLS[index].cantidad++
        : (productoAgregado.cantidad = 1, productosEnCarritoLS.push(productoAgregado));

    actualizarNumerito();
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarritoLS));

    Toastify({
        text: 'Producto agregado al carrito',
        duration: 3000,
        close: true,
        gravity: 'bottom',
        position: 'right',
        style: {
            background: '#FEDC3D',
            color: '#000000',
        },
        stopOnFocus: true,
    }).showToast();
}



function actualizarNumerito() {
    const nuevoNumerito = productosEnCarritoLS.reduce((acumulador, producto) => acumulador + producto.cantidad, 0);

    const numeritos = document.querySelectorAll(".numerito");
    numeritos.forEach(numerito => {
        numerito.innerText = nuevoNumerito;
    });
}

buscador.addEventListener("input", filtrarProductos);

function filtrarProductos() {
    const filtro = document.querySelector("#inputBuscador").value.toLowerCase();
    const categoriaActual = obtenerCategoriaActual();

    const productosFiltrados = productos.filter(producto => {
        const categoriaCoincide = categoriaActual.id === "todos" || producto.categoria.id === categoriaActual.id;
        const tituloCoincide = producto.titulo.toLowerCase().includes(filtro);

        return categoriaCoincide && tituloCoincide;
    });

    contenedorProductos.innerHTML = "";

    productosFiltrados.forEach(producto => {
        const divProducto = document.createElement("div");
        divProducto.classList.add("producto");

        const botonTexto = producto.stock > 0 ? "Agregar" : "Sin Stock"; 

        divProducto.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.titulo}" class="producto-imagen">
            <div class="producto-detalles">
                <h3 class="producto-titulo">${producto.titulo}</h3>
                <p class="producto-precio">$${producto.precio}</p>
                <button class="producto-agregar" id="${producto.id}" ${producto.stock === 0 ? 'disabled' : ''}>${botonTexto}</button>
            </div>
        `;

        contenedorProductos.appendChild(divProducto);
    });

    actualizarBotonesAgregar();
}

document.querySelector("#inputBuscador").addEventListener("input", () => {
    filtrarProductos();
    actualizarBotonesAgregar(); 
});

function obtenerCategoriaActual() {
    const categorias = document.querySelectorAll(".boton-categoria");
    for (const categoria of categorias) {
        if (categoria.classList.contains("active")) {
            return { id: categoria.id, nombre: categoria.innerText };
        }
    }
    return { id: "todos", nombre: "Todos los productos" };
}

botonFiltrar.addEventListener("click", filtrarPorPrecio);

precioMaximoInput.addEventListener("input", (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const parsedValue = parseInt(rawValue);
    e.target.value = !isNaN(parsedValue) ? `$${new Intl.NumberFormat('es-ES').format(parsedValue)}` : '';
});


precioMinimoInput.addEventListener("input", (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const parsedValue = parseInt(rawValue);

    e.target.value = !isNaN(parsedValue) ? `$${new Intl.NumberFormat('es-ES').format(parsedValue)}` : '';
});

function filtrarPorPrecio() {
    const precioMaximoInputValue = precioMaximoInput.value.replace(/[^0-9]/g, '');
    const precioMinimoInputValue = precioMinimoInput.value.replace(/[^0-9]/g, '');

    const precioMaximo = precioMaximoInputValue ? parseFloat(precioMaximoInputValue) : Infinity;
    const precioMinimo = precioMinimoInputValue ? parseFloat(precioMinimoInputValue) : 0;

    const filtro = document.querySelector("#inputBuscador").value.toLowerCase();
    const categoriaActual = obtenerCategoriaActual();

    const productosFiltrados = productos.filter(producto => {
        const precioProducto = parseFloat(producto.precio);
        const cumplePrecioMinimo = isNaN(precioMinimo) || precioProducto >= precioMinimo;
        const cumplePrecioMaximo = isNaN(precioMaximo) || precioProducto <= precioMaximo;
        const categoriaCoincide = categoriaActual.id === "todos" || producto.categoria.id === categoriaActual.id;
        const tituloCoincide = producto.titulo.toLowerCase().includes(filtro);

        return cumplePrecioMinimo && cumplePrecioMaximo && categoriaCoincide && tituloCoincide;
    });

    precioMaximoInput.value = '';
    precioMinimoInput.value = '';

    cargarProductos(productosFiltrados);
}