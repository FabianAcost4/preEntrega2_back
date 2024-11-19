const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

// Configuración del servidor
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Handlebars
const handlebars = require('express-handlebars');
app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Función para leer productos del archivo JSON
const getProducts = () => {
    const dataPath = path.join(__dirname, 'data', 'products.json');
    if (!fs.existsSync(dataPath)) {
        return [];
    }
    const data = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
};

// Vista principal
app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts');
});

// WebSockets
io.on('connection', (socket) => {
    console.log('Cliente conectado');
    
    // Enviar la lista inicial de productos al cliente
    const products = getProducts();
    socket.emit('updateProducts', products);

    // Escuchar cuando se agregue un producto desde el cliente
    socket.on('addProduct', (product) => {
        const products = getProducts();
        product.id = products.length > 0 ? products[products.length - 1].id + 1 : 1; // Generar ID
        products.push(product);

        // Guardar productos en el archivo
        fs.writeFileSync(path.join(__dirname, 'data', 'products.json'), JSON.stringify(products, null, 2));

        // Emitir los productos actualizados a todos los clientes
        io.emit('updateProducts', products);
    });
});

// Iniciar servidor
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
