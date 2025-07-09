import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);
app.use('/api/cart', cartRoutes);

const PORT = process.env.PORT || 5000;
try {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} catch (error) {
    console.error(`Error starting server: ${error}`);
}
