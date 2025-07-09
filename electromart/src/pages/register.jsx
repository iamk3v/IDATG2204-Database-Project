import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        address: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            username: form.email,
            password: form.password,
            firstName: form.firstName,
            lastName: form.lastName,
            address: form.address,
        };

        // Fetch backend to register the user
        const response = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.success) {
            alert('Account created!');
            navigate('/login');
        } else {
            // If errors from registration, send a message
            const message =
                result.error ||
                (result.errors && result.errors.map((e) => e.msg).join('\n')) ||
                'Unknown registration error';
            alert('Registration failed: ' + message);
        }
    };

    // Serve the visible html
    return (
        <main>
            <h2>Create Your Account</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
                <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    required
                    onChange={handleChange}
                />
                <input name="firstName" placeholder="First Name" required onChange={handleChange} />
                <input name="lastName" placeholder="Last Name" required onChange={handleChange} />
                <input name="address" placeholder="Address" required onChange={handleChange} />
                <button type="submit">Register</button>
            </form>
        </main>
    );
}
