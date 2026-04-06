import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import '../styles/Auth.css';

export default function Login({ onLoginSuccess, onNavigateToRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await apiClient.post('/api/auth/login', {
                email,
                password,
            });

            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);

            onLoginSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Ошибка входа');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h1>Вход</h1>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Пароль:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Загрузка...' : 'Войти'}
                    </button>
                </form>
                <p className="auth-link">
                    Нет аккаунта? <button type="button" onClick={onNavigateToRegister} className="link-button">Зарегистрироваться</button>
                </p>
            </div>
        </div>
    );
}
