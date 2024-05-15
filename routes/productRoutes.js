const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Middleware to validate ObjectId
const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid product ID' });
    }
    next();
};

// Add a product
router.post('/', protect, async (req, res) => {
    const { productId, name, price, featured, rating, createdAt, company } = req.body;

    console.log('Received product data:', req.body);

    if (!productId || !name || !price || !createdAt || !company) {
        return res.status(400).json({ message: 'Please include all required fields' });
    }

    try {
        const product = new Product({
            productId,
            name,
            price,
            featured,
            rating,
            createdAt,
            company,
        });
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Product creation error:', error);
        res.status(400).json({ message: 'Product creation failed', error: error.message });
    }
});


// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching products', error: error.message });
    }
});

// Update a product
router.put('/:id', protect, validateObjectId, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: 'Product update failed', error: error.message });
    }
});

// Delete a product
router.delete('/:id', protect, validateObjectId, async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(400).json({ message: 'Product deletion failed', error: error.message });
    }
});

// Fetch featured products
router.get('/featured', async (req, res) => {
    try {
        const featuredProducts = await Product.find({ featured: true });
        res.json(featuredProducts);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching featured products', error: error.message });
    }
});

// Fetch products with price less than a certain value
router.get('/price/:maxPrice', async (req, res) => {
    try {
        const products = await Product.find({ price: { $lt: req.params.maxPrice } });
        res.json(products);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching products', error: error.message });
    }
});

// Fetch a single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching product', error: error.message });
    }
});

// Fetch products with rating higher than a certain value
router.get('/rating/:minRating', async (req, res) => {
    try {
        const products = await Product.find({ rating: { $gt: req.params.minRating } });
        res.json(products);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching products', error: error.message });
    }
});

module.exports = router;