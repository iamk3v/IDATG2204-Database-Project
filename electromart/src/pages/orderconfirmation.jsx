import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrderConfirmation() {
    const [order, setOrder] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedOrder = JSON.parse(localStorage.getItem('lastOrder'));
        if (!savedOrder) {
            navigate('/');
        } else {
            setOrder(savedOrder);
        }
    }, [navigate]);

    if (!order) return null;

    // Serve the visible html
    return (
        <main>
            <h2>✅ Order Confirmed!</h2>
            <p>
                <strong>Order ID:</strong> {order.orderId}
            </p>
            <p>
                <strong>Total:</strong> ${order.total}
            </p>
            <h3>Shipping to:</h3>
            <p>
                {order.user.firstName} {order.user.lastName}
            </p>
            <p>{order.user.email}</p>
            <p>{order.user.address}</p>
            <p>Thank you for shopping with ElectroMart!</p>
        </main>
    );
}
