import express from 'express';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import pool from '../db/db.js';

const router = express.Router();
const SALT_ROUNDS = 10; // Recommended salt rounds for bcrypt

//Register Route with Password Hashing and Validation
router.post(
    '/register',
    [
        body('username').isEmail().withMessage('Must be a valid email'),
        body('password')
            .isLength({ min: 12 })
            .withMessage('Password must be at least 12 characters long')
            .matches(/[a-z]/)
            .withMessage('Password must contain at least one lowercase letter')
            .matches(/[A-Z]/)
            .withMessage('Password must contain at least one uppercase letter')
            .matches(/\d/)
            .withMessage('Password must contain at least one number')
            .matches(/[^A-Za-z0-9]/)
            .withMessage('Password must contain at least one special character'),
        body('firstName').notEmpty().withMessage('First name is required'),
        body('lastName').notEmpty().withMessage('Last name is required'),
        body('address').notEmpty().withMessage('Address is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { username, password, firstName, lastName, address } = req.body;

        try {
            // Check if user already exists
            const [existingUser] = await pool.query('SELECT username FROM loginDetails WHERE username = ?', [username]);

            if (existingUser.length > 0) {
                return res.status(400).json({ success: false, error: 'Email is already registered' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            // Insert into loginDetails
            await pool.query('INSERT INTO loginDetails (username, password) VALUES (?, ?)', [username, hashedPassword]);

            // Insert into user table
            const [userResult] = await pool.query('INSERT INTO user (username) VALUES (?)', [username]);
            const userID = userResult.insertId;

            // Insert into userInfo
            await pool.query('INSERT INTO userInfo (userID, firstname, lastname, address) VALUES (?, ?, ?, ?)', [
                userID,
                firstName,
                lastName,
                address,
            ]);

            res.json({ success: true });
        } catch (err) {
            console.error('Registration error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    }
);

//Login Route with Password Hashing and Validation
router.post(
    '/login',
    [
        body('username').isEmail().withMessage('Must be a valid email'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { username, password } = req.body;

        try {
            const [rows] = await pool.query(
                `SELECT loginDetails.password, 
                user.userID, 
                user.username, 
                userInfo.firstname, 
                userInfo.lastname, 
                userInfo.address 
                FROM loginDetails
                JOIN user ON loginDetails.username = user.username
                JOIN userInfo ON user.userID = userInfo.userID
                WHERE loginDetails.username = ?`,
                [username]
            );

            if (rows.length === 0) {
                return res.status(401).json({ success: false, error: 'Invalid email or password' });
            }

            const user = rows[0];

            // Compare the hashed password
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({ success: false, error: 'Invalid email or password' });
            }

            const userData = {
                userID: user.userID,
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                address: user.address,
            };

            res.json({ success: true, user: userData });
        } catch (err) {
            console.error('Login error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    }
);

//Update Profile with Password Hashing and Validation
router.post('/updateProfile', async (req, res) => {
    const { userID, firstname, lastname, address, username, password } = req.body;

    try {
        // Update userInfo table
        await pool.query(
            `UPDATE userInfo 
            SET firstname = ?, lastname = ?, address = ? 
            WHERE userID = ?`,
            [firstname, lastname, address, userID]
        );

        // Update loginDetails
        const updates = [];
        const params = [];

        if (username) {
            updates.push('username = ?');
            params.push(username);
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            updates.push('password = ?');
            params.push(hashedPassword);
        }

        params.push(userID);

        if (updates.length > 0) {
            await pool.query(
                `UPDATE loginDetails 
                SET ${updates.join(', ')}
                WHERE username = (SELECT username FROM user WHERE userID = ?)`,
                params
            );

            // Update username in user table
            if (username) {
                await pool.query(`UPDATE user SET username = ? WHERE userID = ?`, [username, userID]);
            }
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
