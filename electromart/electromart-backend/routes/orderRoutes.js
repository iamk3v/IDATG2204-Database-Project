import express from 'express';
import pool from '../db/db.js';

const router = express.Router();

// Place a New Order
router.post('/order', async (req, res) => {
    const { userID, totalAmount, items } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Insert into 'order' table
        const [orderResult] = await connection.query(
            `INSERT INTO \`order\` (userID, orderDate, totalAmount, status) 
             VALUES (?, NOW(), ?, 'pending')`,
            [userID, totalAmount]
        );
        const orderID = orderResult.insertId;

        // Insert each item into 'orderItem' and decrease stock
        for (const item of items) {
            // Insert into orderItem
            await connection.query(
                `INSERT INTO orderItem (orderID, productID, quantity) 
                 VALUES (?, ?, ?)`,
                [orderID, item.productID, item.quantity]
            );

            // Update product stock
            await connection.query(
                `UPDATE product 
                 SET stockQuantity = stockQuantity - ? 
                 WHERE productID = ?`,
                [item.quantity, item.productID]
            );
        }

        await connection.commit();
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        console.error('Order placement failed:', err);
        res.status(500).json({ success: false, error: err.message });
    } finally {
        connection.release();
    }
});

// Fetch Orders for a User
router.get('/order', async (req, res) => {
    const { userID } = req.query;

    try {
        const [orders] = await pool.query(
            `SELECT o.orderID, o.orderDate, o.totalAmount, o.status, 
              oi.productID, oi.quantity, p.name AS productName 
              FROM order_view o
              JOIN orderItem oi ON o.orderID = oi.orderID
              JOIN product p ON oi.productID = p.productID
              WHERE o.userID = ?
              ORDER BY o.orderDate DESC`,
            [userID]
        );

        res.json(orders);
    } catch (err) {
        console.error('Fetching orders failed:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
