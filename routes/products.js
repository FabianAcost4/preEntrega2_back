const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const productsFilePath = path.join(__dirname, '../data/products.json');

// Leer productos del archivo JSON
const readProducts = () => {
    if (!fs.existsSync(productsFilePath)) return [];
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    return JSON.parse(data || '[]');
};

// Escribir productos al archivo JSON
const writeProducts = (products) => {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
};

// Rutas
router.get('/', (req, res) => {
    const { limit } = req.query;
    const products = readProducts();
    res.json(limit ? products.slice(0, Number(limit)) : products);
});

router.get('/:pid', (req, res) => {
    const products = readProducts();
    const product = products.find((p) => p.id === req.params.pid);
    if (!product) return res.status(404).send('Producto no encontrado');
    res.json(product);
});

router.post('/', (req, res) => {
    const products = readProducts();
    const { title, description, code, price, stock, category, thumbnails } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).send('Todos los campos son obligatorios excepto thumbnails');
    }

    const newProduct = {
        id: (products.length + 1).toString(),
        title,
        description,
        code,
        price,
        stock,
        category,
        thumbnails: thumbnails || [],
    };

    products.push(newProduct);
    writeProducts(products);
    res.status(201).json(newProduct);
});

router.put('/:pid', (req, res) => {
    const products = readProducts();
    const productIndex = products.findIndex((p) => p.id === req.params.pid);
    if (productIndex === -1) return res.status(404).send('Producto no encontrado');

    const updatedProduct = { ...products[productIndex], ...req.body, id: products[productIndex].id };
    products[productIndex] = updatedProduct;

    writeProducts(products);
    res.json(updatedProduct);
});

router.delete('/:pid', (req, res) => {
    const products = readProducts();
    const productIndex = products.findIndex((p) => p.id === req.params.pid);
    if (productIndex === -1) return res.status(404).send('Producto no encontrado');

    products.splice(productIndex, 1);
    writeProducts(products);
    res.send('Producto eliminado');
});

module.exports = router;
