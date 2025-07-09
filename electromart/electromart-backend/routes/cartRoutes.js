import express from 'express';
import pool from '../db/db.js';

const router = express.Router();

// Add item to cart
router.post('/add', async (req, res) => {
    const { userID, productID, quantity } = req.body;
    try {
        // Check if cart exists
        await pool.query(`INSERT IGNORE INTO cart (userID, status) VALUES (?, 'open')`, [userID]);

        // Check if cartItem already exists (increase quantity)
        const [existing] = await pool.query(`SELECT * FROM cartItem WHERE cartID = ? AND productID = ?`, [
            userID,
            productID,
        ]);

        if (existing.length > 0) {
            await pool.query(`UPDATE cartItem SET quantity = quantity + ? WHERE cartID = ? AND productID = ?`, [
                quantity,
                userID,
                productID,
            ]);
        } else {
            await pool.query(`INSERT INTO cartItem (cartID, productID, quantity) VALUES (?, ?, ?)`, [
                userID,
                productID,
                quantity,
            ]);
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get a user's cart
router.get('/get/:userID', async (req, res) => {
    const { userID } = req.params;

    try {
        const [cartItems] = await pool.query(
            `SELECT productID, quantity, productName, productPrice 
            FROM cart_view 
            WHERE userID = ?`,
            [userID]
        );

        res.json({ success: true, items: cartItems });
    } catch (err) {
        console.error('Fetching cart failed:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Clear cart after order placed
router.delete('/clear/:userID', async (req, res) => {
    const { userID } = req.params;
    try {
        await pool.query(`DELETE FROM cartItem WHERE cartID = ?`, [userID]);
        await pool.query(`DELETE FROM cart WHERE userID = ?`, [userID]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Decrease quantity of a cart item
router.post('/decrease', async (req, res) => {
    const { userID, productID } = req.body;
    try {
        // First, check if quantity > 1
        const [existing] = await pool.query(`SELECT quantity FROM cartItem WHERE cartID = ? AND productID = ?`, [
            userID,
            productID,
        ]);

        if (existing.length > 0) {
            if (existing[0].quantity > 1) {
                await pool.query(`UPDATE cartItem SET quantity = quantity - 1 WHERE cartID = ? AND productID = ?`, [
                    userID,
                    productID,
                ]);
            } else {
                // If quantity would become 0, delete item
                await pool.query(`DELETE FROM cartItem WHERE cartID = ? AND productID = ?`, [userID, productID]);
            }
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Remove an item completely
router.delete('/remove/:userID/:productID', async (req, res) => {
    const { userID, productID } = req.params;
    try {
        await pool.query(`DELETE FROM cartItem WHERE cartID = ? AND productID = ?`, [userID, productID]);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
