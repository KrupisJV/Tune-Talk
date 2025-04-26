import React, { useState } from 'react';
import axios from 'axios';
// import logo from './bildes/TUNETALK.png';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE}/Register.php`, {
                username,
                email,
                password
            });
            setMessage(response.data);
            // Clear the form fields
            setUsername('');
            setEmail('');
            setPassword('');
        } catch (error) {
            setMessage('Error: ' + error.message);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <h2>Register</h2>
                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="register-button">Register</button>
                    <a href="/login" className="login-link">Already have an account? Login</a>
                </form>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default Register;
