import React from "react";

export default function ProductDetailModal({ product, onClose }) {
    if (!product) return null;

    return (
        <div className="backdrop" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">{product.name}</h2>
                    <button className="iconBtn" onClick={onClose}>✕</button>
                </div>
                <div className="product-detail">
                    <img src={product.photoUrl} alt={product.name} className="product-detail__image" />

                    <div className="product-detail__content">
                        <div className="product-detail__row">
                            <strong>ID:</strong> <span>{product.id}</span>
                        </div>
                        <div className="product-detail__row">
                            <strong>Категория:</strong> <span>{product.category}</span>
                        </div>
                        <div className="product-detail__row">
                            <strong>Описание:</strong> <span>{product.description}</span>
                        </div>
                        <div className="product-detail__row">
                            <strong>Цена:</strong> <span>{product.price} руб.</span>
                        </div>
                        <div className="product-detail__row">
                            <strong>В наличии:</strong> <span>{product.stock} шт.</span>
                        </div>
                        <div className="product-detail__row">
                            <strong>Рейтинг:</strong> <span>★ {product.rating}</span>
                        </div>
                    </div>
                </div>
                <div className="modal__footer">
                    <button className="btn btn--primary" onClick={onClose}>Закрыть</button>
                </div>
            </div>
        </div>
    );
}
