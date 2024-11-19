const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const cartsFilePath = path.join(__dirname, '../data/carts.json');

// Leer carritos del archivo JSON
const readCarts = () => {
    if (!fs.existsSync(cartsFilePath)) return [];
    const data = fs.readFileSync(cartsFilePath, 'utf-8');
    return JSON.parse(data || '[]');
};

// Escribir carritos al archivo JSON
const writeCarts = (carts) => {
    fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
};

// Rutas
router.post('/', (req, res) => {
    const carts = readCarts();
    const newCart = { id: (carts.length + 1).toString(), products: [] };
    carts.push(newCart);
    writeCarts(carts);
    res.status(201).json(newCart);
});

router.get('/:cid', (req, res) => {
    const carts = readCarts();
    const cart = carts.find((c) => c.id === req.params.cid);
    if (!cart) return res.status(404).send('Carrito no encontrado');
    res.json(cart);
});

router.post('/:cid/product/:pid', (req, res) => {
    const carts = readCarts();
    const cart = carts.find((c) => c.id === req.params.cid);
    if (!cart) return res.status(404).send('Carrito no encontrado');

    const { pid } = req.params;
    const productIndex = cart.products.findIndex((p) => p.product === pid);
    if (productIndex === -1) {
        cart.products.push({ product: pid, quantity: 1 });
    } else {
        cart.products[productIndex].quantity++;
    }

    writeCarts(carts);
    res.json(cart);
});

module.exports = router;
