import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style/Login.css'; // Path relative to Login.js
// import logo from './bildes/TUNETALK.png';

function Login() {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8887/Login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username_or_email: usernameOrEmail,
                    password: password,
                }),
            });

            // Check if the response is not OK
            if (!response.ok) {
                const errorData = await response.json();
                setMessage(errorData.message || 'Login failed. Please try again.');
                return;
            }

            const data = await response.json();

            if (data.user.access_token) {
                console.log(data.user)
                localStorage.setItem("user", JSON.stringify(data.user));

                navigate('/profile');
            } else {
                setMessage(data.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setMessage('Login failed. Please try again.');
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* <img src={logo} alt="Tune Talk Logo" className="logo" /> */}
                <h2>Login</h2>
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username_or_email"
                            value={usernameOrEmail}
                            onChange={(e) => setUsernameOrEmail(e.target.value)}
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
                    <button type="submit" className="login-button">Login</button>
                    {message && <p>{message}</p>}
                    <a href="/register" className="login-link">Don't have an account? Register</a>
                </form>
            </div>
        </div>
    );
}

export default Login;
