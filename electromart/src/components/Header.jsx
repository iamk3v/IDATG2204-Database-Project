import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Header() {
    const [loggedIn, setLoggedIn] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const user = localStorage.getItem('loggedInUser');
        setLoggedIn(!!user);
    }, [location]);

    return (
        <header className="header">
            <h1>ElectroMart</h1>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/cart">Cart</Link>
                {!loggedIn ? <Link to="/login">Login</Link> : <Link to="/profile">Profile</Link>}
            </nav>
        </header>
    );
}
