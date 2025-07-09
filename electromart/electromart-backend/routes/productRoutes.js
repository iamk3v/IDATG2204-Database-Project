import express from 'express';
import pool from '../db/db.js';

const router = express.Router();

// Fetch all products
router.get('/products', async (req, res) => {
    try {
        const [products] = await pool.query(`SELECT * FROM product_view`);
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
