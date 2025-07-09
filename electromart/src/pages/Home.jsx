import { useEffect, useState } from 'react';

export default function Home() {
    const [products, setProducts] = useState([]);

    // Fetch products from the backend
    useEffect(() => {
        fetch('http://localhost:5000/api/products')
            .then((res) => res.json())
            .then((data) => setProducts(data))
            .catch((err) => console.error('Failed to fetch products', err));
    }, []);

    const addToCart = async (product) => {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!user) {
            alert('You must be logged in to add to cart.');
            return;
        }

        // Add the product to the cart
        const response = await fetch('http://localhost:5000/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userID: user.userID,
                productID: product.productID,
                quantity: 1,
            }),
        });

        const result = await response.json();

        if (result.success) {
            alert(`${product.name} added to cart!`);
        } else {
            alert('Failed to add to cart: ' + result.error);
        }
    };

    // Serve the visible html
    return (
        <main>
            <h2>🛍️ Product Catalog</h2>
            <div
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}
            >
                {products.map((p, index) => (
                    <div
                        key={index}
                        style={{
                            background: '#fff',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                        }}
                    >
                        <h3>{p.name}</h3>
                        <p>
                            <strong>Product ID:</strong> {p.productID}
                        </p>
                        <p>
                            <strong>Category:</strong> {p.categoryName}
                        </p>
                        <p>
                            <strong>Brand:</strong> {p.brandName}
                        </p>
                        <p>
                            <strong>Description:</strong> {p.description}
                        </p>
                        <p>
                            <strong>Price:</strong> ${p.price}
                        </p>
                        <p>
                            <strong>Stock Quantity:</strong> {p.stockQuantity}
                        </p>
                        <button onClick={() => addToCart(p)}>Add to Cart</button>
                    </div>
                ))}
            </div>
        </main>
    );
}
