import React, { useEffect, useState } from "react";
import "./ProductsPage.scss";

import ProductsList from "../../components/ProductsList";
import ProductFormModal from "../../components/ProductFormModal";
import { api } from "../../api";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [flyingCarts, setFlyingCarts] = useState([]);
    
    // Модальное окно
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await api.getProducts();
            setProducts(data);
        } catch (err) {
            alert("Ошибка загрузки товаров");
        } finally {
            setLoading(false);
        }
    };

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
            await api.deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (err) {
            alert("Ошибка при удалении");
        }
    };

    const handleSaveProduct = async (formData) => {
        try {
            if (editingProduct) {
                // Обновление
                const updated = await api.updateProduct(editingProduct.id, formData);
                setProducts(products.map(p => p.id === updated.id ? updated : p));
            } else {
                // Создание
                const created = await api.createProduct(formData);
                setProducts([...products, created]);
            }
            setIsModalOpen(false);
        } catch (err) {
            alert("Ошибка при сохранении");
        }
    };

    return (
        <div className="page">
            <header className="header">
                <div className="header__inner">
                    <div className="brand">➺ Creepypasta Store .✦ ݁˖</div>
                    <div className="header__right">ദ്ദി◝ ⩊ ◜.ᐟ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 ₊⊹</div>
                </div>
            </header>

            <main className="main">
                <div className="container">
                    <div className="toolbar">
                        <h1 className="title">Товары</h1>
                        <button className="btn btn--primary" onClick={handleCreateClick}>
                            + Создать
                        </button>
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
                        />
                    )}

                    {/* Анимация */}
                    {flyingCarts.map(cart => (
                        <div
                            key={cart.id}
                            className="flying-cart"
                            style={{ left: cart.left, animationDelay: `${cart.delay}ms` }}
                            
                        >
                            <img src="/img/star-Photoroom.png"  alt="shopping cart" style={{
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