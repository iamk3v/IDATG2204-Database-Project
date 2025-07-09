import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
    const [cart, setCart] = useState([]);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Check if user is logged in
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (storedUser) {
            setUser(storedUser);
            reloadCart(storedUser.userID);
        }
    }, []);

    // Fetch cart items from the backend
    const reloadCart = async (userID) => {
        const res = await fetch(`http://localhost:5000/api/cart/get/${userID}`);
        const data = await res.json();
        if (data.success) {
            setCart(data.items);
        } else {
            setCart([]);
        }
    };

    if (!cart) return <p>Loading cart...</p>;

    const handlePlaceOrder = async () => {
        if (!user) {
            alert('You must be logged in to place an order.');
            navigate('/login');
            return;
        }

        // map the cart items
        const items = cart.map((item) => ({
            productID: item.productID,
            quantity: item.quantity || 1,
        }));

        // Calculate total amount
        const totalAmount = cart.reduce((acc, item) => acc + Number(item.productPrice) * item.quantity, 0);

        // Send order to backend
        const response = await fetch('http://localhost:5000/api/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userID: user.userID,
                totalAmount: totalAmount,
                items: items,
            }),
        });

        const result = await response.json();

        if (result.success) {
            alert('Order placed successfully!');

            // Clear cart from backend
            await fetch(`http://localhost:5000/api/cart/clear/${user.userID}`, {
                method: 'DELETE',
            });

            setCart([]);
            navigate('/profile');
        } else {
            alert('Order failed: ' + result.error);
        }
    };

    // Increase quantity of a product in the cart
    const handleIncrease = async (productID) => {
        await fetch('http://localhost:5000/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userID: user.userID,
                productID: productID,
                quantity: 1,
            }),
        });
        reloadCart(user.userID);
    };

    // Decrease quantity of a product in the cart
    const handleDecrease = async (productID) => {
        await fetch('http://localhost:5000/api/cart/decrease', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userID: user.userID,
                productID: productID,
            }),
        });
        reloadCart(user.userID);
    };

    // Remove a product from the cart
    const handleRemove = async (productID) => {
        await fetch(`http://localhost:5000/api/cart/remove/${user.userID}/${productID}`, {
            method: 'DELETE',
        });
        reloadCart(user.userID);
    };

    // Calculate total price
    const totalPrice = cart.reduce((acc, item) => acc + Number(item.productPrice) * item.quantity, 0).toFixed(2);

    // Serve the visible html
    return (
        <main style={{ padding: '2rem' }}>
            <h2>🛒 Your Cart</h2>

            <div style={{ marginBottom: '2rem' }}>
                {cart.length > 0 ? (
                    cart.map((item, index) => (
                        <div
                            key={index}
                            style={{
                                background: '#fff',
                                padding: '1rem',
                                marginBottom: '1rem',
                                borderRadius: '8px',
                                boxShadow: '0 5px 10px rgba(0,0,0,0.05)',
                            }}
                        >
                            <h3>{item.productName}</h3>
                            <p>
                                <strong>Price:</strong> ${Number(item.productPrice).toFixed(2)}
                            </p>
                            <p>
                                <strong>Quantity:</strong> {item.quantity}
                            </p>

                            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                                <button onClick={() => handleIncrease(item.productID)}>➕</button>
                                <button onClick={() => handleDecrease(item.productID)}>➖</button>
                                <button onClick={() => handleRemove(item.productID)}>❌</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No products in your cart yet.</p>
                )}
            </div>

            <h3>Total: ${totalPrice}</h3>

            {user ? (
                <div style={{ marginTop: '2rem' }}>
                    <h4>Shipping To:</h4>
                    <p>
                        <strong>
                            {user.firstname} {user.lastname}
                        </strong>
                    </p>
                    <p>{user.address}</p>
                    <button
                        onClick={handlePlaceOrder}
                        style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                        }}
                    >
                        Place Order
                    </button>
                </div>
            ) : (
                <div style={{ marginTop: '2rem' }}>
                    <p>
                        You must <a href="/login">log in</a> to place an order.
                    </p>
                </div>
            )}
        </main>
    );
}
