import React, { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import "./UsersPage.css";

export default function UsersPage({ onLogout, onNavigateToProducts }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editingData, setEditingData] = useState({});

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/users');
            setUsers(response.data);
        } catch (err) {
            alert("Ошибка загрузки пользователей");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingId(user.id);
        setEditingData({
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role
        });
    };

    const handleSave = async (id) => {
        try {
            await apiClient.put(`/api/users/${id}`, editingData);
            setUsers(users.map(u =>
                u.id === id ? { ...u, ...editingData } : u
            ));
            setEditingId(null);
        } catch (err) {
            alert("Ошибка при обновлении пользователя");
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditingData({});
    };

    const handleBlock = async (id) => {
        if (!window.confirm("Заблокировать этого пользователя?")) return;
        try {
            await apiClient.delete(`/api/users/${id}`);
            setUsers(users.map(u =>
                u.id === id ? { ...u, isBlocked: true } : u
            ));
        } catch (err) {
            alert("Ошибка при блокировке пользователя");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        onLogout();
    };

    return (
        <div className="page">
            <header className="header">
                <div className="header__inner">
                    <div className="brand">➺ Creepypasta Store .✦ ݁˖</div>
                    <div className="header__right">
                        <span>👥 Управление пользователями</span>
                        <button className="btn" onClick={onNavigateToProducts} style={{ marginRight: '8px' }}>
                            ← Вернуться к товарам
                        </button>
                        <button className="btn-logout" onClick={handleLogout}>Выход</button>
                    </div>
                </div>
            </header>

            <main className="main">
                <div className="container">
                    <h1 className="title">Управление пользователями</h1>

                    {loading ? (
                        <div className="empty">Загрузка...</div>
                    ) : (
                        <div className="users-table-wrapper">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>Имя</th>
                                        <th>Фамилия</th>
                                        <th>Роль</th>
                                        <th>Статус</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} className={user.isBlocked ? 'blocked' : ''}>
                                            <td>{user.email}</td>
                                            {editingId === user.id ? (
                                                <>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={editingData.first_name}
                                                            onChange={(e) => setEditingData({ ...editingData, first_name: e.target.value })}
                                                            className="input-field"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={editingData.last_name}
                                                            onChange={(e) => setEditingData({ ...editingData, last_name: e.target.value })}
                                                            className="input-field"
                                                        />
                                                    </td>
                                                    <td>
                                                        <select
                                                            value={editingData.role}
                                                            onChange={(e) => setEditingData({ ...editingData, role: e.target.value })}
                                                            className="input-field"
                                                        >
                                                            <option value="user">user</option>
                                                            <option value="seller">seller</option>
                                                            <option value="admin">admin</option>
                                                        </select>
                                                    </td>
                                                    <td>{user.isBlocked ? '🚫 Заблокирован' : '✓ Активен'}</td>
                                                    <td>
                                                        <button className="btn btn--small" onClick={() => handleSave(user.id)}>
                                                            Сохранить
                                                        </button>
                                                        <button className="btn btn--small" onClick={handleCancel}>
                                                            Отмена
                                                        </button>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>{user.first_name}</td>
                                                    <td>{user.last_name}</td>
                                                    <td>{user.role}</td>
                                                    <td>{user.isBlocked ? '🚫 Заблокирован' : '✓ Активен'}</td>
                                                    <td>
                                                        {!user.isBlocked && (
                                                            <>
                                                                <button className="btn btn--small" onClick={() => handleEdit(user)}>
                                                                    Редактировать
                                                                </button>
                                                                <button className="btn btn--small btn--users-danger" onClick={() => handleBlock(user.id)}>
                                                                    Заблокировать
                                                                </button>
                                                            </>
                                                        )}
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            <footer className="footer">
                <div className="footer__inner">© {new Date().getFullYear()} Creepypasta Store ‧₊˚♪ 𝄞₊˚⊹</div>
            </footer>
        </div>
    );
}
