import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import '../styles/Auth.css';

export default function Register({ onRegisterSuccess, onNavigateToLogin }) {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await apiClient.post('/api/auth/register', {
                email,
                first_name: firstName,
                last_name: lastName,
                password,
                role,
            });

            // После регистрации сразу входим
            const loginResponse = await apiClient.post('/api/auth/login', {
                email,
                password,
            });

            localStorage.setItem('accessToken', loginResponse.data.accessToken);
            localStorage.setItem('refreshToken', loginResponse.data.refreshToken);

            onRegisterSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Ошибка регистрации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h1>Регистрация</h1>
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
                        <label>Имя:</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Фамилия:</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
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
                    <div className="form-group">
                        <label>Роль:</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            disabled={loading}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '5px',
                                border: '1px solid #ddd',
                                fontSize: '1rem',
                                backgroundColor: 'white',
                                color: '#333',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="user">Пользователь</option>
                            <option value="seller">Продавец</option>
                            <option value="admin">Администратор</option>
                        </select>
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Загрузка...' : 'Зарегистрироваться'}
                    </button>
                </form>
                <p className="auth-link">
                    Уже есть аккаунт? <button type="button" onClick={onNavigateToLogin} className="link-button">Войти</button>
                </p>
            </div>
        </div>
    );
}
