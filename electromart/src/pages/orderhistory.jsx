import { useEffect, useState } from 'react';

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('orders')) || [];
        setOrders(history);
    }, []);

    // Serve the visible html
    return (
        <main>
            <h2>📦 Order History</h2>
            {orders.length === 0 ? (
                <p>No past orders found.</p>
            ) : (
                orders.map((order, i) => (
                    <div
                        key={i}
                        style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}
                    >
                        <p>
                            <strong>Order ID:</strong> {order.orderId}
                        </p>
                        <p>
                            <strong>Date:</strong> {order.date}
                        </p>
                        <p>
                            <strong>Total:</strong> ${order.total}
                        </p>
                        <p>
                            <strong>Shipping:</strong> {order.user.firstName} {order.user.lastName},{' '}
                            {order.user.address}
                        </p>
                        <ul>
                            {order.items.map((item, j) => (
                                <li key={j}>
                                    {item.name} - ${item.price.toFixed(2)}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            )}
        </main>
    );
}
