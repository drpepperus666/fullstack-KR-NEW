import React, { useEffect, useState } from 'react';
import ProductsPage from "./pages/ProductsPage/ProductsPage";
import UsersPage from "./pages/UsersPage/UsersPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import apiClient from './api/apiClient';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Проверяем валидность токена
      apiClient.get('/api/auth/me')
        .then(() => {
          setIsAuthenticated(true);
          setCurrentPage('products');
        })
        .catch(() => {
          // Токен невалиден, очищаем и показываем login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setIsAuthenticated(false);
          setCurrentPage('login');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage('products');
  };

  const handleRegisterSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage('products');
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage('login');
  };

  return (
    <div className="App">
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px' }}>
          Загрузка...
        </div>
      ) : (
        <>
          {!isAuthenticated && currentPage === 'login' && (
            <Login
              onLoginSuccess={handleLoginSuccess}
              onNavigateToRegister={() => setCurrentPage('register')}
            />
          )}
          {!isAuthenticated && currentPage === 'register' && (
            <Register
              onRegisterSuccess={handleRegisterSuccess}
              onNavigateToLogin={() => setCurrentPage('login')}
            />
          )}
          {isAuthenticated && currentPage === 'products' && (
            <ProductsPage
              onLogout={handleLogout}
              onNavigateToUsers={() => setCurrentPage('users')}
              user={user}
              setUser={setUser}
            />
          )}
          {isAuthenticated && currentPage === 'users' && (
            <UsersPage
              onLogout={handleLogout}
              onNavigateToProducts={() => setCurrentPage('products')}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;