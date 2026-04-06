import React, { useEffect, useState, useCallback } from "react";
import "./ProductsPage.scss";

import ProductsList from "../../components/ProductsList";
import ProductFormModal from "../../components/ProductFormModal";
import ProductDetailModal from "../../components/ProductDetailModal";
import apiClient from "../../api/apiClient";

export default function ProductsPage({ onLogout, onNavigateToUsers, user, setUser }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [flyingCarts, setFlyingCarts] = useState([]);
    const [userLocal, setUserLocal] = useState(user);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedProductDetail, setSelectedProductDetail] = useState(null);

    const loadUser = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/auth/me');
            setUserLocal(response.data);
            if (setUser) setUser(response.data);
        } catch (err) {
            console.error('Ошибка загрузки пользователя:', err);
        }
    }, [setUser]);

    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/products');
            setProducts(response.data);
        } catch (err) {
            alert("Ошибка загрузки товаров");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProducts();
        loadUser();
    }, [loadProducts, loadUser]);

    const categories = ["All", ...new Set(products.map(p => p.category))];

    const filteredProducts = selectedCategory === "All"
        ? products
        : products.filter(p => p.category === selectedCategory);

    const handleBuy = (product) => {
        const newCarts = Array.from({ length: 4 }, (_, i) => ({
            id: Date.now() + i,
            left: Math.random() * 60 + 20 + "%",
            delay: i * 80
        }));

        setFlyingCarts(prev => [...prev, ...newCarts]);

        setTimeout(() => {
            setFlyingCarts(prev => prev.filter(c => !newCarts.some(nc => nc.id === c.id)));
        }, 2000);

        const notification = document.createElement('div');
        notification.className = 'buy-notification';
        notification.innerHTML = `🛒 <strong>${product.name}</strong> добавлен в корзину!`;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 600);
        }, 2500);
    };

    const handleCreateClick = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm("Удалить этот товар?")) return;
        try {
            await apiClient.delete(`/api/products/${id}`);
            setProducts(products.filter(p => p.id !== id));
        } catch (err) {
            alert("Ошибка при удалении");
        }
    };

    const handleDetailClick = (product) => {
        setSelectedProductDetail(product);
    };

    const handleSaveProduct = async (formData) => {
        try {
            if (editingProduct) {
                // Обновление
                const response = await apiClient.put(`/api/products/${editingProduct.id}`, formData);
                setProducts(products.map(p => p.id === response.data.id ? response.data : p));
            } else {
                // Создание
                const response = await apiClient.post('/api/products', formData);
                setProducts([...products, response.data]);
            }
            setIsModalOpen(false);
        } catch (err) {
            alert("Ошибка при сохранении");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        onLogout();
    };

    const isSeller = userLocal && (userLocal.role === 'seller' || userLocal.role === 'admin');
    const isAdmin = userLocal && userLocal.role === 'admin';

    return (
        <div className="page">
            <header className="header">
                <div className="header__inner">
                    <div className="brand">➺ Creepypasta Store .✦ ݁˖</div>
                    <div className="header__right">
                        <span>ദ്ദി◝ ⩊ ◜.ᐟ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 ₊⊹</span>
                        {userLocal && (
                            <div className="user-info">
                                <span>{userLocal.first_name} {userLocal.last_name} ({userLocal.role})</span>
                                {isAdmin && (
                                    <button className="btn" onClick={onNavigateToUsers} style={{ marginRight: '8px' }}>
                                        👥 Управление usuarios
                                    </button>
                                )}
                                <button className="btn-logout" onClick={handleLogout}>Выход</button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="main">
                <div className="container">
                    <div className="toolbar">
                        <h1 className="title">Товары</h1>
                        {isSeller && (
                            <button className="btn btn--primary" onClick={handleCreateClick}>
                                + Создать
                            </button>
                        )}
                    </div>

                    <div className="category-filter">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="empty">Загрузка...</div>
                    ) : (
                        <ProductsList
                            products={filteredProducts}
                            onBuy={handleBuy}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                            onDetail={handleDetailClick}
                            userRole={userLocal?.role}
                        />
                    )}

                    {/* Анимация */}
                    {flyingCarts.map(cart => (
                        <div
                            key={cart.id}
                            className="flying-cart"
                            style={{ left: cart.left, animationDelay: `${cart.delay}ms` }}

                        >
                            <img src="/img/star-Photoroom.png" alt="shopping cart" style={{
                                width: '50px',
                                height: '50px',
                                filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.9))',
                                display: 'block'
                            }}></img>
                        </div>
                    ))}

                    {/* === ПОДСКАЗКА ДЛЯ АДМИНА (только через API) === */}
                    <div className="admin-info" style={{ display: 'none' }}>
                        <h3>Управление товарами</h3>
                        <p>Создавать и удалять товары можно <strong>только через API</strong> (Postman):</p>
                        <div className="api-examples">
                            <div><strong>POST</strong> http://localhost:3001/api/products — создать</div>
                            <div><strong>DELETE</strong> http://localhost:3001/api/products/:id — удалить</div>
                        </div>
                        <small>Используйте Postman или любой HTTP-клиент</small>
                    </div>
                </div>
            </main>

            {selectedProductDetail && (
                <ProductDetailModal
                    product={selectedProductDetail}
                    onClose={() => setSelectedProductDetail(null)}
                />
            )}

            {isModalOpen && (
                <ProductFormModal
                    initialData={editingProduct}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveProduct}
                />
            )}

            <footer className="footer">
                <div className="footer__inner">© {new Date().getFullYear()} Creepypasta Store ‧₊˚♪ 𝄞₊˚⊹</div>
            </footer>
        </div>
    );
}