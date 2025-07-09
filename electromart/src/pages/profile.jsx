import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const navigate = useNavigate();

    // Check if user is logged in
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!storedUser) {
            navigate('/login');
        } else {
            setUser(storedUser);

            fetch(`http://localhost:5000/api/order?userID=${storedUser.userID}`)
                .then((res) => res.json())
                .then((data) => {
                    setOrders(data);
                })
                .catch((err) => {
                    console.error('Failed to fetch orders:', err);
                    setOrders([]);
                });
        }
    }, [navigate]);

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleSaveChanges = async () => {
        try {
            const payload = {
                userID: user.userID,
                firstname: editForm.firstname,
                lastname: editForm.lastname,
                address: editForm.address,
                username: editForm.username,
                password: editForm.password,
            };

            // Fetch API to update the user profile
            const response = await fetch('http://localhost:5000/api/updateProfile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.success) {
                const updatedUser = {
                    ...user,
                    firstname: editForm.firstname,
                    lastname: editForm.lastname,
                    address: editForm.address,
                    username: editForm.username,
                };

                localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setEditing(false);
                alert('Profile updated successfully!');
            } else {
                alert('Failed to update profile: ' + result.error);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Something went wrong.');
        }
    };

    if (!user) return <p>Loading profile...</p>;

    // Group orders by orderID
    const groupedOrders = Object.entries(
        orders.reduce((acc, orderItem) => {
            if (!acc[orderItem.orderID]) {
                acc[orderItem.orderID] = {
                    orderDate: orderItem.orderDate,
                    totalAmount: orderItem.totalAmount,
                    status: orderItem.status,
                    items: [],
                };
            }
            acc[orderItem.orderID].items.push({
                productName: orderItem.productName,
                quantity: orderItem.quantity,
            });
            return acc;
        }, {})
    );

    // Serve the visible html
    return (
        <main style={{ padding: '2rem' }}>
            <h2>👤 Your Profile</h2>

            <section style={{ marginBottom: '2rem' }}>
                <h3>Account Information</h3>
                <p>
                    <strong>Name:</strong> {user.firstname} {user.lastname}
                </p>
                <p>
                    <strong>Email:</strong> {user.username}
                </p>
                <p>
                    <strong>Address:</strong> {user.address}
                </p>

                {!editing ? (
                    <button
                        onClick={() => {
                            setEditing(true);
                            setEditForm({
                                firstname: user.firstname,
                                lastname: user.lastname,
                                address: user.address,
                                username: user.username,
                                password: '',
                            });
                        }}
                        style={{ marginTop: '1rem' }}
                    >
                        Edit Info
                    </button>
                ) : (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSaveChanges();
                        }}
                        style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                    >
                        <input
                            type="text"
                            name="firstname"
                            value={editForm.firstname || ''}
                            onChange={handleEditChange}
                            placeholder="First Name"
                        />
                        <input
                            type="text"
                            name="lastname"
                            value={editForm.lastname || ''}
                            onChange={handleEditChange}
                            placeholder="Last Name"
                        />
                        <input
                            type="text"
                            name="address"
                            value={editForm.address || ''}
                            onChange={handleEditChange}
                            placeholder="Address"
                        />
                        <input
                            type="email"
                            name="username"
                            value={editForm.username || ''}
                            onChange={handleEditChange}
                            placeholder="Email"
                        />
                        <input
                            type="password"
                            name="password"
                            value={editForm.password || ''}
                            onChange={handleEditChange}
                            placeholder="New Password"
                        />
                        <button type="submit">Save Changes</button>
                    </form>
                )}
            </section>

            <section>
                <h3>📦 Order History</h3>
                {groupedOrders.length > 0 ? (
                    groupedOrders.map(([orderID, order], index) => (
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
                            <p>
                                <strong>Order ID:</strong> {orderID}
                            </p>
                            <p>
                                <strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString()}
                            </p>
                            <p>
                                <strong>Status:</strong> {order.status}
                            </p>
                            <p>
                                <strong>Total:</strong> ${Number(order.totalAmount).toFixed(2)}
                            </p>
                            <div style={{ marginTop: '0.5rem' }}>
                                <strong>Items:</strong>
                                <ul>
                                    {order.items.map((item, idx) => (
                                        <li key={idx}>
                                            {item.productName} × {item.quantity}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No orders found yet.</p>
                )}
            </section>

            <button
                onClick={() => {
                    localStorage.removeItem('loggedInUser');
                    navigate('/');
                }}
                style={{
                    marginTop: '2rem',
                    padding: '0.75rem 1.5rem',
                    background: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                }}
            >
                Logout
            </button>
        </main>
    );
}
