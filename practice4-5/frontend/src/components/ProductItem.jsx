import React, { useState } from "react";

export default function ProductItem({ product, onBuy, onEdit, onDelete }) {
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = () => {
        setIsClicked(true);
        onBuy(product);

        setTimeout(() => setIsClicked(false), 400);
    };

    return (
        <div className="productRow">
            <div className="productMain">
                <img className="productPhoto" src={product.photoUrl} alt={product.name} />
                <div className="productId">#{product.id}</div>
                <div className="productName">{product.name}</div>
                <div className="productCategory">{product.category}</div>
                <div className="productDescription">{product.description.slice(0, 50)}...</div>
                <div className="productPrice">{product.price} руб.</div>
                <div className="productStock">В наличии: {product.stock} шт.</div>
                <div className="productRating">★ {product.rating}</div>
            </div>

            <div className="productActions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                    className={`btn btn--buy ${isClicked ? 'btn--clicked' : ''}`}
                    onClick={handleClick}
                    style={{ flex: 1 }}
                >
                    Купить
                </button>
                <button className="btn" onClick={() => onEdit(product)} title="Редактировать">
                    Изменить
                </button>
                <button className="btn btn--danger" onClick={() => onDelete(product.id)} title="Удалить">
                    Удалить
                </button>
            </div>
        </div>
    );
}